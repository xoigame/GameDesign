/** Mức độ kiến thức — nhãn và ký hiệu dùng chung cho toàn app. */

export const LEVELS = ['basic', 'intermediate', 'advanced']

export const LEVEL_VI = {
  basic: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Chuyên sâu',
  none: 'Chưa phân loại',
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

export const levelLabel = (lv) => LEVEL_VI[lv] || LEVEL_VI.none
