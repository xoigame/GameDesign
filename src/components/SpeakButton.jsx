import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '../lib/i18n.js'
import {
  collectBlocks, createSpeaker, onVoices, pickVoice, readRate, readVoiceUri, ttsSupported,
} from '../lib/tts.js'

/**
 * Nút đọc thành tiếng cho MỘT vùng bất kỳ — dùng cho thẻ luyện phỏng vấn.
 *
 * Khác `Reader` ở chỗ cố tình tối giản: một nút bật/tắt, không thanh điều khiển,
 * không đọc liên tục. Tốc độ và giọng lấy từ lựa chọn người dùng đã đặt ở panel
 * nội dung, nên hai chỗ nghe giống nhau mà không phải bày lại hai bộ cài đặt.
 *
 * Đọc đúng những gì ĐANG HIỆN trong vùng: trước khi lật đáp án thì chỉ có câu
 * hỏi, sau khi lật thì có cả lời giải. `watch` đổi giá trị là dừng và quên hết —
 * nếu không, thẻ đã chuyển mà tiếng vẫn đọc nốt thẻ cũ.
 */
export default function SpeakButton({ boxRef, watch, code = 'vi', lang, className = '' }) {
  const supported = useMemo(ttsSupported, [])
  const [voices, setVoices] = useState([])
  const [phase, setPhase] = useState('idle')
  const speakerRef = useRef(null)
  const markedRef = useRef(null)

  const voice = useMemo(() => pickVoice(voices, readVoiceUri(code), code), [voices, code])

  useEffect(() => {
    if (!supported) return undefined
    const sp = createSpeaker({ onState: (s) => { setPhase(s.phase); mark(s.phase === 'idle' ? null : s.el) } })
    sp.setLang(code)
    sp.setRate(readRate())
    speakerRef.current = sp
    return () => { sp.dispose(); speakerRef.current = null; mark(null) }
  }, [supported, code])

  useEffect(() => onVoices(setVoices, code), [code])
  useEffect(() => { if (speakerRef.current) speakerRef.current.setVoice(voice) }, [voice])

  /* Đổi thẻ hoặc lật đáp án là thay DOM dưới chân bộ đọc → dừng hẳn. */
  useEffect(() => { if (speakerRef.current) speakerRef.current.stop() }, [watch])

  function mark(el) {
    const prev = markedRef.current
    if (prev && prev !== el) prev.classList.remove('tts-on')
    markedRef.current = el
    if (el) el.classList.add('tts-on')
  }

  const toggle = useCallback(() => {
    const sp = speakerRef.current
    const box = boxRef.current
    if (!sp || !box) return
    if (phase === 'playing') { sp.pause(); return }
    if (phase === 'paused') { sp.resume(); return }
    const roots = [...box.querySelectorAll('[data-tts="' + code + '"]')]
    sp.start(collectBlocks(roots, code))
  }, [boxRef, code, phase])

  if (!supported) return null

  const noVoice = voices.length === 0
  const title = noVoice
    ? t(code === 'vi' ? 'ttsNoVoiceVi' : 'ttsNoVoiceEn', lang)
    : phase === 'playing' ? t('ttsPause', lang)
      : phase === 'paused' ? t('ttsResume', lang)
        : t(code === 'vi' ? 'ttsReadVi' : 'ttsReadEn', lang)

  return (
    <button
      type="button"
      className={'speak-btn' + (phase !== 'idle' ? ' on' : '') + (className ? ' ' + className : '')}
      onClick={toggle}
      disabled={noVoice}
      title={title}
      aria-label={title}
    >{phase === 'playing' ? '❚❚' : '🔊'}</button>
  )
}
