import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { LEVEL_GLYPH, levelLabel } from '../lib/levels.js'
import { t, text as tx, field } from '../lib/i18n.js'

function MindNode({ data }) {
  const {
    node, side, isRoot, isSelected, onPath, dimmed,
    collapsed, childCount, onToggle, lang, mastery, compact,
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
    compact ? 'is-compact' : '',
  ].filter(Boolean).join(' ')

  const tip =
    '#' + node.readIndex + ' · ' + levelLabel(node.level, lang) +
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
              title={t('masteryTitle', lang).replace('{p}', Math.round(mastery * 100))} />
      )}
      <span className="mn-num" title={t('readOrder', lang)}>{node.readIndex}</span>
      {node.icon ? <span className="mn-icon">{node.icon}</span> : null}
      <span className="mn-title">{title}</span>

      <span className="mn-lv" title={levelLabel(node.level, lang)}>{LEVEL_GLYPH[node.level] || '·'}</span>
      {node.status === 'stub' && <span className="mn-dot" title={t('stubTitle', lang)} />}

      {childCount > 0 && (
        <button
          type="button"
          className={'mn-toggle' + (collapsed ? ' is-collapsed' : '')}
          data-side={side}
          onClick={(e) => { e.stopPropagation(); onToggle(node.id) }}
          title={t(collapsed ? 'expandChildren' : 'collapseChildren', lang)
            .replace('{n}', childCount)}
        >
          {collapsed ? childCount : '−'}
        </button>
      )}
    </div>
  )
}

export default memo(MindNode)
