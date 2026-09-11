import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { buildAiContext } from '../lib/aiContext.js'
import { LEVEL_VI, LEVEL_GLYPH, LEVEL_HINT } from '../lib/levels.js'

/** Biến link `#id` (từ wiki-link [[id]]) thành nút điều hướng trong app. */
const mdComponents = (onSelect) => ({
  a: ({ href, children, ...rest }) => {
    if (href && href.startsWith('#')) {
      return (
        <a href={href} className="wikilink"
           onClick={(e) => { e.preventDefault(); onSelect(href.slice(1)) }} {...rest}>
          {children}
        </a>
      )
    }
    return <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>
  },
})

export default function DetailPanel({ node, nodesById, relations, readingPath, onSelect, onClose }) {
  const [copied, setCopied] = useState('')

  // Điều hướng theo lộ trình đọc, không theo cây thư mục.
  const { prev, next } = useMemo(() => {
    const i = readingPath.indexOf(node.id)
    if (i === -1) return { prev: null, next: null }
    return {
      prev: i > 0 ? nodesById.get(readingPath[i - 1]) : null,
      next: i < readingPath.length - 1 ? nodesById.get(readingPath[i + 1]) : null,
    }
  }, [node.id, readingPath, nodesById])

  const breadcrumb = useMemo(() => {
    const chain = []
    let cur = node.parent
    while (cur) {
      const n = nodesById.get(cur)
      if (!n) break
      chain.unshift(n)
      cur = n.parent
    }
    return chain
  }, [node, nodesById])

  // [[id]] -> [Tiêu đề](#id)
  const body = useMemo(() => {
    return node.body.replace(/\[\[([A-Za-z0-9-]+)\]\]/g, (m, id) => {
      const t = nodesById.get(id)
      return t ? `[${t.title}](#${t.id})` : m
    })
  }, [node, nodesById])

  const linked = useMemo(() => {
    const ids = new Set()
    for (const r of relations) {
      if (r.source === node.id) ids.add(r.target)
      else if (r.target === node.id) ids.add(r.source)
    }
    return [...ids].map((id) => nodesById.get(id)).filter(Boolean)
  }, [node, relations, nodesById])

  const children = node.children.map((id) => nodesById.get(id)).filter(Boolean)

  const aiPrompt = useMemo(() => {
    if (!node.aiPrompt) return ''
    return node.aiPrompt.replace(/\[\[([A-Za-z0-9-]+)\]\]/g, (m, id) => {
      const t = nodesById.get(id)
      return t ? `[${t.title}](#${t.id})` : m
    })
  }, [node, nodesById])

  const copy = async (kind) => {
    const text = kind === 'prompt'
      ? node.aiPrompt
      : buildAiContext(node, nodesById, { subtree: kind === 'subtree' })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(''), 1600)
    } catch {
      setCopied('err')
      setTimeout(() => setCopied(''), 1600)
    }
  }

  return (
    <aside className="panel" style={{ '--accent': node.color }}>
      <div className="panel-head">
        <div className="crumbs">
          {breadcrumb.map((b) => (
            <button key={b.id} className="crumb" onClick={() => onSelect(b.id)}>{b.title}</button>
          ))}
        </div>
        <button className="icon-btn" onClick={onClose} title="Đóng (Esc)">✕</button>
      </div>

      <h1 className="panel-title">
        {node.icon ? <span className="panel-icon">{node.icon}</span> : null}
        {node.title}
      </h1>

      {node.summary ? <p className="panel-summary">{node.summary}</p> : null}

      <div className="panel-meta">
        <span className="chip read" title="Thứ tự trong lộ trình đọc">#{node.readIndex}</span>
        <span className={'chip lv lv-' + (node.level || 'none')} title={LEVEL_HINT[node.level]}>
          {LEVEL_GLYPH[node.level] || '·'} {LEVEL_VI[node.level] || 'chưa phân loại'}
        </span>
        <span className={'chip status-' + node.status}>{node.status === 'deep' ? 'đã viết sâu' : 'stub'}</span>
        {node.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
        <span className="chip ghost">{node.words} từ</span>
        <code className="chip path">content/{node.path}</code>
      </div>

      <div className="panel-actions">
        <button className="btn" onClick={() => copy('node')}>
          {copied === 'node' ? '✓ Đã copy' : 'Copy cho AI'}
        </button>
        {children.length > 0 && (
          <button className="btn ghost" onClick={() => copy('subtree')}>
            {copied === 'subtree' ? '✓ Đã copy' : `Copy cả nhánh (${children.length})`}
          </button>
        )}
        {copied === 'err' && <span className="copy-err">Không copy được — hãy dùng HTTPS/localhost</span>}
      </div>

      <div className="panel-body md">
        {body
          ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents(onSelect)}>
              {body}
            </ReactMarkdown>
          : <p className="empty">Node này chưa có nội dung. Mở <code>content/{node.path}</code> và viết thêm.</p>}
      </div>

      <section className="ai-block">
        <header className="ai-head">
          <span className="ai-title">🤖 Prompt cho AI</span>
          {aiPrompt && (
            <button className="ai-copy" onClick={() => copy('prompt')}>
              {copied === 'prompt' ? '✓ Đã copy' : 'Copy mục này'}
            </button>
          )}
        </header>
        {aiPrompt
          ? <div className="md ai-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents(onSelect)}>
                {aiPrompt}
              </ReactMarkdown>
            </div>
          : <p className="empty">
              Node này chưa có hướng dẫn viết prompt. Thêm mục <code>## 🤖 Prompt cho AI</code> vào
              cuối <code>content/{node.path}</code>.
            </p>}
      </section>

      {children.length > 0 && (
        <section className="panel-section">
          <h3>Node con</h3>
          <div className="pill-row">
            {children.map((c) => (
              <button key={c.id} className="pill" style={{ '--accent': c.color }} onClick={() => onSelect(c.id)}>
                {c.icon ? c.icon + ' ' : ''}{c.title}
                {c.status === 'stub' && <span className="pill-dot" />}
              </button>
            ))}
          </div>
        </section>
      )}

      {node.refs.length > 0 && (
        <section className="panel-section">
          <h3>Nguồn tham khảo</h3>
          <ul className="ref-list">
            {node.refs.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>
      )}

      {(prev || next) && (
        <section className="panel-section">
          <h3>Lộ trình đọc</h3>
          <div className="path-nav">
            {prev
              ? <button className="pathnav-btn" onClick={() => onSelect(prev.id)}>
                  <span className="pn-dir">← #{prev.readIndex}</span>
                  <span className="pn-title">{prev.title}</span>
                </button>
              : <span />}
            {next && (
              <button className="pathnav-btn next" onClick={() => onSelect(next.id)}>
                <span className="pn-dir">#{next.readIndex} →</span>
                <span className="pn-title">{next.title}</span>
              </button>
            )}
          </div>
        </section>
      )}

      {linked.length > 0 && (
        <section className="panel-section">
          <h3>Liên quan</h3>
          <div className="pill-row">
            {linked.map((c) => (
              <button key={c.id} className="pill" style={{ '--accent': c.color }} onClick={() => onSelect(c.id)}>
                {c.title}
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}
