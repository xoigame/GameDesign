import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import MindMap from './components/MindMap.jsx'
import Sidebar from './components/Sidebar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import { buildFullExport, buildPromptPlaybook } from './lib/aiContext.js'

const norm = (s) =>
  String(s || '').toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')

const MODES = [
  { id: 'mindmap', label: 'Mindmap', hint: 'Toả hai bên quanh gốc' },
  { id: 'tree', label: 'Cây', hint: 'Trái sang phải' },
  { id: 'radial', label: 'Toả tròn', hint: 'Vòng tròn quanh gốc' },
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
  const searchRef = useRef(null)

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

  const nodesById = useMemo(() => {
    const m = new Map()
    if (graph) for (const n of graph.nodes) m.set(n.id, n)
    return m
  }, [graph])

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
        const hay = norm(
          n.title + ' ' + n.summary + ' ' + n.tags.join(' ') + ' ' +
          n.id + ' ' + n.body + ' ' + n.aiPrompt
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
  if (!graph) return <div className="boot"><span className="spinner" />Đang nạp kho kiến thức…</div>

  const selected = selectedId ? nodesById.get(selectedId) : null

  return (
    <div className={'app' + (selected ? ' has-panel' : '') + (navOpen ? ' nav-open' : '')}>
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
        collapsed={collapsed}
        onToggle={toggle}
        matchSet={matchSet}
        onExport={exportAll}
        onExportPlaybook={exportPlaybook}
      />

      <main className="canvas">
        <button
          className="nav-toggle"
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Mở danh mục"
          title="Danh mục · lộ trình đọc"
        >☰</button>

        <div className="topbar">
          <div className="seg">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={mode === m.id ? 'on' : ''}
                onClick={() => setMode(m.id)}
                title={m.hint}
              >{m.label}</button>
            ))}
          </div>
          <div className="topbar-right">
            <button className="tbtn" onClick={expandAll} title="Mở hết">⤢ Mở hết</button>
            <button className="tbtn" onClick={collapseAll} title="Thu gọn hết">⤡ Thu gọn</button>
            <button
              className={'tbtn' + (showRelations ? ' on' : '')}
              onClick={() => setShowRelations((v) => !v)}
              title="Hiện TẤT CẢ liên kết ngang. Mặc định chỉ hiện liên kết của node đang chọn."
            >⇢ Mọi liên kết</button>
          </div>
        </div>

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
          />
        </ReactFlowProvider>
      </main>

      {selected && (
        <DetailPanel
          node={selected}
          nodesById={nodesById}
          relations={graph.relations}
          readingPath={graph.readingPath}
          onSelect={select}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
