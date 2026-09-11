import { glossKey } from './glossary.js'

/**
 * Thẻ không được tô thuật ngữ bên trong.
 * - `pre`/`code`: code đã có đường riêng (component `code` trong DetailPanel).
 * - `a`: đã là link, thêm nút bấm vào trong nữa thì bấm không biết ra cái nào.
 * - `svg`/`figure`: chữ trong hình minh hoạ, chèn `<button>` vào là vỡ SVG.
 * - `h1`–`h6`: bỏ qua để lần-xuất-hiện-đầu rơi vào đoạn văn có ngữ cảnh,
 *   chứ không rơi vào tiêu đề.
 */
const SKIP = new Set([
  'pre', 'code', 'a', 'svg', 'figure', 'style', 'script', 'gterm',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
])

const ESC_RE = /[.*+?^${}()|[\]\\]/g
const esc = (s) => s.replace(ESC_RE, '\\$&')

/** Ký tự coi là "trong cùng một từ" — dùng cho ranh giới hai đầu thuật ngữ. */
const WORD = '[\\p{L}\\p{N}_-]'

/**
 * Một regex cho toàn bộ từ điển, thuật ngữ dài xếp trước để "input buffer"
 * thắng "input" khi cả hai đều có trong từ điển.
 *
 * Không dùng lookbehind (Safari cũ chưa có): bắt luôn ký tự ranh giới phía
 * trước vào group 1 rồi trả nó lại dưới dạng text thường.
 */
function buildRe(table) {
  const spellings = new Set()
  for (const entry of Object.values(table)) {
    for (const s of [entry.term, ...(entry.aliases || [])]) {
      if (s && s.length >= 2) spellings.add(s)
    }
  }
  if (!spellings.size) return null
  const alt = [...spellings].sort((a, b) => b.length - a.length).map(esc).join('|')
  return new RegExp(`(^|[^\\p{L}\\p{N}_-])(${alt})(?!${WORD})`, 'giu')
}

/** Cắt một text node thành [text, <gterm>, text, …]; null nếu không có gì khớp. */
function split(value, re, table, seen) {
  re.lastIndex = 0
  const out = []
  let last = 0
  let m
  while ((m = re.exec(value)) !== null) {
    const word = m[2]
    const start = m.index + (m[1] || '').length
    const entry = table[glossKey(word)]
    if (!entry || seen.has(entry.term)) continue   // lastIndex đã nhảy qua từ này
    seen.add(entry.term)
    if (start > last) out.push({ type: 'text', value: value.slice(last, start) })
    out.push({
      type: 'element',
      tagName: 'gterm',
      properties: {},
      children: [{ type: 'text', value: word }],
    })
    last = start + word.length
  }
  if (!out.length) return null
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) })
  return out
}

/**
 * Bọc thuật ngữ trong văn xuôi thành `<gterm>` để DetailPanel render ra nút
 * tra nghĩa. Chỉ tô **lần xuất hiện đầu tiên** của mỗi thuật ngữ trong một
 * mục — tô hết thì "core loop" sáng lên ba chục lần, đọc không nổi.
 *
 * Chạy SAU rehype-raw để SVG đã thành element thật và bỏ qua được.
 */
export default function rehypeGlossary(options = {}) {
  const table = options.table
  const re = table ? buildRe(table) : null

  return (tree) => {
    if (!re) return
    const seen = new Set()   // mới mỗi lần render → mỗi mục đếm lại từ đầu

    const walk = (node) => {
      const kids = node.children
      if (!kids || !kids.length) return
      let i = 0
      while (i < kids.length) {
        const child = kids[i]
        if (child.type === 'text') {
          const parts = split(child.value, re, table, seen)
          if (parts) {
            kids.splice(i, 1, ...parts)
            i += parts.length
            continue
          }
        } else if (child.type === 'element' && !SKIP.has(child.tagName)) {
          walk(child)
        }
        i++
      }
    }
    walk(tree)
  }
}
