import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Popover nằm bên trong một `<p>` của văn bản gốc, nên phần giải thích không
 * được sinh ra `<p>` nữa — `<p>` lồng `<p>` là HTML không hợp lệ và trình duyệt
 * sẽ tự cắt đoạn văn ra làm popover vỡ. Đổi sang `<span>` dạng block.
 */
const POP_MD = { p: ({ children }) => <span className="term-p">{children}</span> }

/**
 * Một thuật ngữ khớp từ điển → bấm được, mở popover giải thích.
 *
 * Popover đặt bằng `position: fixed` theo toạ độ của chính thuật ngữ, vì panel
 * có `overflow-y: auto` — dùng absolute trong đó sẽ bị cắt khi cuộn.
 */
export default function GlossaryTerm({ entry, lang, onSelect, children }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)
  const popRef = useRef(null)

  // Đo sau khi popover đã render để biết kích thước thật rồi mới kẹp vào màn hình.
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const b = btnRef.current.getBoundingClientRect()
    const pop = popRef.current
    const w = pop ? pop.offsetWidth : 320
    const h = pop ? pop.offsetHeight : 160
    const M = 10

    let left = b.left + b.width / 2 - w / 2
    left = Math.min(window.innerWidth - w - M, Math.max(M, left))

    // ưu tiên mở xuống; không đủ chỗ thì mở lên
    const below = b.bottom + 8
    const above = b.top - h - 8
    const top = below + h + M <= window.innerHeight ? below : Math.max(M, above)

    setPos({ left, top, arrowX: b.left + b.width / 2 - left, flipped: top < b.top })
  }, [open])

  // Đóng khi bấm ra ngoài, cuộn, đổi kích thước, hoặc Esc
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return
      close()
    }
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', close)
    // capture: bắt cả cuộn trong panel, không chỉ cuộn trang
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={'term' + (open ? ' is-open' : '')}
        aria-expanded={open}
        title={lang === 'en' ? 'Click for definition' : 'Bấm để xem giải thích'}
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v) }}
      >
        {children}
      </button>

      {open && (
        <span
          ref={popRef}
          className={'term-pop' + (pos?.flipped ? ' is-above' : '')}
          style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: -9999 }}
          role="dialog"
        >
          <span className="term-arrow" style={pos ? { left: pos.arrowX } : undefined} />
          <span className="term-head">
            <strong>{entry.term}</strong>
            {entry.aliases?.length > 0 && (
              <em className="term-alias">{entry.aliases.join(' · ')}</em>
            )}
          </span>
          <span className="term-body md">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={POP_MD}>
              {entry.body}
            </ReactMarkdown>
          </span>
          {entry.see && (
            <button
              type="button"
              className="term-go"
              onClick={() => { setOpen(false); onSelect(entry.see) }}
            >
              {lang === 'en' ? 'Open node →' : 'Mở node →'}
            </button>
          )}
        </span>
      )}
    </>
  )
}
