import { useMemo, useState } from 'react'
import { LEVELS, LEVEL_VI, LEVEL_GLYPH, LEVEL_HINT } from '../lib/levels.js'

export default function Sidebar({
  graph, nodesById, rootId, selectedId, onSelect,
  query, setQuery, searchRef, activeTags, toggleTag,
  collapsed, onToggle, matchSet, onExport, onExportPlaybook,
  activeLevels, toggleLevel,
}) {
  const [tab, setTab] = useState('path')
  const root = nodesById.get(rootId)
  const branches = root ? root.children.map((id) => nodesById.get(id)).filter(Boolean) : []

  const results = useMemo(() => {
    if (!matchSet) return []
    return [...matchSet]
      .map((id) => nodesById.get(id))
      .filter(Boolean)
      .sort((a, b) => a.readIndex - b.readIndex)
      .slice(0, 60)
  }, [matchSet, nodesById])

  const TreeItem = ({ id, depth }) => {
    const n = nodesById.get(id)
    if (!n) return null
    const isOpen = !collapsed.has(id)
    const hasKids = n.children.length > 0
    return (
      <>
        <div
          className={'tree-item' + (id === selectedId ? ' is-active' : '')}
          style={{ paddingLeft: 6 + depth * 13, '--accent': n.color }}
          onClick={() => onSelect(id)}
        >
          {hasKids ? (
            <button
              className={'tree-caret' + (isOpen ? ' open' : '')}
              onClick={(e) => { e.stopPropagation(); onToggle(id) }}
            >▸</button>
          ) : <span className="tree-caret placeholder" />}
          <span className="tree-dot" />
          <span className="tree-label">{n.icon ? n.icon + ' ' : ''}{n.title}</span>
          {n.status === 'stub' && <span className="tree-stub" title="stub">·</span>}
        </div>
        {isOpen && n.children.map((c) => <TreeItem key={c} id={c} depth={depth + 1} />)}
      </>
    )
  }

  return (
    <aside className="sidebar">
      <header className="side-head">
        <div className="brand">
          <span className="brand-mark">🧠</span>
          <div>
            <strong>GameDesign Brain</strong>
            <small>Game Design &amp; AI in Games</small>
          </div>
        </div>
      </header>

      <div className="search-wrap">
        <input
          ref={searchRef}
          className="search"
          placeholder="Tìm kiến thức…  ( / )"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && <button className="search-clear" onClick={() => setQuery('')}>✕</button>}
      </div>

      {graph.tags.length > 0 && (
        <div className="tagbar">
          {graph.tags.map((t) => (
            <button
              key={t}
              className={'tag' + (activeTags.has(t) ? ' is-on' : '')}
              onClick={() => toggleTag(t)}
            >#{t}</button>
          ))}
        </div>
      )}

      <div className="levelbar">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            className={'lvchip lv-' + lv + (activeLevels.has(lv) ? ' is-on' : '')}
            onClick={() => toggleLevel(lv)}
            title={LEVEL_HINT[lv]}
          >
            <span className="lvglyph">{LEVEL_GLYPH[lv]}</span>
            {LEVEL_VI[lv]}
            <b>{graph.stats[lv]}</b>
          </button>
        ))}
      </div>

      <div className="tabs">
        <button className={tab === 'path' ? 'on' : ''} onClick={() => setTab('path')}>Lộ trình</button>
        <button className={tab === 'tree' ? 'on' : ''} onClick={() => setTab('tree')}>Cây</button>
        <button className={tab === 'branch' ? 'on' : ''} onClick={() => setTab('branch')}>Nhánh</button>
      </div>

      <div className="side-scroll">
        {matchSet ? (
          <div className="results">
            <div className="results-head">{matchSet.size} kết quả</div>
            {results.map((n) => (
              <div
                key={n.id}
                className={'result' + (n.id === selectedId ? ' is-active' : '')}
                style={{ '--accent': n.color }}
                onClick={() => onSelect(n.id)}
              >
                <div className="result-title"><span className="path-num">{n.readIndex}</span>{n.icon ? ' ' + n.icon : ''} {n.title}</div>
                {n.summary && <div className="result-sum">{n.summary}</div>}
              </div>
            ))}
            {!results.length && <div className="empty">Không tìm thấy gì.</div>}
          </div>
        ) : tab === 'path' ? (
          <div className="path-list">
            {graph.readingPath.map((id) => {
              const n = nodesById.get(id)
              if (!n) return null
              return (
                <div
                  key={id}
                  className={'path-item lv-' + (n.level || 'none') + (id === selectedId ? ' is-active' : '')}
                  style={{ '--accent': n.color }}
                  onClick={() => onSelect(id)}
                  title={n.summary}
                >
                  <span className="path-num">{n.readIndex}</span>
                  <span className="path-glyph" title={LEVEL_VI[n.level]}>
                    {LEVEL_GLYPH[n.level] || '·'}
                  </span>
                  <span className="path-label">{n.icon ? n.icon + ' ' : ''}{n.title}</span>
                  {n.status === 'stub' && <span className="tree-stub" title="stub">·</span>}
                </div>
              )
            })}
          </div>
        ) : tab === 'tree' ? (
          <div className="tree">
            <TreeItem id={rootId} depth={0} />
          </div>
        ) : (
          <div className="branches">
            {branches.map((b) => {
              const count = countDescendants(b.id, nodesById)
              return (
                <button
                  key={b.id}
                  className={'branch-card' + (b.id === selectedId ? ' is-active' : '')}
                  style={{ '--accent': b.color }}
                  onClick={() => onSelect(b.id)}
                >
                  <span className="branch-icon">{b.icon || '◆'}</span>
                  <span className="branch-main">
                    <strong>{b.title}</strong>
                    <small>{b.summary || `${count} node`}</small>
                  </span>
                  <span className="branch-count">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <footer className="side-foot">
        <div className="stats">
          <span><b>{graph.stats.nodes}</b> node</span>
          <span><b>{graph.stats.deep}</b> deep</span>
          <span><b>{graph.stats.stub}</b> stub</span>
          <span><b>{graph.stats.words.toLocaleString('vi-VN')}</b> từ</span>
        </div>
        <button
          className="btn wide"
          onClick={onExportPlaybook}
          title="Chỉ phần hướng dẫn viết prompt của mọi node — nhỏ gọn, dán thẳng vào chat"
        >🤖 Xuất playbook prompt (.md)</button>
        <button
          className="btn ghost wide"
          onClick={onExport}
          title="Toàn bộ kiến thức + prompt — dùng khi AI không đọc được ổ đĩa"
        >⭳ Xuất toàn bộ kho (.md)</button>
      </footer>
    </aside>
  )
}

function countDescendants(id, nodesById) {
  const n = nodesById.get(id)
  if (!n) return 0
  let total = 0
  for (const c of n.children) total += 1 + countDescendants(c, nodesById)
  return total
}
