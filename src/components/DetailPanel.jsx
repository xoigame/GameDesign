import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { buildAiContext } from '../lib/aiContext.js'
import { LEVEL_VI, LEVEL_GLYPH, LEVEL_HINT } from '../lib/levels.js'
import { FONT_STEPS } from '../App.jsx'
import { t, field, text as tx, hasTranslation } from '../lib/i18n.js'
import { lookup, tableFor } from '../lib/glossary.js'
import rehypeGlossary from '../lib/rehypeGlossary.js'
import GlossaryTerm from './GlossaryTerm.jsx'

/** Biến link `#id` (từ wiki-link [[id]]) thành nút điều hướng trong app. */
/**
 * react-markdown gọi `code` cho CẢ inline code lẫn code block. Cách phân biệt
 * đáng tin duy nhất là biết mình có đang ở trong `<pre>` không, nên `pre` đặt
 * cờ qua context và `code` đọc ra.
 */
const InPre = createContext(false)

const mdComponents = (onSelect, glossary, lang) => ({
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

  pre: ({ children, ...rest }) => (
    <InPre.Provider value={true}><pre {...rest}>{children}</pre></InPre.Provider>
  ),

  code: ({ children, className, ...rest }) => {
    const inPre = useContext(InPre)
    // Trong code block thì để nguyên — không tra từ điển giữa code
    if (inPre) return <code className={className} {...rest}>{children}</code>

    const raw = Array.isArray(children) ? children.join('') : String(children ?? '')
    const entry = lookup(glossary, lang, raw)
    if (!entry) return <code className={className} {...rest}>{children}</code>

    return (
      <GlossaryTerm entry={entry} lang={lang} onSelect={onSelect}>
        <code className={(className || '') + ' is-term'}>{children}</code>
      </GlossaryTerm>
    )
  },

  // Thẻ giả do rehypeGlossary chèn cho thuật ngữ nằm trong văn xuôi.
  gterm: ({ children }) => {
    const raw = Array.isArray(children) ? children.join('') : String(children ?? '')
    const entry = lookup(glossary, lang, raw)
    if (!entry) return children
    return (
      <GlossaryTerm entry={entry} lang={lang} onSelect={onSelect}>
        <span className="term-kw">{children}</span>
      </GlossaryTerm>
    )
  },
})

/** Đổi [[id]] thành link markdown trỏ tới node tương ứng, tiêu đề theo ngôn ngữ. */
const linkify = (content, nodesById, lang) =>
  content.replace(/\[\[([A-Za-z0-9-]+)\]\]/g, (m, id) => {
    const target = nodesById.get(id)
    if (!target) return m
    const label = tx(target, 'title', lang === 'both' ? 'vi' : lang)
    return `[${label}](#${target.id})`
  })

export default function DetailPanel({
  node, nodesById, relations, readingPath, glossary, fontScale, setFontScale, lang, onSelect, onClose,
}) {
  const [copied, setCopied] = useState('')
  const [tab, setTab] = useState('doc')

  // Node mới có thể không có tab đang mở → lùi về tab Nội dung.
  useEffect(() => {
    if ((tab === 'unity' && !node.unity) || (tab === 'code' && !node.code) ||
        (tab === 'interview' && !node.interview)) setTab('doc')
  }, [node.id, node.unity, node.code, node.interview, tab])

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

  const hasEn = hasTranslation(node, 'en')
  const en = node.i18n && node.i18n.en

  /** Lấy nội dung một mục theo chế độ ngôn ngữ hiện tại. */
  const pick = (key) => {
    if (lang === 'en' && en && en[key]) return linkify(en[key], nodesById, lang)
    return node[key] ? linkify(node[key], nodesById, lang) : ''
  }
  const pickEn = (key) => (en && en[key] ? linkify(en[key], nodesById, 'en') : '')
  const pickVi = (key) => (node[key] ? linkify(node[key], nodesById, 'vi') : '')

  const body = useMemo(() => pick('body'), [node, nodesById, lang])
  const aiPrompt = useMemo(() => pick('aiPrompt'), [node, nodesById, lang])
  const unity = useMemo(() => pick('unity'), [node, nodesById, lang])

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
      : kind === 'code' ? node.code
      : kind === 'interview' ? node.interview
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
    { id: 'doc', label: t('tabDoc', lang), on: true },
    { id: 'prompt', label: t('tabPrompt', lang), on: true },
    { id: 'unity', label: t('tabUnity', lang), on: !!node.unity },
    { id: 'code', label: t('tabCode', lang), on: !!node.code },
    { id: 'interview', label: t('tabInterview', lang), on: !!node.interview },
  ].filter((x) => x.on)

  /* rehypeGlossary phải chạy SAU rehypeRaw: lúc đó SVG nội tuyến đã thành
     element thật nên bỏ qua được, không bị chèn <button> vào giữa hình. */
  const rehypePlugins = useMemo(
    () => [rehypeRaw, [rehypeGlossary, { table: tableFor(glossary, lang) }]],
    [glossary, lang],
  )
  const components = useMemo(
    () => mdComponents(onSelect, glossary, lang),
    [onSelect, glossary, lang],
  )

  const md = (content) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins}
                   components={components}>
      {content}
    </ReactMarkdown>
  )

  /**
   * Hiển thị một mục theo chế độ ngôn ngữ.
   * 'both' → hai cột cạnh nhau (tự xếp chồng trên màn hẹp).
   * 'en' mà node chưa dịch → hiện bản gốc kèm thông báo, không để trống.
   */
  const renderPane = (key, extraClass = '') => {
    if (lang === 'both') {
      const enText = pickEn(key)
      return (
        <div className={'bi ' + extraClass}>
          <div className="bi-col">
            <span className="bi-tag">VI</span>
            <div className="md">{md(pickVi(key))}</div>
          </div>
          <div className="bi-col">
            <span className="bi-tag is-en">EN</span>
            {enText
              ? <div className="md">{md(enText)}</div>
              : <p className="empty">{t('notTranslated', 'vi')}</p>}
          </div>
        </div>
      )
    }
    const content = pick(key)
    return (
      <>
        {lang === 'en' && !hasEn && (
          <p className="lang-note">{t('notTranslated', lang)}</p>
        )}
        <div className={'md ' + extraClass}>{md(content)}</div>
      </>
    )
  }

  return (
    <aside className="panel" style={{ '--accent': node.color }}>
      <div className="panel-head">
        <div className="crumbs">
          {breadcrumb.map((b) => (
            <button key={b.id} className="crumb" onClick={() => onSelect(b.id)}>{tx(b, 'title', lang === 'both' ? 'vi' : lang)}</button>
          ))}
        </div>
        <div className="fs-ctl" role="group" aria-label={t('fontSize', lang)}>
          <button onClick={() => stepFont(-1)} disabled={fsIndex <= 0}
                  title={t('fontSize', lang) + ' −'} aria-label={t('fontSize', lang) + ' −'}>A−</button>
          <span className="fs-val" title={t('fontSize', lang)}>{Math.round(fontScale * 100)}%</span>
          <button onClick={() => stepFont(1)} disabled={fsIndex >= FONT_STEPS.length - 1}
                  title={t('fontSize', lang) + ' +'} aria-label={t('fontSize', lang) + ' +'}>A+</button>
        </div>
        <button className="icon-btn" onClick={onClose} title={t('closeEsc', lang)}>✕</button>
      </div>

      <h1 className="panel-title">
        {node.icon ? <span className="panel-icon">{node.icon}</span> : null}
        {tx(node, 'title', lang === 'both' ? 'vi' : lang)}
      </h1>

      {lang === 'both' && field(node, 'title', 'en').translated && (
        <p className="panel-title-en">{field(node, 'title', 'en').text}</p>
      )}

      {tx(node, 'summary', lang === 'both' ? 'vi' : lang)
        ? <p className="panel-summary">{tx(node, 'summary', lang === 'both' ? 'vi' : lang)}</p>
        : null}

      <div className="panel-meta">
        <span className="chip read" title="Thứ tự trong lộ trình đọc">#{node.readIndex}</span>
        <span className={'chip lv lv-' + (node.level || 'none')} title={LEVEL_HINT[node.level]}>
          {LEVEL_GLYPH[node.level] || '·'} {LEVEL_VI[node.level] || 'chưa phân loại'}
        </span>
        <span className={'chip status-' + node.status}>
          {node.status === 'deep' ? t('statusDeep', lang) : t('statusStub', lang)}
        </span>
        {node.tags.map((tag) => <span key={tag} className="chip">#{tag}</span>)}
        <span className="chip ghost">{node.words} {t('words', lang)}</span>
        {!hasEn && (
          <span className="chip untranslated" title={t('notTranslated', 'vi')}>EN ✕</span>
        )}
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
              {copied === 'node' ? t('copied', lang) : t('copyForAi', lang)}
            </button>
            {children.length > 0 && (
              <button className="btn ghost" onClick={() => copy('subtree')}>
                {copied === 'subtree' ? t('copied', lang) : `${t('copyBranch', lang)} (${children.length})`}
              </button>
            )}
            {copied === 'err' && (
              <span className="copy-err">{t('copyErr', lang)}</span>
            )}
          </div>
          <div className="panel-body">
            {body
              ? renderPane('body')
              : <p className="empty">
                  Node này chưa có nội dung. Mở <code>content/{node.path}</code> và viết thêm.
                </p>}
          </div>
        </>
      )}

      {tab === 'prompt' && (
        <section className="tab-pane ai-pane">
          <div className="pane-head">
            <p className="pane-hint">{t('promptHint', lang)}</p>
            {aiPrompt && (
              <button className="btn" onClick={() => copy('prompt')}>
                {copied === 'prompt' ? t('copied', lang) : t('copySection', lang)}
              </button>
            )}
          </div>
          {aiPrompt
            ? renderPane('aiPrompt', 'ai-md')
            : <p className="empty">
                Chưa có. Thêm mục <code>## 🤖 Prompt cho AI</code> vào cuối
                <code> content/{node.path}</code>.
              </p>}
        </section>
      )}

      {tab === 'unity' && (
        <section className="tab-pane unity-pane">
          <div className="pane-head">
            <p className="pane-hint">{t('unityHint', lang)}</p>
            <button className="btn" onClick={() => copy('unity')}>
              {copied === 'unity' ? t('copied', lang) : t('copySection', lang)}
            </button>
          </div>
          {renderPane('unity', 'unity-md')}
        </section>
      )}

      {tab === 'code' && (
        <section className="tab-pane code-pane">
          <div className="pane-head">
            <p className="pane-hint">{t('codeHint', lang)}</p>
            <button className="btn" onClick={() => copy('code')}>
              {copied === 'code' ? t('copied', lang) : t('copySection', lang)}
            </button>
          </div>
          {renderPane('code', 'code-md')}
        </section>
      )}

      {tab === 'interview' && (
        <section className="tab-pane interview-pane">
          <div className="pane-head">
            <p className="pane-hint">{t('interviewHint', lang)}</p>
            <button className="btn" onClick={() => copy('interview')}>
              {copied === 'interview' ? t('copied', lang) : t('copySection', lang)}
            </button>
          </div>
          {renderPane('interview', 'interview-md')}
        </section>
      )}

      {children.length > 0 && (
        <section className="panel-section">
          <h3>{t('children', lang)}</h3>
          <div className="pill-row">
            {children.map((c) => (
              <button key={c.id} className="pill" style={{ '--accent': c.color }}
                      onClick={() => onSelect(c.id)}>
                {c.icon ? c.icon + ' ' : ''}{tx(c, 'title', lang === 'both' ? 'vi' : lang)}
                {c.status === 'stub' && <span className="pill-dot" />}
              </button>
            ))}
          </div>
        </section>
      )}

      {node.refs.length > 0 && (
        <section className="panel-section">
          <h3>{t('refs', lang)}</h3>
          <ul className="ref-list">
            {node.refs.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>
      )}

      {(prev || next) && (
        <section className="panel-section">
          <h3>{t('readingPath', lang)}</h3>
          <div className="path-nav">
            {prev
              ? <button className="pathnav-btn" onClick={() => onSelect(prev.id)}>
                  <span className="pn-dir">← #{prev.readIndex}</span>
                  <span className="pn-title">{tx(prev, 'title', lang === 'both' ? 'vi' : lang)}</span>
                </button>
              : <span />}
            {next && (
              <button className="pathnav-btn next" onClick={() => onSelect(next.id)}>
                <span className="pn-dir">#{next.readIndex} →</span>
                <span className="pn-title">{tx(next, 'title', lang === 'both' ? 'vi' : lang)}</span>
              </button>
            )}
          </div>
        </section>
      )}

      {linked.length > 0 && (
        <section className="panel-section">
          <h3>{t('related', lang)}</h3>
          <div className="pill-row">
            {linked.map((c) => (
              <button key={c.id} className="pill" style={{ '--accent': c.color }}
                      onClick={() => onSelect(c.id)}>
                {tx(c, 'title', lang === 'both' ? 'vi' : lang)}
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}
