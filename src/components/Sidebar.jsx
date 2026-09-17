import { useMemo, useState } from 'react'
import { LEVELS, LEVEL_GLYPH, levelHint, levelLabel } from '../lib/levels.js'
import { LANG_MODES, t, text as tx } from '../lib/i18n.js'

export default function Sidebar({
  graph, nodesById, rootId, selectedId, onSelect,
  query, setQuery, searchRef, activeTags, toggleTag,
  collapsed, onToggle, matchSet, onExport, onExportPlaybook, onExportInterview,
  activeLevels, toggleLevel, lang, setLang,
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
          <span className="tree-label">{n.icon ? n.icon + ' ' : ''}{tx(n, 'title', lang)}</span>
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
          <div className="brand-text">
            <strong>GameDesign Brain</strong>
            <small>Game Design &amp; AI in Games</small>
          </div>
        </div>
        <div className="lang-switch" role="group" aria-label={t('langTitle', lang)}>
          {LANG_MODES.map((m) => (
            <button
              key={m.id}
              className={lang === m.id ? 'on' : ''}
              onClick={() => setLang(m.id)}
              title={m.title}
              aria-pressed={lang === m.id}
            >{m.label}</button>
          ))}
        </div>
      </header>

      <div className="search-wrap">
        <input
          ref={searchRef}
          className="search"
          placeholder={t('searchPlaceholder', lang)}
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
            title={levelHint(lv, lang)}
          >
            <span className="lvglyph">{LEVEL_GLYPH[lv]}</span>
            {levelLabel(lv, lang)}
            <b>{graph.stats[lv]}</b>
          </button>
        ))}
      </div>

      <div className="tabs">
        <button className={tab === 'path' ? 'on' : ''} onClick={() => setTab('path')}>{t('tabPath', lang)}</button>
        <button className={tab === 'tree' ? 'on' : ''} onClick={() => setTab('tree')}>{t('tabTree', lang)}</button>
        <button className={tab === 'branch' ? 'on' : ''} onClick={() => setTab('branch')}>{t('tabBranch', lang)}</button>
      </div>

      <div className="side-scroll">
        {matchSet ? (
          <div className="results">
            <div className="results-head">{matchSet.size} {t('results', lang)}</div>
            {results.map((n) => (
              <div
                key={n.id}
                className={'result' + (n.id === selectedId ? ' is-active' : '')}
                style={{ '--accent': n.color }}
                onClick={() => onSelect(n.id)}
              >
                <div className="result-title"><span className="path-num">{n.readIndex}</span>{n.icon ? ' ' + n.icon : ''} {tx(n, 'title', lang)}</div>
                {tx(n, 'summary', lang) && <div className="result-sum">{tx(n, 'summary', lang)}</div>}
              </div>
            ))}
            {!results.length && <div className="empty">{t('noResults', lang)}</div>}
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
                  title={tx(n, 'summary', lang)}
                >
                  <span className="path-num">{n.readIndex}</span>
                  <span className="path-glyph" title={levelLabel(n.level, lang)}>
                    {LEVEL_GLYPH[n.level] || '·'}
                  </span>
                  <span className="path-label">{n.icon ? n.icon + ' ' : ''}{tx(n, 'title', lang)}</span>
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
                    <strong>{tx(b, 'title', lang)}</strong>
                    <small>{tx(b, 'summary', lang) || `${count} node`}</small>
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
          <span><b>{graph.stats.nodes}</b> {t('node', lang)}</span>
          <span><b>{graph.stats.deep}</b> {t('deep', lang)}</span>
          <span><b>{graph.stats.stub}</b> {t('stub', lang)}</span>
          <span><b>{graph.stats.words.toLocaleString('vi-VN')}</b> {t('words', lang)}</span>
        </div>
        <button
          className="btn wide"
          onClick={onExportPlaybook}
          title={t('exportPlaybookTitle', lang)}
        >{t('exportPlaybook', lang)}</button>
        <button
          className="btn ghost wide"
          onClick={onExportInterview}
          title={t('exportInterviewTitle', lang)}
        >{t('exportInterview', lang)}</button>
        <button
          className="btn ghost wide"
          onClick={onExport}
          title={t('exportAllTitle', lang)}
        >{t('exportAll', lang)}</button>
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
