import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { LEVEL_VI, LEVEL_GLYPH } from '../lib/levels.js'
import { text as tx, field } from '../lib/i18n.js'

function MindNode({ data }) {
  const {
    node, side, isRoot, isSelected, onPath, dimmed,
    collapsed, childCount, onToggle, lang, mastery,
  } = data

  // Trên mindmap luôn hiện MỘT tiêu đề cho gọn; chế độ song ngữ dùng bản gốc
  // và đưa bản dịch vào tooltip.
  const primary = lang === 'en' ? 'en' : 'vi'
  const title = tx(node, 'title', primary)
  const alt = lang === 'both' ? field(node, 'title', 'en') : null

  const cls = [
    'mind-node',
    isRoot ? 'is-root' : '',
    'depth-' + Math.min(node.depth, 3),
    'lv-' + (node.level || 'none'),
    isSelected ? 'is-selected' : '',
    onPath ? 'on-path' : '',
    dimmed ? 'is-dimmed' : '',
    node.status === 'stub' ? 'is-stub' : '',
  ].filter(Boolean).join(' ')

  const tip =
    '#' + node.readIndex + ' · ' + LEVEL_VI[node.level] +
    (alt && alt.translated ? '\n' + alt.text : '') +
    (node.summary ? '\n' + tx(node, 'summary', primary) : '')

  return (
    <div className={cls} style={{ '--accent': node.color }} title={tip}>
      <Handle type="target" position={Position.Left} id="l" className="rf-handle" />
      <Handle type="target" position={Position.Right} id="r" className="rf-handle" />
      <Handle type="source" position={Position.Left} id="sl" className="rf-handle" />
      <Handle type="source" position={Position.Right} id="sr" className="rf-handle" />

      <span className="mn-bar" />
      {mastery != null && mastery > 0 && (
        <span className="mn-mastery" style={{ '--m': mastery }}
              title={'Đã thuộc ' + Math.round(mastery * 100) + '% số câu phỏng vấn của node này'} />
      )}
      <span className="mn-num" title={'Thứ tự đọc: ' + node.readIndex}>{node.readIndex}</span>
      {node.icon ? <span className="mn-icon">{node.icon}</span> : null}
      <span className="mn-title">{title}</span>

      <span className="mn-lv" title={LEVEL_VI[node.level]}>{LEVEL_GLYPH[node.level] || '·'}</span>
      {node.status === 'stub' && <span className="mn-dot" title="Stub — chưa viết sâu" />}

      {childCount > 0 && (
        <button
          type="button"
          className={'mn-toggle' + (collapsed ? ' is-collapsed' : '')}
          data-side={side}
          onClick={(e) => { e.stopPropagation(); onToggle(node.id) }}
          title={collapsed ? `Mở ${childCount} node con` : `Thu gọn ${childCount} node con`}
        >
          {collapsed ? childCount : '−'}
        </button>
      )}
    </div>
  )
}

export default memo(MindNode)
