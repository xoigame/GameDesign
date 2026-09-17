import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import MindMap from './components/MindMap.jsx'
import Sidebar from './components/Sidebar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import Practice from './components/Practice.jsx'
import { buildDeck, loadProgress, masteryMap } from './lib/practice.js'
import { useIsMobile, isMobileNow } from './lib/viewport.js'
import { buildFullExport, buildInterviewPack, buildPromptPlaybook } from './lib/aiContext.js'
import { t } from './lib/i18n.js'

const norm = (s) =>
  String(s || '').toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')

/** Các mức cỡ chữ cho phần đọc. 1 = mặc định. */
export const FONT_STEPS = [0.9, 1, 1.15, 1.3, 1.5]

/** Giới hạn bề rộng panel khi kéo. */
const PANEL_MIN = 320
const PANEL_MAX = 1200

function readLang() {
  try {
    const v = localStorage.getItem('gdb:lang')
    if (v === 'vi' || v === 'en' || v === 'both') return v
  } catch { /* private mode */ }
  return 'vi'
}

/** Bề rộng panel người dùng đã kéo. null = dùng mặc định theo chế độ. */
function readPanelW() {
  try {
    const v = Number(localStorage.getItem('gdb:panelW'))
    if (v >= PANEL_MIN && v <= PANEL_MAX) return v
  } catch { /* private mode */ }
  return null
}

/** Bản đồ đang xem — id node gốc của bản đồ đó (xem graph.maps). */
function readMap() {
  try {
    const v = localStorage.getItem('gdb:map')
    if (v) return v
  } catch { /* private mode */ }
  return 'root'
}

/** Chế độ xem: bản đồ kiến thức hay luyện phỏng vấn. */
function readView() {
  try {
    const v = localStorage.getItem('gdb:view')
    if (v === 'map' || v === 'practice') return v
  } catch { /* private mode */ }
  return 'map'
}

function readFontScale() {
  try {
    const v = Number(localStorage.getItem('gdb:fontScale'))
    if (FONT_STEPS.includes(v)) return v
  } catch { /* private mode: dùng mặc định */ }
  return 1
}

const MODES = [
  { id: 'mindmap', key: 'modeMindmap', hint: 'modeMindmapHint' },
  { id: 'tree', key: 'modeTree', hint: 'modeTreeHint' },
  { id: 'radial', key: 'modeRadial', hint: 'modeRadialHint' },
]

export default function App() {
  const [graph, setGraph] = useState(null)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [collapsed, setCollapsed] = useState(() => new Set())
  // Màn hẹp mặc định xem kiểu 'tree': một cột trái→phải, vừa khung dọc của điện
  // thoại. Kiểu 'mindmap' toả hai bên cần bề ngang gấp đôi nên bị thu nhỏ tới mức
  // không đọc được. Người dùng vẫn đổi được bằng thanh chế độ.
  const [mode, setMode] = useState(() => (isMobileNow() ? 'tree' : 'mindmap'))
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState(() => new Set())
  const [activeLevels, setActiveLevels] = useState(() => new Set())
  const [showRelations, setShowRelations] = useState(false)
  const [navOpen, setNavOpen] = useState(false)   // drawer sidebar trên mobile
  const [fontScale, setFontScale] = useState(readFontScale)
  const [lang, setLang] = useState(readLang)
  const [panelW, setPanelW] = useState(readPanelW)
  const [resizing, setResizing] = useState(false)
  const [view, setView] = useState(readView)
  const [mapId, setMapId] = useState(readMap)
  const [practiceProgress, setPracticeProgress] = useState(loadProgress)
  const isMobile = useIsMobile()

  useEffect(() => {
    try { localStorage.setItem('gdb:lang', lang) } catch { /* private mode */ }
    document.documentElement.lang = lang === 'en' ? 'en' : 'vi'
  }, [lang])

  useEffect(() => {
    const root = document.documentElement
    if (panelW === null) root.style.removeProperty('--panel-w')
    else root.style.setProperty('--panel-w', panelW + 'px')
    try {
      if (panelW === null) localStorage.removeItem('gdb:panelW')
      else localStorage.setItem('gdb:panelW', String(panelW))
    } catch { /* private mode */ }
  }, [panelW])

  /**
   * Kéo mép trái panel để đổi bề rộng.
   * Dùng Pointer Events nên chạy cả chuột lẫn cảm ứng; setPointerCapture giữ
   * được sự kiện kể cả khi con trỏ đi ra ngoài phần tử.
   */
  const startResize = useCallback((e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setResizing(true)

    const onMove = (ev) => {
      // panel nằm sát mép phải: bề rộng = khoảng cách từ con trỏ tới mép phải
      const w = Math.round(window.innerWidth - ev.clientX)
      setPanelW(Math.min(PANEL_MAX, Math.max(PANEL_MIN, w)))
    }
    const onUp = () => {
      setResizing(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }, [])
  const searchRef = useRef(null)

  // Cỡ chữ áp qua biến CSS --fs; mọi rule chữ trong panel nhân với nó.
  useEffect(() => {
    document.documentElement.style.setProperty('--fs', String(fontScale))
    try { localStorage.setItem('gdb:fontScale', String(fontScale)) } catch { /* private mode */ }
  }, [fontScale])

  /* ------------------------------- load data ------------------------------ */
  useEffect(() => {
    const url = (import.meta.env.BASE_URL || '/') + 'data/graph.json'
    fetch(url, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then((g) => {
        setGraph(g)
        // Mặc định: mở gốc + các nhánh lớn, thu gọn từ tầng 2 trở xuống.
        // Màn hẹp thu gọn sớm hơn một tầng — 12 node thay vì 67 — vì mức zoom khi
        // canh khung tỉ lệ nghịch với số node đang hiện.
        const minDepth = isMobileNow() ? 1 : 2
        const init = new Set()
        for (const n of g.nodes) if (n.depth >= minDepth && n.children.length) init.add(n.id)
        setCollapsed(init)
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    try { localStorage.setItem('gdb:view', view) } catch { /* private mode */ }
  }, [view])

  // Bản đồ đang xem phải có thật trong graph.maps — dữ liệu đổi thì lùi về gốc.
  useEffect(() => {
    if (!graph) return
    if (!(graph.maps || []).some((m) => m.id === mapId)) { setMapId(graph.root); return }
    try { localStorage.setItem('gdb:map', mapId) } catch { /* private mode */ }
  }, [graph, mapId])

  const nodesById = useMemo(() => {
    const m = new Map()
    if (graph) for (const n of graph.nodes) m.set(n.id, n)
    return m
  }, [graph])

  /* Các bản đồ tách riêng — nhánh khai `map: true` ở frontmatter. Gốc luôn đứng đầu. */
  const maps = graph ? (graph.maps || []) : []
  const mapRoots = useMemo(() => {
    if (!graph) return new Set()
    return new Set((graph.maps || []).filter((m) => m.id !== graph.root).map((m) => m.id))
  }, [graph])

  /* Lớp phủ "mức thuộc" trên mindmap: lấy từ tiến độ luyện phỏng vấn. */
  const mastery = useMemo(() => {
    if (!graph) return null
    return masteryMap(buildDeck(graph, nodesById), practiceProgress)
  }, [graph, nodesById, practiceProgress])

  /* -------------------------------- filter -------------------------------- */
  const matchSet = useMemo(() => {
    if (!graph) return null
    const q = norm(query.trim())
    const hasQ = q.length > 0
    const hasT = activeTags.size > 0
    const hasL = activeLevels.size > 0
    if (!hasQ && !hasT && !hasL) return null

    const out = new Set()
    for (const n of graph.nodes) {
      if (hasL && !activeLevels.has(n.level)) continue
      if (hasT && !n.tags.some((t) => activeTags.has(t))) continue
      if (hasQ) {
        // luôn tìm trên CẢ HAI ngôn ngữ: gõ "behavior tree" phải ra kết quả
        // kể cả khi đang xem bản tiếng Việt
        const en = n.i18n.en
        const hay = norm(
          [n.title, n.summary, n.tags.join(' '), n.id, n.body, n.aiPrompt, n.unity, n.code,
           en && en.title, en && en.summary, en && en.body].filter(Boolean).join(' ')
        )
        if (!hay.includes(q)) continue
      }
      out.add(n.id)
    }
    return out
  }, [graph, query, activeTags, activeLevels])

  const keepSet = useMemo(() => {
    if (!matchSet || !graph) return null
    const keep = new Set()
    for (const id of matchSet) {
      let cur = id
      while (cur && !keep.has(cur)) {
        keep.add(cur)
        const n = nodesById.get(cur)
        cur = n ? n.parent : null
      }
    }
    keep.add(graph.root)
    return keep
  }, [matchSet, graph, nodesById])

  /* Đang lọc thì đếm kết quả theo từng bản đồ — để thấy kết quả nằm ở bản đồ nào. */
  const matchesPerMap = useMemo(() => {
    if (!matchSet) return null
    const out = new Map()
    for (const id of matchSet) {
      const n = nodesById.get(id)
      if (!n) continue
      out.set(n.mapId, (out.get(n.mapId) || 0) + 1)
    }
    return out
  }, [matchSet, nodesById])

  /* ------------------------------- handlers ------------------------------- */
  const toggle = useCallback((id) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const select = useCallback((id) => {
    setSelectedId(id)
    setNavOpen(false)          // chọn xong thì đóng drawer trên mobile
    if (!id) return
    // Node thuộc bản đồ khác (Unity / Cocos / Backend Go) thì chuyển bản đồ luôn —
    // không thì bấm ở sidebar mà mindmap đứng im, trông như hỏng.
    const target = nodesById.get(id)
    if (target && target.mapId) setMapId(target.mapId)
    // mở đường dẫn tới node được chọn
    setCollapsed((prev) => {
      const next = new Set(prev)
      let cur = id
      while (cur) {
        next.delete(cur)
        const n = nodesById.get(cur)
        cur = n ? n.parent : null
      }
      return next
    })
  }, [nodesById])

  const toggleTag = useCallback((t) => {
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }, [])

  const toggleLevel = useCallback((lv) => {
    setActiveLevels((prev) => {
      const next = new Set(prev)
      if (next.has(lv)) next.delete(lv)
      else next.add(lv)
      return next
    })
  }, [])

  /** Đổi bản đồ, và mở sẵn gốc của nó để không rơi vào một node đang thu gọn. */
  const openMap = useCallback((id) => {
    setMapId(id)
    setCollapsed((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const expandAll = () => setCollapsed(new Set())
  const collapseAll = () => {
    if (!graph) return
    const s = new Set()
    for (const n of graph.nodes) if (n.depth >= 1 && n.children.length) s.add(n.id)
    setCollapsed(s)
  }

  const download = (text, filename) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  const exportAll = () => {
    if (graph) download(buildFullExport(graph, nodesById), 'gamedesign-brain-full.md')
  }

  const exportPlaybook = () => {
    if (graph) download(buildPromptPlaybook(graph, nodesById), 'gamedesign-brain-prompts.md')
  }

  const exportInterview = () => {
    if (graph) download(buildInterviewPack(graph, nodesById), 'gamedesign-brain-interview.md')
  }

  /* ------------------------------- keyboard ------------------------------- */
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName)
      if (e.key === '/' && !typing) { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'Escape') {
        if (typing) { e.target.blur(); return }
        if (navOpen) setNavOpen(false)
        else if (query) setQuery('')
        else if (activeTags.size || activeLevels.size) { setActiveTags(new Set()); setActiveLevels(new Set()) }
        else setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [query, activeTags, activeLevels, navOpen])

  /* --------------------------------- views -------------------------------- */
  if (error) {
    return (
      <div className="boot boot-error">
        <h2>{t('bootFail', 'vi')}</h2>
        <p><code>{error}</code></p>
        <p>{t('bootRun', 'vi')} <code>npm run graph</code> {t('bootThen', 'vi')} <code>npm run dev</code>.</p>
      </div>
    )
  }
  if (!graph) return <div className="boot"><span className="spinner" />{t('loading', lang)}</div>

  const selected = selectedId ? nodesById.get(selectedId) : null

  return (
    <div className={'app' + (selected ? ' has-panel' : '') + (navOpen ? ' nav-open' : '') + (lang === 'both' ? ' lang-both' : '') + (resizing ? ' is-resizing' : '')}>
      {navOpen && (
        <button className="scrim" onClick={() => setNavOpen(false)} aria-label={t('closeMenu', lang)} />
      )}

      <Sidebar
        graph={graph}
        nodesById={nodesById}
        rootId={graph.root}
        selectedId={selectedId}
        onSelect={select}
        query={query}
        setQuery={setQuery}
        searchRef={searchRef}
        activeTags={activeTags}
        toggleTag={toggleTag}
        activeLevels={activeLevels}
        toggleLevel={toggleLevel}
        lang={lang}
        setLang={setLang}
        collapsed={collapsed}
        onToggle={toggle}
        matchSet={matchSet}
        onExport={exportAll}
        onExportPlaybook={exportPlaybook}
        onExportInterview={exportInterview}
      />

      <main className="canvas">
        <button
          className="nav-toggle"
          onClick={() => setNavOpen((v) => !v)}
          aria-label={t('openMenu', lang)}
          title={t('openMenu', lang)}
        >☰</button>

        <div className="topbar">
          <div className="seg">
            <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')}
                    title={t('viewMapTitle', lang)}>{t('viewMap', lang)}</button>
            <button className={view === 'practice' ? 'on' : ''} onClick={() => setView('practice')}
                    title={t('viewPracticeTitle', lang)}>{t('viewPractice', lang)}</button>
          </div>
          {view === 'map' && maps.length > 1 && (
            <div className="seg seg-maps" role="group" aria-label={t('mapPick', lang)}>
              {maps.map((m) => {
                const hits = matchesPerMap ? matchesPerMap.get(m.id) || 0 : 0
                const isRootMap = m.id === graph.root
                return (
                  <button
                    key={m.id}
                    className={mapId === m.id ? 'on' : ''}
                    onClick={() => openMap(m.id)}
                    title={(isRootMap ? t('mapMainTitle', lang) : m.title) + ' · ' + m.nodes + ' node'}
                  >
                    {m.icon ? m.icon + ' ' : ''}{isRootMap ? t('mapMain', lang) : m.label}
                    {hits > 0 && <span className="seg-count">{hits}</span>}
                  </button>
                )
              })}
            </div>
          )}
          {view === 'map' && (
            <div className="seg">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={mode === m.id ? 'on' : ''}
                  onClick={() => setMode(m.id)}
                  title={t(m.hint, lang)}
                >{t(m.key, lang)}</button>
              ))}
            </div>
          )}
          {view === 'map' && (
          <div className="topbar-right">
            <button className="tbtn" onClick={expandAll} title={t('expandAllTitle', lang)}>{t('expandAll', lang)}</button>
            <button className="tbtn" onClick={collapseAll} title={t('collapseAllTitle', lang)}>{t('collapseAll', lang)}</button>
            <button
              className={'tbtn' + (showRelations ? ' on' : '')}
              onClick={() => setShowRelations((v) => !v)}
              title={t('allRelationsTitle', lang)}
            >{t('allRelations', lang)}</button>
          </div>
          )}
        </div>

        {view === 'practice' ? (
          <Practice
            graph={graph}
            nodesById={nodesById}
            lang={lang}
            onSelect={select}
            onProgress={setPracticeProgress}
          />
        ) : (
        <ReactFlowProvider>
          <MindMap
            nodesById={nodesById}
            rootId={mapId}
            mapRoots={mapRoots}
            relations={graph.relations}
            collapsed={collapsed}
            onToggle={toggle}
            selectedId={selectedId}
            onSelect={select}
            mode={mode}
            keepSet={keepSet}
            showRelations={showRelations}
            lang={lang}
            mastery={mastery}
            compact={isMobile}
          />
        </ReactFlowProvider>
        )}
      </main>

      {selected && (
        <div
          className="panel-resizer"
          onPointerDown={startResize}
          onDoubleClick={() => setPanelW(null)}
          role="separator"
          aria-orientation="vertical"
          aria-label={lang === 'en' ? 'Resize panel' : 'Kéo để đổi bề rộng panel'}
          title={lang === 'en'
            ? 'Drag to resize · double-click to reset'
            : 'Kéo để đổi bề rộng · bấm đúp để về mặc định'}
        />
      )}

      {selected && (
        <DetailPanel
          node={selected}
          nodesById={nodesById}
          relations={graph.relations}
          readingPath={graph.readingPath}
          glossary={graph.glossary}
          fontScale={fontScale}
          setFontScale={setFontScale}
          lang={lang}
          setLang={setLang}
          onSelect={select}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
