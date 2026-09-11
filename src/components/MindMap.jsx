import { useMemo, useEffect, useRef } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap, useReactFlow, BackgroundVariant,
  useNodesInitialized,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import MindNode from './MindNode.jsx'
import { computeLayout, visibleIds } from '../lib/layout.js'

const nodeTypes = { mind: MindNode }

const widthFor = (depth) => (depth === 0 ? 250 : depth === 1 ? 228 : 206)
const HEIGHT = 46
const ROOT_HEIGHT = 58

export default function MindMap({
  nodesById, rootId, relations, collapsed, onToggle,
  selectedId, onSelect, mode, keepSet, showRelations, lang,
}) {
  const { fitView } = useReactFlow()
  const nodesInitialized = useNodesInitialized()
  const filtering = keepSet !== null
  const childFilter = filtering ? (id) => keepSet.has(id) : null
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
    const pos = computeLayout(nodesById, rootId, effectiveCollapsed, mode, childFilter)
    const visible = new Set(visibleIds(nodesById, rootId, effectiveCollapsed, childFilter))

    const rfNodes = []
    for (const id of visible) {
      const node = nodesById.get(id)
      const p = pos.get(id)
      if (!node || !p) continue
      const isRoot = id === rootId
      const w = widthFor(node.depth)
      const h = isRoot ? ROOT_HEIGHT : HEIGHT

      let x
      let y = p.y - h / 2
      if (isRoot) { x = -w / 2; y = -h / 2 }
      else if (mode === 'radial') { x = p.x - w / 2 }
      else if (p.side === 'left') { x = p.x - w }
      else { x = p.x }

      const childCount = node.children.filter((c) => !childFilter || keepSet.has(c)).length

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
          onToggle,
          lang,
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
    effectiveCollapsed, collapsed, keepSet, showRelations, onToggle, filtering, lang,
  ])

  // Fit view khi đổi layout hoặc bộ lọc — chờ React Flow đo xong kích thước node,
  // nếu không sẽ fit vào bounding box rỗng và cho ra khung hình lệch.
  const fitKey = mode + '|' + (filtering ? keepSet.size : 'all')
  const lastFit = useRef('')
  useEffect(() => {
    if (!nodesInitialized || lastFit.current === fitKey) return
    lastFit.current = fitKey
    const t = setTimeout(() => fitView({ padding: 0.14, duration: 400 }), 30)
    return () => clearTimeout(t)
  }, [fitKey, fitView, nodesInitialized])

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={(_e, n) => onSelect(n.id)}
      onNodeDoubleClick={(_e, n) => onToggle(n.id)}
      onPaneClick={() => onSelect(null)}
      minZoom={0.08}
      maxZoom={2.2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      fitView
      fitViewOptions={{ padding: 0.18 }}
    >
      <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="#2a3040" />
      <Controls showInteractive={false} position="bottom-right" />
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
