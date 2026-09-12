/**
 * Chế độ luyện phỏng vấn: đọc mục 🎤 của node, tách thành thẻ hỏi–đáp, và
 * nhớ tiến độ bằng hộp Leitner trong localStorage.
 *
 * Nguồn dữ liệu là `node.interview` — build đã tách sẵn khỏi thân bài, xem
 * SECTIONS trong scripts/build-graph.mjs. Parser ở đây bám đúng cấu trúc năm
 * phần mô tả trong content/_SCHEMA.md; thiếu phần nào thì bỏ qua phần đó chứ
 * không hỏng.
 */

const STORE_KEY = 'gdb:practice'

/** Khoảng cách ôn lại theo hộp, tính bằng ngày. Hộp 0 = ôn lại ngay trong phiên. */
export const BOX_DAYS = [0, 1, 3, 7, 21]
const DAY = 24 * 60 * 60 * 1000

/** Nhãn mức độ trong bảng câu hỏi — nhận cả hai ngôn ngữ. */
const LEVEL_MAP = {
  junior: 'junior', mid: 'mid', senior: 'senior',
  'trung cấp': 'mid', 'cơ bản': 'junior', 'chuyên sâu': 'senior',
}

/** Lấy các dòng ngay sau một nhãn in đậm, dừng ở nhãn in đậm kế tiếp. */
function blockAfter(md, labels) {
  const lines = md.split('\n')
  const isLabel = (s) => /^\*\*[^*]+\*\*/.test(s.trim())
  const wanted = labels.map((s) => s.toLowerCase())
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!isLabel(line)) continue
    const name = line.replace(/^\*\*/, '').split('**')[0].trim().toLowerCase()
    if (!wanted.some((w) => name.startsWith(w))) continue
    const out = []
    for (let j = i + 1; j < lines.length; j++) {
      if (isLabel(lines[j].trim())) break
      out.push(lines[j])
    }
    return { head: line, body: out.join('\n').trim() }
  }
  return null
}

/** "- nội dung" hoặc "- *"câu hỏi"* → ý" thành mảng chuỗi markdown. */
function bullets(block) {
  if (!block) return []
  return block.body.split('\n')
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, '').trim())
    .filter(Boolean)
}

/**
 * Tách mục 🎤 thành cấu trúc dùng được.
 * Trả về null nếu node không có mục này.
 */
export function parseInterview(md) {
  if (!md || !md.trim()) return null

  // --- bảng câu hỏi theo mức ---
  const qBlock = blockAfter(md, ['câu hay gặp', 'common questions', 'câu hỏi hay gặp'])
  const questions = []
  if (qBlock) {
    for (const row of qBlock.body.split('\n')) {
      const line = row.trim()
      if (!line.startsWith('|')) continue
      if (/^\|[\s|:-]+\|$/.test(line)) continue                 // dòng kẻ
      const cells = line.split('|').slice(1, -1).map((c) => c.trim())
      if (cells.length < 2) continue
      const raw = cells[0].toLowerCase()
      if (raw === 'mức' || raw === 'level') continue             // dòng tiêu đề
      questions.push({ level: LEVEL_MAP[raw] || 'mid', text: cells[1] })
    }
  }

  // --- khung trả lời 60 giây: tiêu đề chứa câu hỏi lõi, thân là blockquote ---
  const fBlock = blockAfter(md, ['khung trả lời', '60-second', 'answer frame'])
  let frameQuestion = ''
  let frame = ''
  if (fBlock) {
    const m = fBlock.head.match(/[—-]\s*(.+)$/)
    if (m) frameQuestion = m[1].replace(/^["“]|["”]$/g, '').trim()
    frame = fBlock.body.split('\n')
      .map((l) => l.replace(/^\s*>\s?/, ''))
      .join('\n').trim()
  }

  const followUps = bullets(blockAfter(md, ['họ sẽ đào tiếp', 'follow-up', 'họ sẽ hỏi']))
  const redFlags = bullets(blockAfter(md, ['cờ đỏ', 'red flag']))
  const facts = bullets(blockAfter(md, ['số /', 'số nên thuộc', 'numbers']))

  if (!questions.length && !frameQuestion) return null
  return { questions, frameQuestion, frame, followUps, redFlags, facts }
}

/** Toàn bộ thẻ của một node. Thẻ đầu là câu hỏi lõi (có khung trả lời riêng). */
export function cardsFor(node) {
  const parsed = parseInterview(node.interview)
  if (!parsed) return []
  const cards = []
  if (parsed.frameQuestion) {
    cards.push({ id: node.id + '#core', nodeId: node.id, level: 'core', question: parsed.frameQuestion, parsed })
  }
  parsed.questions.forEach((q, i) => {
    // Câu lõi thường trùng một câu trong bảng — bỏ bản trùng cho khỏi hỏi hai lần.
    if (parsed.frameQuestion && similar(q.text, parsed.frameQuestion)) return
    cards.push({ id: node.id + '#q' + i, nodeId: node.id, level: q.level, question: q.text, parsed })
  })
  return cards
}

function similar(a, b) {
  const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  const x = norm(a), y = norm(b)
  return x === y || x.includes(y) || y.includes(x)
}

/* ------------------------------ tiến độ ---------------------------------- */

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }          // private mode: học vẫn được, chỉ không nhớ
}

export function saveProgress(p) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)) } catch { /* private mode */ }
}

/**
 * Chấm một thẻ. Ba mức, cố ý ít lựa chọn:
 *   'again' — chưa trả lời được  → về hộp 0, gặp lại ngay trong phiên
 *   'hard'  — nói được nhưng vấp → giữ ở hộp thấp
 *   'good'  — trôi chảy          → lên một hộp
 */
export function grade(progress, cardId, result) {
  const cur = progress[cardId] || { box: 0, due: 0, seen: 0 }
  let box = cur.box
  if (result === 'again') box = 0
  else if (result === 'hard') box = Math.max(1, Math.min(box, 2))
  else box = Math.min(BOX_DAYS.length - 1, box + 1)

  return {
    ...progress,
    [cardId]: { box, due: Date.now() + BOX_DAYS[box] * DAY, seen: (cur.seen || 0) + 1, last: Date.now() },
  }
}

export const isDue = (progress, cardId, now = Date.now()) => {
  const e = progress[cardId]
  return !e || (e.due || 0) <= now
}

/** 0…1 — tỉ lệ thuộc của một node, để tô màu mindmap. null = chưa có thẻ nào. */
export function masteryOf(cards, progress) {
  if (!cards.length) return null
  let sum = 0
  for (const c of cards) {
    const e = progress[c.id]
    sum += e ? e.box / (BOX_DAYS.length - 1) : 0
  }
  return sum / cards.length
}

/** Map nodeId -> mastery, dùng cho lớp phủ trên mindmap. */
export function masteryMap(deck, progress) {
  const byNode = new Map()
  for (const c of deck) {
    if (!byNode.has(c.nodeId)) byNode.set(c.nodeId, [])
    byNode.get(c.nodeId).push(c)
  }
  const out = new Map()
  for (const [id, cards] of byNode) out.set(id, masteryOf(cards, progress))
  return out
}

/* ------------------------------- bộ thẻ ---------------------------------- */

/** Mọi thẻ của kho, theo thứ tự lộ trình đọc. */
export function buildDeck(graph, nodesById) {
  const out = []
  for (const id of graph.readingPath) {
    const node = nodesById.get(id)
    if (node) out.push(...cardsFor(node))
  }
  return out
}

/**
 * Chọn thẻ cho một phiên: ưu tiên thẻ đến hạn và thẻ chưa gặp bao giờ.
 * Xáo theo seed cố định của phiên để thứ tự ổn định khi component render lại.
 */
export function pickSession(deck, progress, { limit = 20, seed = 1 } = {}) {
  const now = Date.now()
  const due = deck.filter((c) => isDue(progress, c.id, now))
  const pool = due.length ? due : deck          // hết hạn thì cho ôn lại tất
  return shuffle(pool, seed).slice(0, limit)
}

/** Xáo xác định (mulberry32) — cùng seed cho cùng thứ tự. */
function shuffle(arr, seed) {
  const a = arr.slice()
  let s = seed >>> 0
  const rnd = () => {
    s += 0x6D2B79F5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Số liệu hiện trên đầu màn luyện tập. */
export function deckStats(deck, progress) {
  const now = Date.now()
  let due = 0, learned = 0, seen = 0
  for (const c of deck) {
    const e = progress[c.id]
    if (!e) { due++; continue }
    seen++
    if (e.box >= BOX_DAYS.length - 1) learned++
    if ((e.due || 0) <= now) due++
  }
  return { total: deck.length, due, learned, seen }
}
