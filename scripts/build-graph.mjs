#!/usr/bin/env node
/**
 * build-graph.mjs
 * ---------------------------------------------------------------------------
 * Quét thư mục content/ (markdown + frontmatter) rồi sinh ra:
 *   1. public/data/graph.json   : dữ liệu cho web mindmap
 *   2. KNOWLEDGE_INDEX.md       : mục lục phẳng cho AI agent (Codex/Claude) đọc
 *
 * Markdown là NGUỒN CHÂN LÝ DUY NHẤT. Không sửa graph.json bằng tay.
 * ---------------------------------------------------------------------------
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'content')
const OUT_JSON = path.join(ROOT, 'public', 'data', 'graph.json')
const OUT_INDEX = path.join(ROOT, 'KNOWLEDGE_INDEX.md')

const BRANCH_COLORS = [
  '#6ea8fe', '#51cf9b', '#ffd43b', '#ff8787',
  '#b197fc', '#ffa94d', '#f783ac', '#4dd4e0',
  '#a9e34b', '#e599f7',
]

/* ------------------------------- frontmatter ------------------------------ */

const unquote = (s) => s.trim().replace(/^["']|["']$/g, '').trim()

const slugify = (s) =>
  String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw.trim() }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: raw.trim() }

  const head = raw.slice(3, end).replace(/^\r?\n/, '')
  const body = raw.slice(end + 4).replace(/^\r?\n/, '').trim()
  const data = {}
  let currentKey = null

  for (const line of head.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    const listItem = line.match(/^\s*-\s+(.*)$/)
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = []
      data[currentKey].push(unquote(listItem[1]))
      continue
    }

    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    const val = kv[2].trim()
    currentKey = key

    if (val === '') { data[key] = []; continue }
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val.slice(1, -1).split(',').map(unquote).filter(Boolean)
      continue
    }
    if (val === 'true' || val === 'false') { data[key] = val === 'true'; continue }
    if (/^-?\d+(\.\d+)?$/.test(val)) { data[key] = Number(val); continue }
    data[key] = unquote(val)
  }
  return { data, body }
}

/* --------------------------------- scan ---------------------------------- */

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.name.endsWith('.md')) acc.push(full)
  }
  return acc
}

const stripNumPrefix = (s) => s.replace(/^\d+[-_]/, '')

/**
 * Đa ngữ theo kiểu FILE SONG SONG:
 *   content/01-foundations/core-loop.md      → bản gốc (tiếng Việt)
 *   content/01-foundations/core-loop.en.md   → bản dịch tiếng Anh
 * Cấu trúc cây, id, read, level… chỉ lấy từ file gốc. File dịch chỉ đóng góp
 * phần chữ, nên thiếu bản dịch không bao giờ làm hỏng graph.
 */
const BASE_LANG = 'vi'
const TRANSLATED_LANGS = ['en']

/** 'a/b/core-loop.en.md' → { base: 'a/b/core-loop.md', lang: 'en' } hoặc null */
function parseLangSuffix(rel) {
  const m = rel.match(/^(.*)\.([a-z]{2})\.md$/)
  if (!m || !TRANSLATED_LANGS.includes(m[2])) return null
  return { base: m[1] + '.md', lang: m[2] }
}

function countWords(body) {
  return body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length
}

/**
 * Các mục đặc biệt được tách khỏi thân bài thành trường riêng, để web render
 * thành tab và để AI đọc đúng phần nó cần.
 */
const SECTIONS = [
  // Nhận cả tiêu đề tiếng Việt lẫn tiếng Anh, vì file .en.md dùng bản dịch.
  {
    key: 'aiPrompt',
    re: /^##[ \t]*(?:🤖[ \t]*)?(?:Prompt cho AI|Prompt for AI)[ \t]*$/,
    required: true,
  },
  { key: 'unity', re: /^##[ \t]*(?:🎮[ \t]*)?Unity[ \t]*$/, required: false },
]

/** Mức độ kiến thức. Chấp nhận cả tiếng Việt lẫn tiếng Anh trong frontmatter. */
const LEVELS = ['basic', 'intermediate', 'advanced']
const LEVEL_ALIASES = {
  'basic': 'basic', 'co ban': 'basic', 'cơ bản': 'basic', 'beginner': 'basic',
  'intermediate': 'intermediate', 'trung cap': 'intermediate', 'trung cấp': 'intermediate',
  'advanced': 'advanced', 'chuyen sau': 'advanced', 'chuyên sâu': 'advanced', 'deep': 'advanced',
}

function normalizeLevel(raw, id, warnings) {
  if (!raw) return null
  const key = String(raw).trim().toLowerCase()
  const hit = LEVEL_ALIASES[key]
  if (!hit) {
    warnings.push('"' + id + '" có level không hợp lệ: "' + raw + '" (chỉ nhận ' + LEVELS.join(' | ') + ')')
    return null
  }
  return hit
}

/**
 * Tách các mục đặc biệt (Prompt cho AI, Unity) khỏi thân bài thành trường riêng.
 * Quét theo dòng và theo dõi code fence, vì các mục này chứa block ``` có thể
 * lẫn ký tự '#' bên trong (nhất là mục Unity với code C#).
 */
/**
 * Đếm code fence. Số lẻ = có fence chưa đóng, và đó là lỗi IM LẶNG rất khó
 * thấy: mọi heading sau fence đó bị coi là nằm trong code block, nên các mục
 * đặc biệt (🤖 / 🎮) không được tách ra và biến mất khỏi web.
 */
function countFences(body) {
  let n = 0
  for (const line of body.split('\n')) if (/^\s*(```|~~~)/.test(line)) n++
  return n
}

function extractSections(body) {
  const lines = body.split('\n')
  const found = []          // { key, start, end }
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) { inFence = !inFence; continue }
    if (inFence) continue

    // bất kỳ heading cấp 2 nào cũng đóng mục đang mở
    const open = found.length ? found[found.length - 1] : null
    if (open && open.end === -1 && /^##[ \t]/.test(lines[i])) open.end = i

    const hit = SECTIONS.find((sec) => sec.re.test(lines[i]))
    if (hit) found.push({ key: hit.key, start: i, end: -1 })
  }
  const last = found.length ? found[found.length - 1] : null
  if (last && last.end === -1) last.end = lines.length

  const out = { body }
  for (const sec of SECTIONS) out[sec.key] = ''
  if (!found.length) return out

  for (const f of found) out[f.key] = lines.slice(f.start + 1, f.end).join('\n').trim()

  // bỏ mọi dòng thuộc các mục đã tách ra khỏi thân bài
  const drop = new Set()
  for (const f of found) for (let i = f.start; i < f.end; i++) drop.add(i)
  out.body = lines.filter((_, i) => !drop.has(i))
    .join('\n').replace(/\n{3,}/g, '\n\n').trim()

  return out
}

function build({ strict = false, quiet = false } = {}) {
  const warnings = []
  const errors = []

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('[graph] Không tìm thấy thư mục content/')
    process.exit(1)
  }

  const allFiles = walk(CONTENT_DIR)

  // Tách file gốc và file dịch trước, để file dịch không tạo node riêng.
  const files = []
  const translations = new Map()   // base rel -> { lang -> {data, body, aiPrompt, unity} }

  for (const file of allFiles) {
    const rel = path.relative(CONTENT_DIR, file).split(path.sep).join('/')
    const hit = parseLangSuffix(rel)
    if (!hit) { files.push(file); continue }

    const parsed = parseFrontmatter(fs.readFileSync(file, 'utf8'))
    const sections = extractSections(parsed.body)
    if (!translations.has(hit.base)) translations.set(hit.base, {})
    translations.get(hit.base)[hit.lang] = {
      title: parsed.data.title ? String(parsed.data.title) : '',
      summary: parsed.data.summary ? String(parsed.data.summary) : '',
      body: sections.body,
      aiPrompt: sections.aiPrompt,
      unity: sections.unity,
      path: rel,
    }
  }

  // bản dịch mồ côi: dễ xảy ra khi đổi tên file gốc
  for (const baseRel of translations.keys()) {
    if (!fs.existsSync(path.join(CONTENT_DIR, baseRel))) {
      warnings.push('Bản dịch mồ côi (không có file gốc): ' +
        Object.values(translations.get(baseRel)).map((t) => t.path).join(', '))
    }
  }

  const nodes = new Map()
  const seenFile = new Map()

  for (const file of files) {
    const rel = path.relative(CONTENT_DIR, file).split(path.sep).join('/')
    const parsed = parseFrontmatter(fs.readFileSync(file, 'utf8'))
    const data = parsed.data

    const fences = countFences(parsed.body)
    if (fences % 2 !== 0) {
      errors.push(
        'Code fence chưa đóng trong ' + rel + ' (' + fences + ' fence, số lẻ) — ' +
        'mọi heading sau fence đó sẽ bị coi là code và các mục 🤖/🎮 sẽ biến mất'
      )
    }

    const { body, aiPrompt, unity } = extractSections(parsed.body)

    const segments = rel.split('/')
    const fileName = segments[segments.length - 1].replace(/\.md$/, '')
    const isIndex = fileName === 'index'
    const folder = segments.slice(0, -1)

    let id = data.id || (isIndex ? (folder[folder.length - 1] || 'root') : fileName)
    id = slugify(stripNumPrefix(String(id))) || 'node-' + slugify(rel)

    if (nodes.has(id)) {
      errors.push('Trùng id "' + id + '": ' + seenFile.get(id) + ' <-> ' + rel)
      continue
    }
    seenFile.set(id, rel)

    // parent suy ra tự động từ cây thư mục, có thể override bằng frontmatter
    let parent = data.parent === undefined ? null : data.parent
    if (parent === null) {
      if (folder.length === 0) parent = isIndex ? null : 'root'
      else if (isIndex) {
        const up = folder.slice(0, -1)
        parent = up.length ? slugify(stripNumPrefix(up[up.length - 1])) : 'root'
      } else {
        parent = slugify(stripNumPrefix(folder[folder.length - 1]))
      }
    }
    if (parent) parent = slugify(parent)

    const title = data.title || stripNumPrefix(fileName).replace(/-/g, ' ')

    nodes.set(id, {
      id,
      title: String(title),
      summary: data.summary ? String(data.summary) : '',
      icon: data.icon ? String(data.icon) : '',
      parent,
      children: [],
      depth: 0,
      branch: null,
      tags: (data.tags || []).map(String),
      related: (data.related || []).map(slugify),
      status: String(data.status || (body.length > 600 ? 'deep' : 'stub')),
      // read = khoá sắp xếp lộ trình đọc (thưa, để chèn node mới không phải đánh số lại).
      // readIndex (thứ hạng 1..N hiển thị cho người đọc) được tính sau khi gom đủ node.
      read: typeof data.read === 'number' ? data.read : null,
      readIndex: 0,
      level: normalizeLevel(data.level, id, warnings),
      refs: (data.refs || []).map(String),
      order: typeof data.order === 'number' ? data.order : 999,
      collapsed: data.collapsed === true,
      path: rel,
      words: countWords(body) + countWords(aiPrompt) + countWords(unity),
      body,
      aiPrompt,
      unity,
      // { en: {title, summary, body, aiPrompt, unity} } — thiếu thì UI tự lùi về bản gốc
      i18n: translations.get(rel) || {},
    })
  }

  // ---- root ----
  const rootCandidate = [...nodes.values()].find((n) => n.parent === null)
  let rootId = rootCandidate ? rootCandidate.id : null
  if (!rootId) {
    rootId = 'root'
    nodes.set(rootId, {
      id: rootId, title: 'Knowledge Base', summary: '', icon: '\u{1F9E0}', parent: null,
      children: [], depth: 0, branch: null, tags: [], related: [], status: 'deep',
      order: 0, collapsed: false, path: '(auto)', words: 0, body: '',
    })
  }

  // ---- nối cây ----
  for (const node of nodes.values()) {
    if (node.id === rootId) { node.parent = null; continue }
    if (!node.parent || !nodes.has(node.parent)) {
      if (node.parent) {
        warnings.push('Node "' + node.id + '" trỏ tới parent không tồn tại: "' + node.parent + '" -> gán về root')
      }
      node.parent = rootId
    }
  }

  // ---- phát hiện chu trình ----
  for (const node of nodes.values()) {
    const seen = new Set([node.id])
    let cur = node.parent
    while (cur) {
      if (seen.has(cur)) {
        errors.push('Chu trình parent tại "' + node.id + '"')
        node.parent = rootId
        break
      }
      seen.add(cur)
      const p = nodes.get(cur)
      cur = p ? p.parent : null
    }
  }

  for (const node of nodes.values()) {
    if (node.parent) nodes.get(node.parent).children.push(node.id)
  }

  const byOrder = (a, b) => {
    const A = nodes.get(a), B = nodes.get(b)
    return A.order - B.order || A.title.localeCompare(B.title, 'vi')
  }
  for (const node of nodes.values()) node.children.sort(byOrder)

  // ---- depth + branch + màu ----
  const root = nodes.get(rootId)
  root.depth = 0
  root.branch = rootId
  const branchIndex = new Map()
  const stack = [rootId]
  while (stack.length) {
    const cur = nodes.get(stack.pop())
    for (const childId of cur.children) {
      const child = nodes.get(childId)
      child.depth = cur.depth + 1
      if (child.depth === 1) {
        child.branch = child.id
        if (!branchIndex.has(child.id)) branchIndex.set(child.id, branchIndex.size)
      } else {
        child.branch = cur.branch
      }
      stack.push(childId)
    }
  }
  for (const node of nodes.values()) {
    const idx = branchIndex.has(node.branch) ? branchIndex.get(node.branch) : 0
    node.color = node.id === rootId ? '#e9ecef' : BRANCH_COLORS[idx % BRANCH_COLORS.length]
  }

  // ---- liên kết ngang ----
  const relations = []
  const relSeen = new Set()
  const addRelation = (source, target, type) => {
    if (!nodes.has(target) || source === target) return false
    const key = [source, target].sort().join('::')
    if (relSeen.has(key)) return true
    relSeen.add(key)
    relations.push({ source, target, type })
    return true
  }

  for (const node of nodes.values()) {
    for (const target of node.related) {
      if (!nodes.has(target)) {
        warnings.push('"' + node.id + '" related tới node không tồn tại: "' + target + '"')
        continue
      }
      addRelation(node.id, target, 'related')
    }
  }

  // wiki-link [[id]] trong body và trong mục Prompt cho AI
  for (const node of nodes.values()) {
    const matches = (node.body + '\n' + node.aiPrompt).matchAll(/\[\[([A-Za-z0-9-]+)\]\]/g)
    for (const m of matches) {
      const target = slugify(m[1])
      if (!nodes.has(target)) {
        warnings.push('"' + node.id + '" có wiki-link [[' + m[1] + ']] không khớp node nào')
        continue
      }
      addRelation(node.id, target, 'mention')
    }
  }

  const list = [...nodes.values()]
  const allTags = [...new Set(list.flatMap((n) => n.tags))].sort()

  // ---- lộ trình đọc: quy `read` thưa về thứ hạng liên tục 1..N ----
  const readingPath = [...list].sort((a, b) => {
    const A = a.read === null ? Infinity : a.read
    const B = b.read === null ? Infinity : b.read
    return A - B || a.depth - b.depth || a.title.localeCompare(b.title, 'vi')
  })
  readingPath.forEach((n, i) => { n.readIndex = i + 1 })

  const missingRead = list.filter((n) => n.read === null).map((n) => n.id)
  if (missingRead.length) {
    warnings.push(
      'Thiếu `read:` (thứ tự đọc) ở ' + missingRead.length + ' node — bị xếp xuống cuối lộ trình: ' +
      missingRead.join(', ')
    )
  }
  const missingLevel = list.filter((n) => !n.level).map((n) => n.id)
  if (missingLevel.length) {
    warnings.push(
      'Thiếu `level:` ở ' + missingLevel.length + ' node: ' + missingLevel.join(', ')
    )
  }
  // trùng `read` làm thứ tự phụ thuộc vào tie-break, khó đoán
  const readSeen = new Map()
  for (const n of list) {
    if (n.read === null) continue
    if (readSeen.has(n.read)) {
      warnings.push('Trùng `read: ' + n.read + '` giữa "' + readSeen.get(n.read) + '" và "' + n.id + '"')
    } else readSeen.set(n.read, n.id)
  }

  // Mỗi node phải có mục hướng dẫn viết prompt — coi thiếu là nợ nội dung.
  const missingPrompt = list.filter((n) => !n.aiPrompt).map((n) => n.id)
  if (missingPrompt.length) {
    warnings.push(
      'Thiếu mục "## 🤖 Prompt cho AI" ở ' + missingPrompt.length + ' node: ' +
      missingPrompt.join(', ')
    )
  }

  const graph = {
    generatedAt: new Date().toISOString(),
    root: rootId,
    stats: {
      nodes: list.length,
      branches: root.children.length,
      deep: list.filter((n) => n.status === 'deep').length,
      stub: list.filter((n) => n.status === 'stub').length,
      relations: relations.length,
      withPrompt: list.length - missingPrompt.length,
      withUnity: list.filter((n) => n.unity).length,
      translated: Object.fromEntries(
        TRANSLATED_LANGS.map((lg) => [lg, list.filter((n) => n.i18n[lg]).length])
      ),
      basic: list.filter((n) => n.level === 'basic').length,
      intermediate: list.filter((n) => n.level === 'intermediate').length,
      advanced: list.filter((n) => n.level === 'advanced').length,
      words: list.reduce((s, n) => s + n.words, 0),
    },
    tags: allTags,
    levels: LEVELS,
    baseLang: BASE_LANG,
    langs: [BASE_LANG, ...TRANSLATED_LANGS],
    readingPath: readingPath.map((n) => n.id),
    nodes: list,
    relations,
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
  fs.writeFileSync(OUT_JSON, JSON.stringify(graph, null, 2), 'utf8')
  fs.writeFileSync(OUT_INDEX, renderIndex(graph, nodes), 'utf8')

  if (!quiet) {
    const s = graph.stats
    console.log(
      '[graph] ' + s.nodes + ' node · ' + s.branches + ' nhánh · ' +
      s.deep + ' deep / ' + s.stub + ' stub · ' + s.relations + ' liên kết · ' +
      s.withPrompt + '/' + s.nodes + ' có prompt · ' + s.withUnity + ' có Unity · ' +
      TRANSLATED_LANGS.map((lg) => s.translated[lg] + '/' + s.nodes + ' ' + lg).join(' · ') + ' · ' +
      s.basic + ' cơ bản / ' + s.intermediate + ' trung cấp / ' + s.advanced + ' chuyên sâu · ' +
      s.words + ' từ'
    )
    warnings.forEach((w) => console.warn('  ! ' + w))
    errors.forEach((e) => console.error('  X ' + e))
  }
  if (strict && (errors.length || warnings.length)) process.exit(1)
  return graph
}

/* ---------------------------- KNOWLEDGE_INDEX.md -------------------------- */

function renderIndex(graph, nodes) {
  const L = []
  const s = graph.stats
  L.push('# KNOWLEDGE_INDEX')
  L.push('')
  L.push('> **File này do máy sinh ra — đừng sửa tay.** Chạy `npm run graph` để tạo lại.')
  L.push('> Đây là mục lục phẳng của toàn bộ kho kiến thức, dành cho AI agent (Codex / Claude Code)')
  L.push('> đọc nhanh trước khi mở từng file `content/**/*.md` chi tiết.')
  L.push('')
  L.push('Cập nhật: `' + graph.generatedAt + '` · ' + s.nodes + ' node · ' + s.deep +
         ' deep · ' + s.stub + ' stub · ' + s.words + ' từ')
  L.push('')
  L.push('Mức độ: **' + s.basic + ' cơ bản** · ' + s.intermediate + ' trung cấp · ' +
         s.advanced + ' chuyên sâu')
  L.push('')

  /* ------------------------- lộ trình đọc (1 → N) ------------------------- */
  L.push('## Lộ trình đọc')
  L.push('')
  L.push('Thứ tự khuyến nghị cho người đọc lần đầu. Cột **Mức** cho biết node đó là kiến')
  L.push('thức cơ bản (ai cũng nên đọc), trung cấp (cần nền), hay chuyên sâu (chỉ đọc khi cần).')
  L.push('')
  L.push('| # | Node | Mức | Trạng thái | File |')
  L.push('|---|---|---|---|---|')
  const LEVEL_VI = { basic: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Chuyên sâu' }
  for (const id of graph.readingPath) {
    const n = nodes.get(id)
    L.push('| ' + n.readIndex + ' | **' + n.title + '** `#' + n.id + '` | ' +
           (LEVEL_VI[n.level] || '—') + ' | ' + n.status + ' | `content/' + n.path + '` |')
  }
  L.push('')

  L.push('## Cây kiến thức')
  L.push('')

  const line = (id, prefix) => {
    const n = nodes.get(id)
    const badge = n.status === 'stub' ? ' _(stub — cần viết thêm)_' : ''
    const prompt = (n.aiPrompt ? ' 🤖' : '') + (n.unity ? ' 🎮' : '') + (n.i18n.en ? ' 🇬🇧' : '')
    const mark = { basic: '●', intermediate: '◐', advanced: '○' }[n.level] || '·'
    L.push(prefix + '- ' + mark + ' `#' + n.readIndex + '` **' + n.title + '** `#' + n.id + '`' +
           badge + prompt + ' — ' + (n.summary || '(chưa có summary)') +
           ' → `content/' + n.path + '`')
    for (const c of n.children) line(c, prefix + '  ')
  }
  line(graph.root, '')
  L.push('')
  L.push('> **Ký hiệu:** ● cơ bản · ◐ trung cấp · ○ chuyên sâu · `#N` = thứ tự trong lộ trình đọc')
  L.push('>')
  L.push('> 🎮 = node có mục **Unity**: cách hiện thực hoá bước đó trong Unity (code C# + sơ đồ setup).')
  L.push('>')
  L.push('> 🇬🇧 = node đã có bản dịch tiếng Anh tại `<tên-file>.en.md`.')
  L.push('>')
  L.push('> 🤖 = node có mục **Prompt cho AI**: hướng dẫn cách diễn đạt yêu cầu cho')
  L.push('> chủ đề đó (phải nêu rõ gì, mẫu prompt, bẫy thường gặp). Đọc mục này trước')
  L.push('> khi viết prompt về chủ đề tương ứng.')

  L.push('')
  L.push('## Liên kết ngang (cross-reference)')
  L.push('')
  if (!graph.relations.length) L.push('_(chưa có)_')
  for (const r of graph.relations) {
    L.push('- `#' + r.source + '` ↔ `#' + r.target + '` (' + r.type + ')')
  }

  L.push('')
  L.push('## Tag')
  L.push('')
  L.push(graph.tags.length ? graph.tags.map((t) => '`' + t + '`').join(' · ') : '_(chưa có)_')
  L.push('')
  return L.join('\n')
}

/* --------------------------------- watch --------------------------------- */

function watch() {
  build()
  let timer = null
  fs.watch(CONTENT_DIR, { recursive: true }, (_evt, file) => {
    if (file && !String(file).endsWith('.md')) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      try { build() } catch (e) { console.error('[graph] lỗi build:', e.message) }
    }, 150)
  })
  console.log('[graph] đang theo dõi content/ ...')
}

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invoked === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--watch')) watch()
  else build({ strict: process.argv.includes('--strict') })
}

export { build, watch }
