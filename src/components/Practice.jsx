import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { t, text as tx } from '../lib/i18n.js'
import SpeakButton from './SpeakButton.jsx'
import {
  buildDeck, deckStats, grade, loadProgress, pickSession, saveProgress, BOX_DAYS,
} from '../lib/practice.js'

const LEVELS = [
  { id: 'core', vi: 'Câu lõi', en: 'Core' },
  { id: 'junior', vi: 'Junior', en: 'Junior' },
  { id: 'mid', vi: 'Mid', en: 'Mid' },
  { id: 'senior', vi: 'Senior', en: 'Senior' },
]

const md = (content) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
)

/**
 * Luyện phỏng vấn: hỏi — tự trả lời thành tiếng — mở khung trả lời — tự chấm.
 * Tiến độ nằm ở localStorage (xem src/lib/practice.js), không gửi đi đâu.
 */
export default function Practice({ graph, nodesById, lang, onSelect, onProgress }) {
  const [progress, setProgress] = useState(loadProgress)
  const [branch, setBranch] = useState('all')
  const [levels, setLevels] = useState(() => new Set())
  const [seed, setSeed] = useState(() => Date.now() % 100000)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)
  const cardRef = useRef(null)

  const fullDeck = useMemo(() => buildDeck(graph, nodesById), [graph, nodesById])

  /** Nhánh gốc của một node, để lọc theo mảng kiến thức. */
  const branchOf = useCallback((nodeId) => {
    let cur = nodesById.get(nodeId)
    while (cur && cur.parent && cur.parent !== graph.root) cur = nodesById.get(cur.parent)
    return cur ? cur.id : nodeId
  }, [nodesById, graph.root])

  const branches = useMemo(() => {
    const ids = new Set(fullDeck.map((c) => branchOf(c.nodeId)))
    return [...ids].map((id) => nodesById.get(id)).filter(Boolean)
  }, [fullDeck, branchOf, nodesById])

  const deck = useMemo(() => fullDeck.filter((c) =>
    (branch === 'all' || branchOf(c.nodeId) === branch) &&
    (levels.size === 0 || levels.has(c.level))
  ), [fullDeck, branch, levels, branchOf])

  const stats = useMemo(() => deckStats(deck, progress), [deck, progress])
  const session = useMemo(() => pickSession(deck, progress, { limit: 20, seed }),
    // progress cố tình KHÔNG nằm trong deps: đổi phiên giữa chừng thì thẻ nhảy lung tung.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck, seed])

  const card = session[idx] || null
  const node = card ? nodesById.get(card.nodeId) : null

  useEffect(() => { setIdx(0); setRevealed(false); setDone(0) }, [branch, levels, seed])

  const rate = useCallback((result) => {
    if (!card) return
    const next = grade(progress, card.id, result)
    setProgress(next)
    saveProgress(next)
    onProgress?.(next)
    setDone((d) => d + 1)
    setRevealed(false)
    setIdx((i) => i + 1)
  }, [card, progress, onProgress])

  const newSession = () => setSeed(Date.now() % 100000)

  /* phím tắt: cách = mở đáp án, 1/2/3 = tự chấm, o = mở node */
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (!card) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRevealed(true); return }
      if (e.key === 'o') { onSelect(card.nodeId); return }
      if (!revealed) return
      if (e.key === '1') rate('again')
      if (e.key === '2') rate('hard')
      if (e.key === '3') rate('good')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, revealed, rate, onSelect])

  const en = lang === 'en'
  const L = (vi, enText) => (en ? enText : vi)

  return (
    <div className="practice">
      <header className="pr-head">
        <div className="pr-stats">
          <span className="pr-stat"><b>{stats.due}</b> {L('đến hạn', 'due')}</span>
          <span className="pr-stat"><b>{stats.learned}</b> {L('đã thuộc', 'learned')}</span>
          <span className="pr-stat pr-muted">{stats.total} {L('thẻ', 'cards')}</span>
        </div>

        <div className="pr-filters">
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="pr-select">
            <option value="all">{L('Mọi nhánh', 'All branches')}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.icon ? b.icon + ' ' : ''}{tx(b, 'title', en ? 'en' : 'vi')}
              </option>
            ))}
          </select>

          <div className="pr-levels">
            {LEVELS.map((lv) => (
              <button
                key={lv.id}
                className={'pr-chip' + (levels.has(lv.id) ? ' on' : '')}
                onClick={() => setLevels((prev) => {
                  const next = new Set(prev)
                  next.has(lv.id) ? next.delete(lv.id) : next.add(lv.id)
                  return next
                })}
              >{en ? lv.en : lv.vi}</button>
            ))}
          </div>

          <button className="btn" onClick={newSession}>{L('Phiên mới', 'New session')}</button>
        </div>
      </header>

      {!card ? (
        <div className="pr-empty">
          {session.length === 0 && deck.length === 0 ? (
            <>
              <h3>{L('Không có thẻ nào khớp bộ lọc', 'No cards match the filter')}</h3>
              <p>{L('Thử bỏ bớt bộ lọc, hoặc thêm mục 🎤 Phỏng vấn cho node trong content/.',
                    'Loosen the filter, or add a 🎤 section to a node in content/.')}</p>
            </>
          ) : (
            <>
              <h3>{L('Xong phiên này', 'Session done')}</h3>
              <p>{L('Đã ôn ' + done + ' thẻ. Thẻ chấm "chưa được" sẽ quay lại ngay hôm nay; thẻ "thuộc" hẹn gặp lại sau ' + BOX_DAYS[BOX_DAYS.length - 1] + ' ngày.',
                    'Reviewed ' + done + ' cards. Cards you marked "not yet" come back today; "solid" ones return in ' + BOX_DAYS[BOX_DAYS.length - 1] + ' days.')}</p>
              <button className="btn" onClick={newSession}>{L('Phiên mới', 'New session')}</button>
            </>
          )}
        </div>
      ) : (
        <div className="pr-card" ref={cardRef}>
          <div className="pr-bar">
            <span className="pr-progress" style={{ width: ((idx / session.length) * 100) + '%' }} />
          </div>

          <div className="pr-meta">
            <button className="pr-node" onClick={() => onSelect(card.nodeId)} title={L('Mở node (phím o)', 'Open node (key o)')}>
              {node?.icon ? node.icon + ' ' : ''}{node ? tx(node, 'title', en ? 'en' : 'vi') : card.nodeId}
            </button>
            <span className={'pr-chip is-' + card.level}>{
              en ? (LEVELS.find((l) => l.id === card.level)?.en || card.level)
                 : (LEVELS.find((l) => l.id === card.level)?.vi || card.level)
            }</span>
            {/* Nghe câu hỏi — và sau khi lật thì nghe luôn lời giải. Luyện phỏng
                vấn là luyện tai lẫn miệng, nên đọc được là phần thiếu rõ nhất. */}
            <SpeakButton boxRef={cardRef} watch={card.id + (revealed ? ':a' : ':q')} lang={lang} />
            <span className="pr-count">{idx + 1} / {session.length}</span>
          </div>

          <div className="pr-question md" data-tts="vi">{md(card.question)}</div>

          {!revealed ? (
            <div className="pr-actions">
              <p className="pr-hint">{L('Trả lời thành tiếng trước — đó mới là thứ bạn phải làm trong phòng phỏng vấn.',
                                         'Answer out loud first — that is the thing you will actually have to do.')}</p>
              <button className="btn pr-reveal" onClick={() => setRevealed(true)}>
                {L('Hiện khung trả lời', 'Show the answer frame')} <kbd>space</kbd>
              </button>
            </div>
          ) : (
            <div className="pr-answer" data-tts="vi">
              {/* Lời giải của ĐÚNG câu vừa hỏi. Thẻ câu lõi lấy luôn khung 60 giây
                  làm lời giải — khung đó vốn được viết cho chính câu đó. */}
              <section>
                <h4>{card.isFrame
                  ? L('Khung trả lời 60 giây', '60-second frame')
                  : L('Lời giải', 'Answer')}</h4>
                {card.answer
                  ? <div className="md pr-frame">{md(card.answer)}</div>
                  : <p className="pr-todo">{L(
                      'Câu này chưa có lời giải riêng trong content/. Xem tạm khung trả lời bên dưới, rồi bổ sung "→ lời giải" cho câu này.',
                      'This question has no answer of its own in content/ yet. Use the frame below, then add a "→ answer" line for it.')}</p>}
              </section>

              {!card.isFrame && card.parsed.frame && (
                <details className="pr-more">
                  <summary>
                    {L('Khung trả lời 60 giây của node', 'The node\u2019s 60-second frame')}
                    {card.parsed.frameQuestion ? ' — “' + card.parsed.frameQuestion + '”' : ''}
                  </summary>
                  <div className="md pr-frame">{md(card.parsed.frame)}</div>
                </details>
              )}
              {card.parsed.followUps.length > 0 && (
                <section>
                  <h4>{L('Họ sẽ đào tiếp', 'Follow-up probes')}</h4>
                  <ul className="md">{card.parsed.followUps.map((f, i) => <li key={i}>{md(f)}</li>)}</ul>
                </section>
              )}
              {card.parsed.redFlags.length > 0 && (
                <section className="pr-red">
                  <h4>{L('Cờ đỏ', 'Red flags')}</h4>
                  <ul className="md">{card.parsed.redFlags.map((f, i) => <li key={i}>{md(f)}</li>)}</ul>
                </section>
              )}
              {card.parsed.facts.length > 0 && (
                <section>
                  <h4>{L('Số / ví dụ nên thuộc', 'Numbers to know')}</h4>
                  <ul className="md">{card.parsed.facts.map((f, i) => <li key={i}>{md(f)}</li>)}</ul>
                </section>
              )}

              <div className="pr-rate">
                <button className="pr-btn again" onClick={() => rate('again')}>
                  {L('Chưa được', 'Not yet')} <kbd>1</kbd>
                </button>
                <button className="pr-btn hard" onClick={() => rate('hard')}>
                  {L('Nói được nhưng vấp', 'Shaky')} <kbd>2</kbd>
                </button>
                <button className="pr-btn good" onClick={() => rate('good')}>
                  {L('Trôi chảy', 'Solid')} <kbd>3</kbd>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
