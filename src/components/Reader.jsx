import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '../lib/i18n.js'
import {
  RATES, collectBlocks, createSpeaker, onVoices, pickVoice, ttsSupported,
  readAuto, readRate, readVoiceUri, writeAuto, writeRate, writeVoiceUri,
} from '../lib/tts.js'

/**
 * Thanh đọc thành tiếng cho panel nội dung.
 *
 * Chỉ đọc phần tiếng Anh — voice tiếng Anh đọc tiếng Việt nghe không ra gì.
 * Vùng đọc được DetailPanel đánh dấu bằng `data-tts="en"`; ở chế độ song ngữ
 * đó là cột EN, ở chế độ EN là cả khung nội dung. Đang ở chế độ VI thì bấm đọc
 * sẽ bật sang song ngữ trước — để vừa nghe vừa nhìn thấy đoạn đang được đọc.
 *
 * Nút bấm nằm trong `.panel-head`; thanh điều khiển là dòng thứ hai của chính
 * cái head đó (flex-wrap), nên nó dính theo khi cuộn.
 */
export default function Reader({ panelRef, node, tab, lang, setLang, hasEnText, onAutoNext }) {
  const supported = useMemo(ttsSupported, [])
  const [voices, setVoices] = useState([])
  const [voiceUri, setVoiceUri] = useState(readVoiceUri)
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

  const voice = useMemo(() => pickVoice(voices, voiceUri), [voices, voiceUri])

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

  useEffect(() => onVoices(setVoices), [])
  useEffect(() => { if (speakerRef.current) speakerRef.current.setVoice(voice) }, [voice])
  useEffect(() => { if (speakerRef.current) speakerRef.current.setRate(rate) }, [rate])

  /** Gom khối trong các vùng đã đánh dấu EN rồi đọc từ đầu. */
  const startNow = useCallback(() => {
    const sp = speakerRef.current
    const box = panelRef.current
    if (!sp || !box) return
    const roots = [...box.querySelectorAll('[data-tts="en"]')]
    sp.start(collectBlocks(roots))
  }, [panelRef])

  /* Đổi node, đổi tab hay đổi chế độ ngôn ngữ đều thay DOM dưới chân bộ đọc →
     dừng hẳn. Chỉ đọc tiếp khi chính mình vừa yêu cầu (pendingRef). */
  useEffect(() => {
    const sp = speakerRef.current
    if (!sp) return undefined
    sp.stop()
    if (!pendingRef.current) return undefined
    const id = setTimeout(() => { pendingRef.current = false; startNow() }, 90)
    return () => clearTimeout(id)
  }, [node.id, tab, lang, startNow])

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
  const play = () => {
    if (!hasEnText) return
    // Chế độ VI không vẽ chữ tiếng Anh ra màn hình → bật song ngữ rồi mới đọc.
    if (lang === 'vi') { pendingRef.current = true; setLang('both'); return }
    startNow()
  }

  const toggle = () => {
    const sp = speakerRef.current
    if (!sp) return
    if (st.phase === 'playing') sp.pause()
    else if (st.phase === 'paused') sp.resume()
    else play()
  }

  const changeRate = (v) => { setRate(v); writeRate(v) }
  const changeVoice = (uri) => { setVoiceUri(uri); writeVoiceUri(uri) }
  const changeAuto = () => setAuto((v) => { writeAuto(!v); return !v })

  /* -------------------------------- giao diện ---------------------------- */
  const engaged = st.phase !== 'idle'
  const title = !supported ? t('ttsUnsupported', lang)
    : !hasEnText ? t('ttsNoEn', lang)
    : st.phase === 'playing' ? t('ttsPause', lang)
    : st.phase === 'paused' ? t('ttsResume', lang)
    : lang === 'vi' ? t('ttsSwitch', lang)
    : t('ttsRead', lang)

  const pct = st.total ? Math.round(((st.index + 1) / st.total) * 100) : 0

  return (
    <>
      <button
        className={'icon-btn tts-btn' + (engaged ? ' on' : '')}
        onClick={toggle}
        disabled={!supported || (!hasEnText && !engaged)}
        title={title}
        aria-label={title}
      >{st.phase === 'playing' ? '❚❚' : '🔊'}</button>

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
            <span className="tts-warn">{t('ttsNoVoice', lang)}</span>
          )}

          <button className={'tts-auto' + (auto ? ' on' : '')} onClick={changeAuto}
                  title={t('ttsAutoTitle', lang)}>↻ {t('ttsAuto', lang)}</button>
        </div>
      )}
    </>
  )
}
