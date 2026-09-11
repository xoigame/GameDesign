import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { buildAiContext } from '../lib/aiContext.js'
import { LEVEL_VI, LEVEL_GLYPH, LEVEL_HINT } from '../lib/levels.js'
import { FONT_STEPS } from '../App.jsx'

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

/** Đổi [[id]] thành link markdown trỏ tới node tương ứng. */
const linkify = (text, nodesById) =>
  text.replace(/\[\[([A-Za-z0-9-]+)\]\]/g, (m, id) => {
    const t = nodesById.get(id)
    return t ? `[${t.title}](#${t.id})` : m
  })

export default function DetailPanel({
  node, nodesById, relations, readingPath, fontScale, setFontScale, onSelect, onClose,
}) {
  const [copied, setCopied] = useState('')
  const [tab, setTab] = useState('doc')

  // Node mới có thể không có tab đang mở → lùi về tab Nội dung.
  useEffect(() => {
    if (tab === 'unity' && !node.unity) setTab('doc')
  }, [node.id, node.unity, tab])

  const fsIndex = FONT_STEPS.indexOf(fontScale)
  const stepFont = (dir) => {
    const nextStep = FONT_STEPS[Math.min(FONT_STEPS.length - 1, Math.max(0, fsIndex + dir))]
    if (nextStep) setFontScale(nextStep)
  }

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

  const body = useMemo(() => linkify(node.body, nodesById), [node, nodesById])
  const aiPrompt = useMemo(
    () => (node.aiPrompt ? linkify(node.aiPrompt, nodesById) : ''), [node, nodesById])
  const unity = useMemo(
    () => (node.unity ? linkify(node.unity, nodesById) : ''), [node, nodesById])

  const linked = useMemo(() => {
    const ids = new Set()
    for (const r of relations) {
      if (r.source === node.id) ids.add(r.target)
      else if (r.target === node.id) ids.add(r.source)
    }
    return [...ids].map((id) => nodesById.get(id)).filter(Boolean)
  }, [node, relations, nodesById])

  const children = node.children.map((id) => nodesById.get(id)).filter(Boolean)

  const copy = async (kind) => {
    const text =
      kind === 'prompt' ? node.aiPrompt
      : kind === 'unity' ? node.unity
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

  const TABS = [
    { id: 'doc', label: 'Nội dung', on: true },
    { id: 'prompt', label: '🤖 Prompt cho AI', on: true },
    { id: 'unity', label: '🎮 Unity', on: !!node.unity },
  ].filter((t) => t.on)

  const md = (text) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}
                   components={mdComponents(onSelect)}>
      {text}
    </ReactMarkdown>
  )

  return (
    <aside className="panel" style={{ '--accent': node.color }}>
      <div className="panel-head">
        <div className="crumbs">
          {breadcrumb.map((b) => (
            <button key={b.id} className="crumb" onClick={() => onSelect(b.id)}>{b.title}</button>
          ))}
        </div>
        <div className="fs-ctl" role="group" aria-label="Cỡ chữ">
          <button onClick={() => stepFont(-1)} disabled={fsIndex <= 0}
                  title="Chữ nhỏ hơn" aria-label="Chữ nhỏ hơn">A−</button>
          <span className="fs-val" title="Cỡ chữ hiện tại">{Math.round(fontScale * 100)}%</span>
          <button onClick={() => stepFont(1)} disabled={fsIndex >= FONT_STEPS.length - 1}
                  title="Chữ to hơn" aria-label="Chữ to hơn">A+</button>
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
        <span className={'chip status-' + node.status}>
          {node.status === 'deep' ? 'đã viết sâu' : 'stub'}
        </span>
        {node.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
        <span className="chip ghost">{node.words} từ</span>
        <code className="chip path">content/{node.path}</code>
      </div>

      <div className="panel-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={'ptab ptab-' + t.id + (tab === t.id ? ' on' : '')}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'doc' && (
        <>
          <div className="panel-actions">
            <button className="btn" onClick={() => copy('node')}>
              {copied === 'node' ? '✓ Đã copy' : 'Copy cho AI'}
            </button>
            {children.length > 0 && (
              <button className="btn ghost" onClick={() => copy('subtree')}>
                {copied === 'subtree' ? '✓ Đã copy' : `Copy cả nhánh (${children.length})`}
              </button>
            )}
            {copied === 'err' && (
              <span className="copy-err">Không copy được — hãy dùng HTTPS/localhost</span>
            )}
          </div>
          <div className="panel-body md">
            {body
              ? md(body)
              : <p className="empty">
                  Node này chưa có nội dung. Mở <code>content/{node.path}</code> và viết thêm.
                </p>}
          </div>
        </>
      )}

      {tab === 'prompt' && (
        <section className="tab-pane ai-pane">
          <div className="pane-head">
            <p className="pane-hint">
              Cách diễn đạt yêu cầu cho chủ đề này để AI hiểu đúng ý — phải nêu rõ gì,
              mẫu prompt, và bẫy thường gặp.
            </p>
            {aiPrompt && (
              <button className="btn" onClick={() => copy('prompt')}>
                {copied === 'prompt' ? '✓ Đã copy' : 'Copy mục này'}
              </button>
            )}
          </div>
          <div className="md ai-md">
            {aiPrompt
              ? md(aiPrompt)
              : <p className="empty">
                  Chưa có. Thêm mục <code>## 🤖 Prompt cho AI</code> vào cuối
                  <code> content/{node.path}</code>.
                </p>}
          </div>
        </section>
      )}

      {tab === 'unity' && (
        <section className="tab-pane unity-pane">
          <div className="pane-head">
            <p className="pane-hint">
              Hiện thực hoá bước này trong Unity — component nào, đặt ở đâu, code mẫu.
            </p>
            <button className="btn" onClick={() => copy('unity')}>
              {copied === 'unity' ? '✓ Đã copy' : 'Copy mục này'}
            </button>
          </div>
          <div className="md unity-md">{md(unity)}</div>
        </section>
      )}

      {children.length > 0 && (
        <section className="panel-section">
          <h3>Node con</h3>
          <div className="pill-row">
            {children.map((c) => (
              <button key={c.id} className="pill" style={{ '--accent': c.color }}
                      onClick={() => onSelect(c.id)}>
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
              <button key={c.id} className="pill" style={{ '--accent': c.color }}
                      onClick={() => onSelect(c.id)}>
                {c.title}
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}
