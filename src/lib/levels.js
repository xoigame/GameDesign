/** Mức độ kiến thức — nhãn và ký hiệu dùng chung cho toàn app. */

export const LEVELS = ['basic', 'intermediate', 'advanced']

export const LEVEL_VI = {
  basic: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Chuyên sâu',
  none: 'Chưa phân loại',
}

export const LEVEL_EN = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  none: 'Unclassified',
}

export const LEVEL_GLYPH = {
  basic: '●',
  intermediate: '◐',
  advanced: '○',
}

export const LEVEL_HINT = {
  basic: 'Ai cũng nên đọc — không cần kiến thức nền',
  intermediate: 'Cần đã nắm phần cơ bản',
  advanced: 'Chuyên sâu — chỉ đọc khi dự án thật sự cần',
}

export const LEVEL_HINT_EN = {
  basic: 'Everyone should read this — no prerequisites',
  intermediate: 'Assumes you know the basics',
  advanced: 'Deep dive — read it when the project actually needs it',
}

/**
 * Nhãn mức độ theo ngôn ngữ giao diện.
 * `lang` nhận cả ba chế độ ('vi' | 'en' | 'both'); 'both' dùng chữ tiếng Việt,
 * đúng quy ước chung của giao diện — xem uiLang() trong lib/i18n.js.
 */
export const levelLabel = (lv, lang) =>
  (lang === 'en' ? LEVEL_EN : LEVEL_VI)[lv] || (lang === 'en' ? LEVEL_EN : LEVEL_VI).none

export const levelHint = (lv, lang) => (lang === 'en' ? LEVEL_HINT_EN : LEVEL_HINT)[lv] || ''
