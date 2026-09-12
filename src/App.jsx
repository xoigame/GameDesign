import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import MindMap from './components/MindMap.jsx'
import Sidebar from './components/Sidebar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import Practice from './components/Practice.jsx'
import { buildDeck, loadProgress, masteryMap } from './lib/practice.js'
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
  { id: 'mindmap', key: 'modeMindmap', hint: 'Toả hai bên quanh gốc' },
  { id: 'tree', key: 'modeTree', hint: 'Trái sang phải' },
  { id: 'radial', key: 'modeRadial', hint: 'Vòng tròn quanh gốc' },
]

export default function App() {
  const [graph, setGraph] = useState(null)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [mode, setMode] = useState('mindmap')
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
  const [practiceProgress, setPracticeProgress] = useState(loadProgress)

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
        // mặc định: mở gốc + các nhánh lớn, thu gọn từ tầng 2 trở xuống
        const init = new Set()
        for (const n of g.nodes) if (n.depth >= 2 && n.children.length) init.add(n.id)
        setCollapsed(init)
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    try { localStorage.setItem('gdb:view', view) } catch { /* private mode */ }
  }, [view])

  const nodesById = useMemo(() => {
    const m = new Map()
    if (graph) for (const n of graph.nodes) m.set(n.id, n)
    return m
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
        <h2>Không nạp được dữ liệu</h2>
        <p><code>{error}</code></p>
        <p>Chạy <code>npm run graph</code> để sinh <code>public/data/graph.json</code>, rồi <code>npm run dev</code>.</p>
      </div>
    )
  }
  if (!graph) return <div className="boot"><span className="spinner" />{t('loading', lang)}</div>

  const selected = selectedId ? nodesById.get(selectedId) : null

  return (
    <div className={'app' + (selected ? ' has-panel' : '') + (navOpen ? ' nav-open' : '') + (lang === 'both' ? ' lang-both' : '') + (resizing ? ' is-resizing' : '')}>
      {navOpen && (
        <button className="scrim" onClick={() => setNavOpen(false)} aria-label="Đóng menu" />
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
          aria-label="Mở danh mục"
          title={t('openMenu', lang)}
        >☰</button>

        <div className="topbar">
          <div className="seg">
            <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')}
                    title="Bản đồ kiến thức">{t('viewMap', lang)}</button>
            <button className={view === 'practice' ? 'on' : ''} onClick={() => setView('practice')}
                    title="Hỏi — tự trả lời thành tiếng — tự chấm">{t('viewPractice', lang)}</button>
          </div>
          {view === 'map' && (
            <div className="seg">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={mode === m.id ? 'on' : ''}
                  onClick={() => setMode(m.id)}
                  title={m.hint}
                >{t(m.key, lang)}</button>
              ))}
            </div>
          )}
          {view === 'map' && (
          <div className="topbar-right">
            <button className="tbtn" onClick={expandAll} title="Mở hết">{t('expandAll', lang)}</button>
            <button className="tbtn" onClick={collapseAll} title="Thu gọn hết">{t('collapseAll', lang)}</button>
            <button
              className={'tbtn' + (showRelations ? ' on' : '')}
              onClick={() => setShowRelations((v) => !v)}
              title="Hiện TẤT CẢ liên kết ngang. Mặc định chỉ hiện liên kết của node đang chọn."
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
            rootId={graph.root}
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
          onSelect={select}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
