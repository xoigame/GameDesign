import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap, useReactFlow, BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import MindNode from './MindNode.jsx'
import { computeLayout, visibleIds, GAP } from '../lib/layout.js'

const nodeTypes = { mind: MindNode }

/**
 * Node mindmap có kích thước CỐ ĐỊNH — layout ở lib/layout.js dựa vào điều đó.
 * `compact` là bộ kích thước cho màn hình hẹp: hẹp và thấp hơn, để cả bản đồ lọt
 * vào khung ~375px ở mức zoom vẫn còn đọc được chữ.
 */
const widthFor = (depth, compact) => (compact
  ? (depth === 0 ? 172 : depth === 1 ? 166 : 156)
  : (depth === 0 ? 250 : depth === 1 ? 228 : 206))
const HEIGHT = 46
const ROOT_HEIGHT = 58
// Cao hơn bản cũ vì chữ trên node compact được phóng to cho đọc được ở mức zoom
// thật — xem .mind-node.is-compact trong styles.css. Hai dòng tiêu đề phải lọt.
const COMPACT_HEIGHT = 46
const COMPACT_ROOT_HEIGHT = 52

/**
 * Tham số canh khung. Điểm mấu chốt của bản mobile là `minZoom`: thà để người
 * dùng vuốt tìm còn hơn thu cả bản đồ xuống mức zoom 0,15 — chữ thành hạt vừng,
 * đó đúng là lỗi đang phải sửa.
 */
const FIT = {
  wide: { padding: 0.14, minZoom: 0.12, maxZoom: 1.3 },
  // Trên mobile thanh công cụ nằm đè lên mép trên canvas, nên chừa chỗ cho nó —
  // nếu không, node gốc chui xuống dưới thanh ngay khi vừa mở trang.
  //
  // `minZoom` cao là quyết định có chủ ý: canh khung cho VỪA HẾT bản đồ trên màn
  // 375px đồng nghĩa với chữ 8–9px. Thà cắt bớt phần rìa và để người dùng vuốt —
  // vuốt thì ai cũng biết làm, còn chữ nhỏ thì không cứu được. Nút ⛶ ở góc dưới
  // phải vẫn cho xem toàn cảnh khi cần.
  compact: {
    padding: { top: '58px', right: '10px', bottom: '14px', left: '10px' },
    minZoom: 0.85,
    maxZoom: 1.15,
  },
}

export default function MindMap({
  nodesById, rootId, mapRoots, relations, collapsed, onToggle,
  selectedId, onSelect, mode, keepSet, showRelations, lang, mastery, compact = false,
}) {
  const { fitView, getNodes } = useReactFlow()
  /**
   * KHÔNG chờ useNodesInitialized(): `nodes` là prop controlled và component này
   * cố tình không có onNodesChange, nên React Flow không bao giờ ghi ngược kích
   * thước đo được vào store — cờ đó đứng mãi ở false, và mọi effect chờ nó thì
   * không bao giờ chạy. Bù lại, mỗi node đã khai width/height tường minh nên
   * bounds tính được ngay; chỉ cần nhường một nhịp cho React Flow nạp danh sách
   * node mới rồi gọi fitView.
   */
  // node vừa bấm bung/thu — dùng để kéo khung về đúng chỗ đó trên màn hẹp
  const [focusId, setFocusId] = useState(null)

  /**
   * Canh khung SAU KHI React Flow đã nạp danh sách node mới.
   * Gọi fitView quá sớm là fit vào bounding box rỗng — viewport về identity và
   * nằm im ở đó, vì lần fit sau bị đánh dấu là "đã fit rồi". Đây đúng là lỗi
   * làm bản đồ trên mobile trông như không canh khung bao giờ.
   */
  const fitTimer = useRef(0)
  const fitSoon = useCallback((options) => {
    clearTimeout(fitTimer.current)
    let tries = 0
    const tick = () => {
      // measured được React Flow điền từ width/height tường minh của node
      const ready = getNodes().some((n) => n.measured && n.measured.width)
      if (ready || tries++ > 20) { fitView(options); return }
      fitTimer.current = setTimeout(tick, 25)
    }
    tick()
  }, [fitView, getNodes])
  useEffect(() => () => clearTimeout(fitTimer.current), [])
  const handleToggle = useCallback((id) => { setFocusId(id); onToggle(id) }, [onToggle])
  const filtering = keepSet !== null
  // Nhánh có bản đồ riêng (`map: true`) bị cắt khỏi bản đồ cha — nó được vẽ ở bản đồ
  // của chính nó. Bộ lọc chỉ áp cho CON nên gốc bản đồ hiện tại vẫn luôn hiện.
  const hasMapCut = !!(mapRoots && mapRoots.size)
  const inThisMap = (id) => !hasMapCut || !mapRoots.has(id)
  const childFilter = filtering
    ? (id) => keepSet.has(id) && inThisMap(id)
    : (hasMapCut ? inThisMap : null)
  // khi đang lọc thì bỏ qua trạng thái thu gọn để kết quả luôn hiện ra
  const effectiveCollapsed = filtering ? new Set() : collapsed

  const pathToRoot = useMemo(() => {
    const set = new Set()
    let cur = selectedId
    while (cur) {
      set.add(cur)
      const n = nodesById.get(cur)
      cur = n ? n.parent : null
    }
    return set
  }, [selectedId, nodesById])

  const { rfNodes, rfEdges } = useMemo(() => {
    const pos = computeLayout(nodesById, rootId, effectiveCollapsed, mode, childFilter,
                              compact ? GAP.compact : GAP.wide)
    const visible = new Set(visibleIds(nodesById, rootId, effectiveCollapsed, childFilter))

    const rfNodes = []
    for (const id of visible) {
      const node = nodesById.get(id)
      const p = pos.get(id)
      if (!node || !p) continue
      const isRoot = id === rootId
      const w = widthFor(node.depth, compact)
      const h = isRoot
        ? (compact ? COMPACT_ROOT_HEIGHT : ROOT_HEIGHT)
        : (compact ? COMPACT_HEIGHT : HEIGHT)

      let x
      let y = p.y - h / 2
      // Kiểu 'tree' trên màn hẹp: dồn gốc sát mép trái thay vì căn giữa quanh x=0.
      // Nửa node gốc thò sang trái là ~90px bề ngang chết, và trên khung 375px thì
      // 90px đó đổi thẳng thành ~20% mức zoom.
      if (isRoot) {
        x = (compact && mode === 'tree') ? 0 : -w / 2
        y = -h / 2
      }
      else if (mode === 'radial') { x = p.x - w / 2 }
      else if (p.side === 'left') { x = p.x - w }
      else { x = p.x }

      const childCount = node.children.filter((c) => !childFilter || childFilter(c)).length

      rfNodes.push({
        id,
        type: 'mind',
        position: { x, y },
        // Kích thước tường minh: nodes là controlled mà không có onNodesChange,
        // nên store không tự ghi lại kích thước đo được — thiếu nó thì MiniMap
        // không vẽ node nào và fitView phải chờ thêm một nhịp.
        width: w,
        height: h,
        style: { width: w, height: h },
        selectable: true,
        draggable: false,
        data: {
          node,
          side: p.side,
          isRoot,
          isSelected: id === selectedId,
          onPath: pathToRoot.has(id) && id !== selectedId,
          dimmed: false,
          collapsed: collapsed.has(id) && !filtering,
          childCount,
          onToggle: handleToggle,
          lang,
          mastery: mastery ? mastery.get(id) ?? null : null,
          compact,
        },
      })
    }

    const rfEdges = []
    for (const id of visible) {
      const node = nodesById.get(id)
      if (!node || !node.parent || !visible.has(node.parent)) continue
      const side = pos.get(id) ? pos.get(id).side : 'right'
      const onPath = pathToRoot.has(id)
      rfEdges.push({
        id: 'e-' + node.parent + '-' + id,
        source: node.parent,
        target: id,
        sourceHandle: side === 'left' ? 'sl' : 'sr',
        targetHandle: side === 'left' ? 'r' : 'l',
        type: 'default',
        style: {
          stroke: node.color,
          strokeWidth: onPath ? 2.6 : Math.max(1.1, 2.4 - node.depth * 0.42),
          opacity: onPath ? 1 : 0.55,
        },
      })
    }

    // Liên kết ngang: mặc định chỉ vẽ những cạnh chạm node đang chọn (tránh rối
    // mắt với ~180 quan hệ). Bật nút "Liên kết" để xem toàn bộ.
    if (showRelations || selectedId) {
      for (const r of relations) {
        if (!visible.has(r.source) || !visible.has(r.target)) continue
        const touched = r.source === selectedId || r.target === selectedId
        if (!showRelations && !touched) continue
        const ps = pos.get(r.source)
        const pt = pos.get(r.target)
        if (!ps || !pt) continue
        rfEdges.push({
          id: 'r-' + r.source + '-' + r.target,
          source: r.source,
          target: r.target,
          sourceHandle: pt.x >= ps.x ? 'sr' : 'sl',
          targetHandle: pt.x >= ps.x ? 'l' : 'r',
          type: 'default',
          style: {
            stroke: touched ? '#ffd43b' : '#7d8597',
            strokeWidth: touched ? 1.8 : 1,
            strokeDasharray: '5 5',
            opacity: touched ? 0.95 : 0.28,
          },
          zIndex: touched ? 5 : 0,
        })
      }
    }

    return { rfNodes, rfEdges }
  }, [
    nodesById, rootId, relations, mode, selectedId, pathToRoot,
    effectiveCollapsed, collapsed, keepSet, mapRoots, showRelations, handleToggle, filtering, lang, mastery,
    compact,
  ])

  /**
   * Trên màn hẹp, bung một nhánh làm cả cây dịch chỗ (d3 căn cha theo đàn con),
   * nên node vừa bấm nhảy ra khỏi khung — bấm xong không thấy gì là lỗi nặng hơn
   * cả chuyện chữ nhỏ. Sau mỗi lần bung/thu, kéo khung về đúng nhánh vừa bấm.
   * Màn rộng không cần: cả cây vẫn nằm trong tầm mắt.
   */
  // Bấm vào node cũng làm cây dịch chỗ: App.select() mở node được chọn ra.
  // Trên mobile panel che hết màn hình, nên cú dịch chỉ lộ ra lúc đóng panel —
  // khó hiểu hơn hẳn. Coi node vừa chọn như node vừa bấm bung.
  useEffect(() => {
    if (compact && selectedId) setFocusId(selectedId)
  }, [selectedId, compact])

  useEffect(() => {
    if (!compact || !focusId) return
    const target = [{ id: focusId }]
    const n = nodesById.get(focusId)
    if (n && !effectiveCollapsed.has(focusId)) {
      for (const c of n.children) if (!childFilter || childFilter(c)) target.push({ id: c })
    }
    const t = setTimeout(() => {
      fitSoon({ ...FIT.compact, nodes: target, duration: 320 })
      setFocusId(null)
    }, 40)
    return () => clearTimeout(t)
    // childFilter được tạo lại mỗi lần render nên cố tình không đưa vào deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, effectiveCollapsed, compact, fitSoon, nodesById])

  // Fit view khi đổi layout hoặc bộ lọc — chờ React Flow đo xong kích thước node,
  // nếu không sẽ fit vào bounding box rỗng và cho ra khung hình lệch.
  const fitKey = mode + '|' + rootId + '|' + (filtering ? keepSet.size : 'all') + '|' + (compact ? 'c' : 'w')
  const lastFit = useRef('')
  useEffect(() => {
    if (lastFit.current === fitKey) return
    const fit = compact ? FIT.compact : FIT.wide
    // Đánh dấu "đã fit" BÊN TRONG timeout, không phải trước nó. StrictMode gắn
    // rồi tháo effect một lượt lúc mount: nếu đánh dấu trước, lần tháo sẽ huỷ
    // timeout duy nhất còn lần gắn lại thì thấy đã đánh dấu và bỏ qua — kết quả
    // là bản đồ không bao giờ được canh khung, đúng triệu chứng "mindmap nhỏ xíu".
    const t = setTimeout(() => {
      const first = lastFit.current === ''
      lastFit.current = fitKey
      // Lần canh khung đầu tiên đặt duration 0: hoạt ảnh của d3 chạy bằng
      // requestAnimationFrame, mà rAF bị dừng khi tab ở nền — mở trang trong tab
      // nền rồi quay lại sẽ thấy bản đồ chưa canh khung. Đổi layout thì mới cần
      // hoạt ảnh, lúc đó chắc chắn tab đang hiện.
      fitSoon({ ...fit, duration: first ? 0 : 400 })
    }, 30)
    return () => clearTimeout(t)
  }, [fitKey, fitSoon, compact])

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={(_e, n) => onSelect(n.id)}
      onNodeDoubleClick={(_e, n) => handleToggle(n.id)}
      onPaneClick={() => onSelect(null)}
      minZoom={0.08}
      maxZoom={2.2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      fitView
      fitViewOptions={compact ? FIT.compact : { ...FIT.wide, padding: 0.18 }}
    >
      <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="#2a3040" />
      <Controls
        showInteractive={false}
        position="bottom-right"
        fitViewOptions={compact ? FIT.compact : FIT.wide}
      />
      <MiniMap
        pannable
        zoomable
        position="bottom-left"
        maskColor="rgba(10,13,20,0.72)"
        nodeColor={(n) => (n.data && n.data.node ? n.data.node.color : '#888')}
        nodeStrokeWidth={0}
        style={{ background: '#11151f', border: '1px solid #232a3a', borderRadius: 8 }}
        className="mini"
      />
    </ReactFlow>
  )
}
