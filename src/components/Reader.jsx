import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '../lib/i18n.js'
import {
  RATES, collectBlocks, createSpeaker, onVoices, pickVoice, ttsSupported,
  readAuto, readRate, readTtsLang, readVoiceUri, writeAuto, writeRate,
  writeTtsLang, writeVoiceUri,
} from '../lib/tts.js'

/**
 * Thanh đọc thành tiếng cho panel nội dung.
 *
 * Đọc được CẢ tiếng Việt lẫn tiếng Anh. Vùng đọc được DetailPanel đánh dấu bằng
 * `data-tts="vi"` / `data-tts="en"`, và bộ đọc luôn đọc **thứ đang hiện trên màn
 * hình**: chế độ VI đọc tiếng Việt, chế độ EN đọc tiếng Anh (lùi về tiếng Việt
 * nếu node chưa dịch), chế độ song ngữ thì người dùng chọn bằng nút VI/EN.
 *
 * Voice là của hệ điều hành, không phải của web: máy chưa cài giọng tiếng Việt
 * thì phải nói thẳng ra chứ không im lặng đọc bằng giọng tiếng Anh — giọng Anh
 * đọc tiếng Việt nghe không ra gì.
 *
 * Nút bấm nằm trong `.panel-head`; thanh điều khiển là dòng thứ hai của chính
 * cái head đó (flex-wrap), nên nó dính theo khi cuộn.
 */
export default function Reader({ panelRef, node, tab, lang, hasEnText, onAutoNext }) {
  const supported = useMemo(ttsSupported, [])
  const [pickedLang, setPickedLang] = useState(readTtsLang)

  /* Ngôn ngữ đọc = ngôn ngữ đang hiện. Chỉ chế độ song ngữ mới có hai lựa chọn. */
  const readLang = lang === 'vi' ? 'vi'
    : lang === 'en' ? (hasEnText ? 'en' : 'vi')
    : pickedLang

  const [voices, setVoices] = useState([])
  const [voiceUri, setVoiceUri] = useState(() => readVoiceUri(readLang))
  const [rate, setRate] = useState(readRate)
  const [auto, setAuto] = useState(readAuto)
  const [st, setSt] = useState({ phase: 'idle', index: 0, total: 0, el: null })

  const speakerRef = useRef(null)
  const markedRef = useRef(null)   // phần tử đang tô sáng
  const pendingRef = useRef(false) // vừa đổi node / đổi chế độ ngôn ngữ → đọc tiếp sau khi vẽ lại
  const autoRef = useRef(auto)
  const nextRef = useRef(onAutoNext)
  autoRef.current = auto
  nextRef.current = onAutoNext

  const voice = useMemo(() => pickVoice(voices, voiceUri, readLang), [voices, voiceUri, readLang])

  /* Đổi ngôn ngữ đọc = đổi cả danh sách voice lẫn voice đã nhớ của ngôn ngữ đó. */
  useEffect(() => {
    setVoiceUri(readVoiceUri(readLang))
    if (speakerRef.current) speakerRef.current.setLang(readLang)
  }, [readLang])

  /* ------------------------------- bộ đọc -------------------------------- */
  useEffect(() => {
    if (!supported) return undefined
    const sp = createSpeaker({
      onState: setSt,
      // Đọc hết node: sang node kế tiếp nếu người dùng bật đọc liên tục.
      onDone: () => {
        if (!autoRef.current || !nextRef.current) return
        pendingRef.current = true
        nextRef.current()
      },
    })
    speakerRef.current = sp
    return () => { sp.dispose(); speakerRef.current = null }
  }, [supported])

  useEffect(() => onVoices(setVoices, readLang), [readLang])
  useEffect(() => { if (speakerRef.current) speakerRef.current.setVoice(voice) }, [voice])
  useEffect(() => { if (speakerRef.current) speakerRef.current.setRate(rate) }, [rate])

  /** Gom khối trong các vùng đã đánh dấu đúng ngôn ngữ đang đọc rồi đọc từ đầu. */
  const startNow = useCallback(() => {
    const sp = speakerRef.current
    const box = panelRef.current
    if (!sp || !box) return
    sp.setLang(readLang)
    const roots = [...box.querySelectorAll('[data-tts="' + readLang + '"]')]
    sp.start(collectBlocks(roots, readLang))
  }, [panelRef, readLang])

  /* Đổi node, đổi tab hay đổi chế độ ngôn ngữ đều thay DOM dưới chân bộ đọc →
     dừng hẳn. Chỉ đọc tiếp khi chính mình vừa yêu cầu (pendingRef). */
  useEffect(() => {
    const sp = speakerRef.current
    if (!sp) return undefined
    sp.stop()
    if (!pendingRef.current) return undefined
    const id = setTimeout(() => { pendingRef.current = false; startNow() }, 90)
    return () => clearTimeout(id)
  }, [node.id, tab, lang, readLang, startNow])

  /* ------------------------------ tô sáng -------------------------------- */
  useEffect(() => {
    const prev = markedRef.current
    if (prev && prev !== st.el) prev.classList.remove('tts-on')

    const el = st.phase === 'idle' ? null : st.el
    markedRef.current = el
    if (!el) return
    el.classList.add('tts-on')

    const box = panelRef.current
    if (!box) return
    const r = el.getBoundingClientRect()
    const b = box.getBoundingClientRect()
    if (r.top < b.top + 48 || r.bottom > b.bottom - 48) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [st.el, st.phase, panelRef])

  // Đóng panel giữa chừng thì tiếng phải tắt theo, và lớp tô sáng phải gỡ.
  useEffect(() => () => {
    if (markedRef.current) markedRef.current.classList.remove('tts-on')
  }, [])

  /* ------------------------------ điều khiển ----------------------------- */
  // Luôn có chữ để đọc: tiếng Việt là bản gốc, còn tiếng Anh chỉ được chọn khi
  // node đã dịch (xem cách suy ra readLang ở trên).
  const play = () => startNow()

  const toggle = () => {
    const sp = speakerRef.current
    if (!sp) return
    if (st.phase === 'playing') sp.pause()
    else if (st.phase === 'paused') sp.resume()
    else play()
  }

  const changeRate = (v) => { setRate(v); writeRate(v) }
  const changeVoice = (uri) => { setVoiceUri(uri); writeVoiceUri(readLang, uri) }
  const changeAuto = () => setAuto((v) => { writeAuto(!v); return !v })
  const changeLang = (code) => { setPickedLang(code); writeTtsLang(code) }

  /* -------------------------------- giao diện ---------------------------- */
  const engaged = st.phase !== 'idle'
  const noVoice = supported && voices.length === 0
  const title = !supported ? t('ttsUnsupported', lang)
    : noVoice ? t(readLang === 'vi' ? 'ttsNoVoiceVi' : 'ttsNoVoiceEn', lang)
    : st.phase === 'playing' ? t('ttsPause', lang)
    : st.phase === 'paused' ? t('ttsResume', lang)
    : t(readLang === 'vi' ? 'ttsReadVi' : 'ttsReadEn', lang)

  const pct = st.total ? Math.round(((st.index + 1) / st.total) * 100) : 0

  return (
    <>
      <button
        className={'icon-btn tts-btn' + (engaged ? ' on' : '')}
        onClick={toggle}
        /* Không có giọng đúng ngôn ngữ thì tắt hẳn nút, đừng đọc bằng giọng
           ngôn ngữ khác — giọng Anh đọc tiếng Việt nghe không ra gì, và người
           dùng sẽ tưởng tính năng hỏng chứ không biết là thiếu gói giọng nói. */
        disabled={!supported || (noVoice && !engaged)}
        title={title}
        aria-label={title}
      >{st.phase === 'playing' ? '❚❚' : '🔊'}</button>

      {/* Chọn ngôn ngữ đọc — chỉ có nghĩa ở chế độ song ngữ, vì hai chế độ đơn ngữ
          đã tự quyết theo thứ đang hiện trên màn hình. Đặt NGOÀI thanh điều khiển
          vì thanh đó chỉ hiện khi đang đọc: máy thiếu giọng tiếng Việt thì nút đọc
          bị tắt, và người dùng sẽ không còn đường nào để đổi sang tiếng Anh. */}
      {supported && lang === 'both' && hasEnText && (
        <div className="tts-lang" role="group" aria-label={t('ttsLang', lang)}>
          <button className={readLang === 'vi' ? 'on' : ''}
                  onClick={() => changeLang('vi')} title={t('ttsLang', lang)}>VI</button>
          <button className={readLang === 'en' ? 'on' : ''}
                  onClick={() => changeLang('en')} title={t('ttsLang', lang)}>EN</button>
        </div>
      )}

      {engaged && (
        <div className="tts-bar" role="group" aria-label={t('ttsRead', lang)}>
          <div className="tts-keys">
            <button onClick={() => speakerRef.current.jump(-1)} title={t('ttsPrev', lang)}>⏮</button>
            <button className="tts-play" onClick={toggle}
                    title={st.phase === 'playing' ? t('ttsPause', lang) : t('ttsResume', lang)}>
              {st.phase === 'playing' ? '❚❚' : '▶'}
            </button>
            <button onClick={() => speakerRef.current.jump(1)} title={t('ttsNext', lang)}>⏭</button>
            <button onClick={() => speakerRef.current.stop()} title={t('ttsStop', lang)}>■</button>
          </div>

          <div className="tts-prog" title={`${st.index + 1} / ${st.total}`}>
            <i style={{ width: pct + '%' }} />
          </div>
          <span className="tts-count">{st.index + 1}/{st.total}</span>

          <select className="tts-sel" value={rate} title={t('ttsRate', lang)}
                  onChange={(e) => changeRate(Number(e.target.value))}>
            {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
          </select>

          {voices.length > 0 ? (
            <select className="tts-sel tts-voice" value={voice ? voice.voiceURI : ''}
                    title={t('ttsVoice', lang)}
                    onChange={(e) => changeVoice(e.target.value)}>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
              ))}
            </select>
          ) : (
            <span className="tts-warn">
              {t(readLang === 'vi' ? 'ttsNoVoiceVi' : 'ttsNoVoiceEn', lang)}
            </span>
          )}

          <button className={'tts-auto' + (auto ? ' on' : '')} onClick={changeAuto}
                  title={t('ttsAutoTitle', lang)}>↻ {t('ttsAuto', lang)}</button>
        </div>
      )}
    </>
  )
}
