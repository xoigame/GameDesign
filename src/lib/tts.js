/**
 * Đọc nội dung thành tiếng — Web Speech API, chỉ dùng voice tiếng Anh.
 *
 * VÌ SAO ĐỌC TỪ DOM chứ không từ markdown nguồn:
 *   - khỏi phải viết thêm bộ bóc markdown (code fence, SVG, bảng, wiki-link…)
 *   - đọc tới đâu tô sáng tới đó được, vì mỗi mẩu giữ luôn phần tử sinh ra nó
 *   - cái gì không hiện trên màn hình thì cũng không bị đọc — đúng cái người dùng thấy
 *
 * BỐN CÁI BẪY của Web Speech API mà file này phải đỡ:
 *   1. Chrome cắt ngang câu dài quá ~15 giây → cắt nhỏ mẩu (MAX_CHARS) và
 *      watchdog pause/resume mỗi 6 giây.
 *   2. cancel() rồi speak() ngay thì câu mới rơi mất → hoãn một nhịp sau cancel.
 *   3. getVoices() lần đầu trả mảng rỗng → phải nghe sự kiện 'voiceschanged',
 *      và hỏi lại vài nhịp vì có trình duyệt nạp xong mà không bắn sự kiện.
 *   4. onend cũng bắn khi bị cancel → mỗi lượt đọc mang một số thế hệ (gen),
 *      callback của thế hệ cũ bị bỏ qua.
 */

export const ttsSupported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance === 'function'

/** Các mức tốc độ đọc. 1 = tốc độ tự nhiên của voice. */
export const RATES = [0.7, 0.85, 1, 1.15, 1.3, 1.5]

/* --------------------------------- voice --------------------------------- */

/** Hai ngôn ngữ đọc được. Nội dung gốc của kho là tiếng Việt, nên `vi` là mặc định. */
export const TTS_LANGS = ['vi', 'en']

/**
 * Voice của một ngôn ngữ. Lọc theo tiền tố BCP-47 (`vi`, `vi-VN`, `en`, `en-GB`…).
 *
 * Máy không cài voice nào cho ngôn ngữ đó thì trả mảng rỗng — phần giao diện
 * phải nói thẳng điều đó ra, vì đây là thứ phụ thuộc hệ điều hành chứ không phải
 * thứ web cài được. Android/iOS gần như luôn có tiếng Việt; Windows thì phải
 * thêm gói giọng nói trong Cài đặt.
 */
export const voicesFor = (code) => {
  if (!ttsSupported()) return []
  const re = new RegExp('^' + code + '([-_]|$)', 'i')
  return window.speechSynthesis.getVoices().filter((v) => re.test(v.lang))
}

/**
 * Theo dõi danh sách voice của MỘT ngôn ngữ. Trả về hàm huỷ đăng ký.
 * Gọi lại cb mỗi lần danh sách đổi (và vài nhịp đầu, xem bẫy #3).
 */
export function onVoices(cb, code = 'vi') {
  if (!ttsSupported()) return () => {}
  const synth = window.speechSynthesis
  const emit = () => cb(voicesFor(code))
  emit()
  synth.addEventListener('voiceschanged', emit)
  const timers = [200, 700, 1800].map((ms) => setTimeout(emit, ms))
  return () => {
    synth.removeEventListener('voiceschanged', emit)
    timers.forEach(clearTimeout)
  }
}

/* Voice nghe dễ chịu hơn hẳn voice mặc định của hệ điều hành — ưu tiên theo thứ tự này. */
const NICE = {
  en: [/natural/i, /google.*us english/i, /samantha/i, /\b(aria|jenny|guy|ava)\b/i],
  vi: [/natural/i, /google.*ti|google.*vietnam/i, /\b(hoaimy|nam ?minh|linh|an)\b/i],
}
const PREFERRED = { en: /^en[-_]US$/i, vi: /^vi[-_]VN$/i }

/** Chọn voice: bản người dùng đã chọn → voice "nghe được" → giọng chuẩn vùng → cái đầu. */
export function pickVoice(voices, savedUri, code = 'vi') {
  if (!voices.length) return null
  if (savedUri) {
    const saved = voices.find((v) => v.voiceURI === savedUri)
    if (saved) return saved
  }
  for (const re of NICE[code] || []) {
    const hit = voices.find((v) => re.test(v.name))
    if (hit) return hit
  }
  const pref = PREFERRED[code]
  return (pref && voices.find((v) => pref.test(v.lang))) || voices[0]
}

/* ------------------------------ bóc nội dung ----------------------------- */

/* Khối đọc được. `tr` thay cho td/th: đọc cả dòng bảng một lượt nghe mới xuôi. */
const BLOCK_SEL = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,tr,figcaption,dt,dd'
/* Không đọc: code block, hình SVG, và phần bên trong <details> đang đóng —
   nguyên tắc chung là chỉ đọc thứ người dùng đang nhìn thấy. */
const SKIP_SEL = 'pre,svg,.tts-skip,details:not([open])'
/* ~11 giây ở tốc độ 1x, dưới ngưỡng Chrome cắt ngang (xem bẫy #1). */
const MAX_CHARS = 170

/* Mũi tên đọc thành gì. Tiếng Anh có từ nối nghe xuôi; tiếng Việt thì một quãng
   nghỉ tự nhiên hơn — "→" trong kho là dấu dẫn sang lời giải, không phải giới từ. */
const ARROW = {
  en: { to: ' to ', from: ' from ' },
  vi: { to: ', ', from: ', ' },
}

/**
 * Dọn chữ cho dễ nghe: mũi tên và gạch nối thành từ, bỏ emoji, gộp khoảng trắng.
 * Thứ tự quan trọng — mũi tên nằm trong dải emoji bị xoá ở bước sau.
 */
const tidy = (s, code = 'vi') =>
  String(s || '')
    .replace(/[→⇒▸►]|->/g, (ARROW[code] || ARROW.vi).to)
    .replace(/[←⇐]/g, (ARROW[code] || ARROW.vi).from)
    .replace(/[·•]|\s\|\s/g, ', ')
    .replace(/[—–]/g, ', ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{27BF}\u{FE00}-\u{FE0F}\u{2B00}-\u{2BFF}]/gu, ' ')
    .replace(/\s+/g, ' ')
    // gạch ngang vừa thành dấu phẩy để lại " , " — vài engine đọc thành quãng nghỉ đúp
    .replace(/\s+([,.])/g, '$1')
    .trim()

/** Chữ của riêng khối này — bỏ phần thuộc khối con, để danh sách lồng nhau không bị đọc hai lần. */
const ownText = (el) => {
  // Dòng bảng: textContent nối các ô không có dấu ngăn ("Stardew ValleyWater crops…"),
  // nghe ra thành một từ lạ. Tự chèn dấu phẩy giữa các ô.
  if (el.tagName === 'TR') {
    return [...el.children].map((c) => c.textContent.trim()).filter(Boolean).join(', ')
  }
  if (!el.querySelector(BLOCK_SEL)) return el.textContent
  let out = ''
  for (const kid of el.childNodes) {
    if (kid.nodeType === 3) { out += kid.textContent; continue }
    if (kid.nodeType !== 1) continue
    if (kid.matches(BLOCK_SEL) || kid.querySelector(BLOCK_SEL)) continue
    out += kid.textContent
  }
  return out
}

/** Cắt một khối dài thành nhiều mẩu ngắn, ưu tiên cắt ở cuối câu. */
function pieces(text) {
  if (text.length <= MAX_CHARS) return [text]
  const out = []
  let buf = ''
  const flush = () => { if (buf) { out.push(buf); buf = '' } }

  for (const sentence of text.match(/[^.!?;:]+(?:[.!?;:]+|$)/g) || [text]) {
    let s = sentence.trim()
    if (!s) continue
    if (s.length > MAX_CHARS) {
      flush()
      while (s.length > MAX_CHARS) {
        const space = s.lastIndexOf(' ', MAX_CHARS)
        const at = space > 40 ? space : MAX_CHARS
        out.push(s.slice(0, at).trim())
        s = s.slice(at).trim()
      }
      if (!s) continue
    }
    if (!buf) buf = s
    else if (buf.length + 1 + s.length <= MAX_CHARS) buf += ' ' + s
    else { flush(); buf = s }
  }
  flush()
  return out
}

/**
 * Gom các mẩu đọc được từ những vùng đã đánh dấu.
 * Trả về [{ el, text }] — nhiều mẩu có thể trỏ chung một `el` (khối dài bị cắt nhỏ).
 */
export function collectBlocks(roots, code = 'vi') {
  const out = []
  for (const root of roots) {
    if (!root) continue
    const els = root.matches(BLOCK_SEL) ? [root] : [...root.querySelectorAll(BLOCK_SEL)]
    for (const el of els) {
      if (el.closest(SKIP_SEL)) continue
      const text = tidy(ownText(el), code)
      // Không có chữ cái/chữ số thì chẳng có gì để đọc (dòng kẻ bảng, ô trống…)
      if (!/[a-z0-9]/i.test(text)) continue
      for (const piece of pieces(text)) out.push({ el, text: piece })
    }
  }
  return out
}

/* -------------------------------- đọc thật ------------------------------- */

/* pause/resume liên tục là mẹo riêng cho Chromium; Firefox/Safari bị nấc nếu làm vậy. */
const isChromium = () =>
  typeof navigator !== 'undefined' &&
  /Chrom(e|ium)|Edg\//.test(navigator.userAgent) &&
  !/Firefox/.test(navigator.userAgent)

/**
 * Bộ đọc. Tự giữ trạng thái, báo ra ngoài qua onState / onDone.
 *
 *   const sp = createSpeaker({ onState, onDone })
 *   sp.start(collectBlocks(roots))
 */
export function createSpeaker({ onState = () => {}, onDone = () => {} } = {}) {
  const synth = window.speechSynthesis
  let list = []
  let index = 0
  let phase = 'idle'          // idle | playing | paused
  let gen = 0                 // số thế hệ, xem bẫy #4
  let voice = null
  let rate = 1
  let guard = null
  // Dùng khi máy chưa có voice nào cho ngôn ngữ đang đọc: ít nhất cũng báo cho
  // engine biết đây là tiếng gì, vài trình duyệt sẽ tự tìm giọng gần đúng.
  let fallbackLang = 'vi-VN'

  const emit = () =>
    onState({ phase, index, total: list.length, el: list[index] ? list[index].el : null })

  const startGuard = () => {
    if (!isChromium() || guard) return
    guard = setInterval(() => {
      if (phase !== 'playing') return
      if (synth.speaking && !synth.paused) { synth.pause(); synth.resume() }
    }, 6000)
  }
  const stopGuard = () => { if (guard) { clearInterval(guard); guard = null } }

  function finish() {
    phase = 'idle'
    stopGuard()
    emit()
    onDone()
  }

  function say(i, my) {
    if (my !== gen) return
    if (i >= list.length) { finish(); return }
    index = i
    emit()

    const u = new SpeechSynthesisUtterance(list[i].text)
    if (voice) u.voice = voice
    u.lang = (voice && voice.lang) || fallbackLang
    u.rate = rate
    u.onend = () => { if (my === gen && phase === 'playing') say(i + 1, my) }
    u.onerror = (e) => {
      if (my !== gen || phase !== 'playing') return
      // bị huỷ là chuyện bình thường; lỗi khác thì bỏ mẩu đó, đừng đứng im
      if (e.error === 'interrupted' || e.error === 'canceled') return
      say(i + 1, my)
    }
    synth.speak(u)
    startGuard()
  }

  /** Huỷ cái đang đọc rồi đọc lại từ mẩu i (xem bẫy #2). */
  function speakFrom(i) {
    const my = ++gen
    synth.cancel()
    phase = 'playing'
    index = Math.max(0, Math.min(i, Math.max(0, list.length - 1)))
    emit()
    setTimeout(() => say(index, my), 60)
  }

  return {
    start(chunks, from = 0) {
      list = chunks || []
      if (!list.length) { gen++; synth.cancel(); phase = 'idle'; index = 0; emit(); return }
      speakFrom(from)
    },
    pause() {
      if (phase !== 'playing') return
      synth.pause()
      phase = 'paused'
      emit()
    },
    resume() {
      if (phase !== 'paused') return
      synth.resume()
      phase = 'playing'
      emit()
      // Có bản Chrome resume() xong vẫn im — không còn gì đang đọc thì đọc lại mẩu hiện tại.
      setTimeout(() => { if (phase === 'playing' && !synth.speaking) speakFrom(index) }, 250)
    },
    stop() {
      gen++
      synth.cancel()
      phase = 'idle'
      index = 0
      stopGuard()
      emit()
    },
    jump(delta) {
      if (!list.length) return
      speakFrom(index + delta)
    },
    setRate(r) {
      rate = r
      if (phase !== 'idle') speakFrom(index)   // rate chỉ đổi được ở câu mới
    },
    setVoice(v) {
      voice = v
      if (phase !== 'idle') speakFrom(index)
    },
    setLang(code) {
      fallbackLang = code === 'en' ? 'en-US' : 'vi-VN'
    },
    dispose() {
      gen++
      stopGuard()
      synth.cancel()
    },
  }
}

/* ------------------------------ ghi nhớ lựa chọn ------------------------- */

const get = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const set = (k, v) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } }

export const readRate = () => {
  const v = Number(get('gdb:ttsRate'))
  return RATES.includes(v) ? v : 1
}
export const writeRate = (v) => set('gdb:ttsRate', String(v))

/* Nhớ voice riêng cho từng ngôn ngữ — người dùng gần như luôn muốn giọng khác nhau. */
export const readVoiceUri = (code) => get('gdb:ttsVoice:' + code) || ''
export const writeVoiceUri = (code, v) => set('gdb:ttsVoice:' + code, v || '')

/** Ngôn ngữ đang chọn để đọc. Mặc định tiếng Việt vì nội dung gốc viết bằng tiếng Việt. */
export const readTtsLang = () => (get('gdb:ttsLang') === 'en' ? 'en' : 'vi')
export const writeTtsLang = (v) => set('gdb:ttsLang', v === 'en' ? 'en' : 'vi')

export const readAuto = () => get('gdb:ttsAuto') === '1'
export const writeAuto = (v) => set('gdb:ttsAuto', v ? '1' : '0')
