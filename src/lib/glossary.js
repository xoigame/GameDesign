/**
 * Tra cứu thuật ngữ.
 * Khoá phải chuẩn hoá GIỐNG HỆT `glossKey()` trong scripts/build-graph.mjs,
 * nếu không web sẽ không khớp được với map do build sinh ra.
 */
export const glossKey = (s) =>
  String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Bảng thuật ngữ theo ngôn ngữ đang xem.
 * Chưa có bản dịch thì lùi về bảng tiếng Việt — thà đọc giải thích tiếng Việt
 * còn hơn không có gì.
 */
export const tableFor = (glossary, lang) =>
  (glossary && (glossary[lang === 'en' ? 'en' : 'vi'] || glossary.vi)) || null

/**
 * Tìm entry cho một đoạn inline code.
 * Ngoài khớp nguyên văn, thử bỏ hậu tố gọi hàm/thuộc tính (`Mathf.Abs()` →
 * `mathf`) để `AudioSettings.dspTime` vẫn khớp `dspTime`.
 */
export function lookup(glossary, lang, raw) {
  if (!glossary || !raw) return null
  const table = tableFor(glossary, lang)
  if (!table) return null

  const text = String(raw)
  if (text.length > 48 || text.includes('\n')) return null   // không phải thuật ngữ

  const direct = table[glossKey(text)]
  if (direct) return direct

  // `Thing.member` hoặc `member()` → thử phần cuối, rồi phần đầu
  const bare = text.replace(/\(\)$/, '')
  const parts = bare.split('.')
  if (parts.length > 1) {
    const last = table[glossKey(parts[parts.length - 1])]
    if (last) return last
  }
  return table[glossKey(bare)] || null
}
