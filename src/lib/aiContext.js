/**
 * Sinh khối context dạng markdown để dán thẳng vào Codex / Claude / ChatGPT.
 * Mục tiêu: AI nhận đủ thông tin mà không cần mở repo.
 */

function renderNode(node, nodesById, depth = 0) {
  const L = []
  const h = '#'.repeat(Math.min(6, depth + 2))
  // Ranh giới node rõ ràng: thân bài cũng dùng ## nên cần vạch phân cách
  // để bên đọc (người hoặc AI) không nhầm mục con với node kế tiếp.
  L.push('---')
  L.push('')
  L.push(`${h} ${node.title}  \`#${node.id}\``)
  L.push('')
  L.push(`*Nguồn:* \`content/${node.path}\`` +
    (node.tags.length ? ` · *Tag:* ${node.tags.map((t) => '`' + t + '`').join(' ')}` : '') +
    ` · *Trạng thái:* ${node.status}`)
  L.push('')
  if (node.summary) { L.push(`> ${node.summary}`); L.push('') }
  if (node.body) { L.push(node.body); L.push('') }
  else { L.push('_(node này chưa có nội dung)_'); L.push('') }
  if (node.aiPrompt) {
    L.push(`${'#'.repeat(Math.min(6, depth + 3))} 🤖 Prompt cho AI — ${node.title}`)
    L.push('')
    L.push(node.aiPrompt)
    L.push('')
  }
  return L.join('\n')
}

export function buildAiContext(node, nodesById, { subtree = false } = {}) {
  const L = []
  const chain = []
  let cur = node.parent
  while (cur) {
    const n = nodesById.get(cur)
    if (!n) break
    chain.unshift(n.title)
    cur = n.parent
  }

  L.push('<!-- Trích từ GameDesign Brain — kho kiến thức Game Design & AI in Games -->')
  if (chain.length) L.push(`<!-- Vị trí trong cây: ${chain.join(' → ')} → ${node.title} -->`)
  L.push('')
  L.push(renderNode(node, nodesById, 0))

  if (subtree) {
    const walk = (id, depth) => {
      const n = nodesById.get(id)
      if (!n) return
      L.push(renderNode(n, nodesById, depth))
      for (const c of n.children) walk(c, depth + 1)
    }
    for (const c of node.children) walk(c, 1)
  }

  const related = node.related.map((id) => nodesById.get(id)).filter(Boolean)
  if (related.length) {
    L.push('---')
    L.push('')
    L.push('**Xem thêm các node liên quan:** ' + related.map((r) => `${r.title} (\`#${r.id}\`)`).join(', '))
    L.push('')
  }
  return L.join('\n')
}

/**
 * Playbook: gộp riêng mục "Prompt cho AI" của mọi node.
 * Dùng khi bạn đã nắm kiến thức và chỉ cần phần "giao việc cho AI assistant".
 * Nhỏ hơn bản xuất đầy đủ nhiều lần nên dán thẳng vào chat được.
 */
export function buildPromptPlaybook(graph, nodesById) {
  const L = []
  L.push('# GameDesign Brain — Playbook viết prompt')
  L.push('')
  L.push('Trích riêng mục **🤖 Prompt cho AI** của từng node: với mỗi chủ đề,')
  L.push('phải nêu rõ điều gì, mẫu prompt cụ thể, và bẫy AI thường mắc.')
  L.push('')
  L.push(`Sinh lúc: ${new Date().toISOString()} · ${graph.stats.nodes} node`)
  L.push('')

  const walk = (id, depth) => {
    const n = nodesById.get(id)
    if (!n) return
    if (n.aiPrompt) {
      L.push('---')
      L.push('')
      L.push(`${'#'.repeat(Math.min(6, depth + 2))} ${n.title}  \`#${n.id}\``)
      L.push('')
      if (n.summary) { L.push(`> ${n.summary}`); L.push('') }
      L.push(n.aiPrompt)
      L.push('')
    }
    for (const c of n.children) walk(c, depth + 1)
  }
  walk(graph.root, 0)
  return L.join('\n')
}

/** Xuất toàn bộ kho kiến thức thành một file markdown duy nhất. */
export function buildFullExport(graph, nodesById) {
  const L = []
  L.push('# GameDesign Brain — Toàn bộ kho kiến thức')
  L.push('')
  L.push(`Sinh lúc: ${new Date().toISOString()} · ${graph.stats.nodes} node · ${graph.stats.words} từ`)
  L.push('')
  L.push('Tài liệu này là nguồn thiết kế để AI agent đọc trước khi sinh code game.')
  L.push('')
  const walk = (id, depth) => {
    const n = nodesById.get(id)
    if (!n) return
    L.push(renderNode(n, nodesById, depth))
    for (const c of n.children) walk(c, depth + 1)
  }
  walk(graph.root, 0)
  return L.join('\n')
}
