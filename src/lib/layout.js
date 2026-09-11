import { hierarchy, tree } from 'd3-hierarchy'

/**
 * Tính toạ độ cho mindmap từ cây node.
 * Trả về Map<id, {x, y, side}> — side là 'left' | 'right' (dùng để chọn hướng handle).
 *
 * mode:
 *   'mindmap' — hai bên, root ở giữa (kiểu sơ đồ tư duy kinh điển)
 *   'tree'    — cây trái → phải, một bên
 *   'radial'  — toả tròn quanh root
 */

const NODE_GAP_Y = 58   // khoảng cách dọc giữa 2 node anh em
const NODE_GAP_X = 300  // khoảng cách ngang giữa 2 tầng

function buildTree(nodesById, rootId, isCollapsed, childFilter) {
  const make = (id, depth) => {
    const n = nodesById.get(id)
    if (!n) return null
    const node = { id, depth, data: n, children: [] }
    if (!isCollapsed(id)) {
      for (const childId of n.children) {
        if (childFilter && !childFilter(childId)) continue
        const child = make(childId, depth + 1)
        if (child) node.children.push(child)
      }
    }
    return node
  }
  return make(rootId, 0)
}

function runTree(rootSpec) {
  const root = hierarchy(rootSpec, (d) => d.children)
  const layout = tree()
    .nodeSize([NODE_GAP_Y, NODE_GAP_X])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.45))
  return layout(root)
}

/** Đếm tổng số hậu duệ để chia nhánh trái/phải cho cân. */
function subtreeSize(spec) {
  let n = 1
  for (const c of spec.children) n += subtreeSize(c)
  return n
}

export function computeLayout(nodesById, rootId, collapsedSet, mode = 'mindmap', childFilter = null) {
  const isCollapsed = (id) => collapsedSet.has(id)
  const spec = buildTree(nodesById, rootId, isCollapsed, childFilter)
  const pos = new Map()
  if (!spec) return pos

  if (mode === 'radial') {
    const laid = runTree(spec)
    const maxDepth = Math.max(1, ...laid.descendants().map((d) => d.depth))
    const xs = laid.descendants().map((d) => d.x)
    const span = Math.max(1, Math.max(...xs) - Math.min(...xs))
    const minX = Math.min(...xs)
    const radiusStep = 260

    for (const d of laid.descendants()) {
      if (d.depth === 0) {
        pos.set(d.data.id, { x: 0, y: 0, side: 'right' })
        continue
      }
      const angle = ((d.x - minX) / span) * Math.PI * 1.92 - Math.PI * 0.96
      const r = d.depth * radiusStep
      pos.set(d.data.id, {
        x: Math.sin(angle) * r,
        y: -Math.cos(angle) * r,
        side: Math.sin(angle) >= 0 ? 'right' : 'left',
        angle,
        maxDepth,
      })
    }
    return pos
  }

  if (mode === 'tree') {
    const laid = runTree(spec)
    for (const d of laid.descendants()) {
      pos.set(d.data.id, { x: d.y, y: d.x, side: 'right' })
    }
    return pos
  }

  // --- mindmap hai bên ---
  const branches = spec.children
  if (branches.length === 0) {
    pos.set(spec.id, { x: 0, y: 0, side: 'right' })
    return pos
  }

  // chia nhánh sao cho tổng kích thước hai bên gần bằng nhau
  const sized = branches.map((b) => ({ spec: b, size: subtreeSize(b) }))
  const right = []
  const left = []
  let rw = 0
  let lw = 0
  for (const item of sized) {
    if (rw <= lw) { right.push(item.spec); rw += item.size }
    else { left.push(item.spec); lw += item.size }
  }

  const placeSide = (children, side) => {
    if (!children.length) return
    const fakeRoot = { id: '__side_' + side, depth: 0, data: spec.data, children }
    const laid = runTree(fakeRoot)
    const dir = side === 'right' ? 1 : -1
    // căn giữa theo trục dọc quanh root
    const rootX = laid.x
    for (const d of laid.descendants()) {
      if (d.depth === 0) continue
      pos.set(d.data.id, { x: dir * d.y, y: d.x - rootX, side })
    }
  }

  placeSide(right, 'right')
  placeSide(left, 'left')
  pos.set(spec.id, { x: 0, y: 0, side: 'right' })
  return pos
}

/** Các id đang hiển thị với trạng thái collapse hiện tại. */
export function visibleIds(nodesById, rootId, collapsedSet, childFilter = null) {
  const out = []
  const walk = (id) => {
    const n = nodesById.get(id)
    if (!n) return
    out.push(id)
    if (collapsedSet.has(id)) return
    for (const c of n.children) {
      if (childFilter && !childFilter(c)) continue
      walk(c)
    }
  }
  walk(rootId)
  return out
}
