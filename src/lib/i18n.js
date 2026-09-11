/**
 * Đa ngữ.
 *
 * Ba chế độ người dùng chọn được:
 *   'vi'   — chỉ tiếng Việt (mặc định, vì nội dung gốc viết bằng tiếng Việt)
 *   'en'   — chỉ tiếng Anh, lùi về tiếng Việt nếu node chưa dịch
 *   'both' — song ngữ, hai cột cạnh nhau (xếp chồng trên màn hẹp)
 *
 * Chữ giao diện chỉ có vi/en; chế độ 'both' dùng chữ giao diện tiếng Việt
 * để khỏi nhân đôi mọi nhãn — phần song ngữ chỉ áp cho NỘI DUNG.
 */

export const LANG_MODES = [
  { id: 'vi', label: 'VI', title: 'Chỉ tiếng Việt' },
  { id: 'en', label: 'EN', title: 'English only (falls back to Vietnamese if untranslated)' },
  { id: 'both', label: 'VI·EN', title: 'Song ngữ — hai cột cạnh nhau' },
]

/** Chữ giao diện dùng ngôn ngữ nào cho một chế độ. */
export const uiLang = (mode) => (mode === 'en' ? 'en' : 'vi')

const STRINGS = {
  vi: {
    searchPlaceholder: 'Tìm kiến thức…  ( / )',
    tabPath: 'Lộ trình',
    tabTree: 'Cây',
    tabBranch: 'Nhánh',
    results: 'kết quả',
    noResults: 'Không tìm thấy gì.',
    node: 'node',
    deep: 'deep',
    stub: 'stub',
    words: 'từ',
    exportPlaybook: '🤖 Xuất playbook prompt (.md)',
    exportPlaybookTitle: 'Chỉ phần hướng dẫn viết prompt của mọi node — nhỏ gọn, dán thẳng vào chat',
    exportAll: '⭳ Xuất toàn bộ kho (.md)',
    exportAllTitle: 'Toàn bộ kiến thức + prompt — dùng khi AI không đọc được ổ đĩa',
    modeMindmap: 'Mindmap',
    modeTree: 'Cây',
    modeRadial: 'Toả tròn',
    expandAll: '⤢ Mở hết',
    collapseAll: '⤡ Thu gọn',
    allRelations: '⇢ Mọi liên kết',
    tabDoc: 'Nội dung',
    tabPrompt: '🤖 Prompt cho AI',
    tabUnity: '🎮 Unity',
    copyForAi: 'Copy cho AI',
    copyBranch: 'Copy cả nhánh',
    copySection: 'Copy mục này',
    copied: '✓ Đã copy',
    copyErr: 'Không copy được — hãy dùng HTTPS/localhost',
    children: 'Node con',
    refs: 'Nguồn tham khảo',
    readingPath: 'Lộ trình đọc',
    related: 'Liên quan',
    promptHint: 'Cách diễn đạt yêu cầu cho chủ đề này để AI hiểu đúng ý — phải nêu rõ gì, mẫu prompt, và bẫy thường gặp.',
    unityHint: 'Hiện thực hoá bước này trong Unity — component nào, đặt ở đâu, code mẫu.',
    statusDeep: 'đã viết sâu',
    statusStub: 'stub',
    notTranslated: 'Node này chưa có bản tiếng Anh — đang hiện bản tiếng Việt.',
    fontSize: 'Cỡ chữ',
    closeEsc: 'Đóng (Esc)',
    openMenu: 'Danh mục · lộ trình đọc',
    loading: 'Đang nạp kho kiến thức…',
    langTitle: 'Ngôn ngữ nội dung',
  },
  en: {
    searchPlaceholder: 'Search…  ( / )',
    tabPath: 'Path',
    tabTree: 'Tree',
    tabBranch: 'Branches',
    results: 'results',
    noResults: 'Nothing found.',
    node: 'nodes',
    deep: 'deep',
    stub: 'stub',
    words: 'words',
    exportPlaybook: '🤖 Export prompt playbook (.md)',
    exportPlaybookTitle: 'Only the prompt-writing guidance from every node — compact, paste straight into a chat',
    exportAll: '⭳ Export whole vault (.md)',
    exportAllTitle: 'Everything — use when the AI cannot read your disk',
    modeMindmap: 'Mindmap',
    modeTree: 'Tree',
    modeRadial: 'Radial',
    expandAll: '⤢ Expand',
    collapseAll: '⤡ Collapse',
    allRelations: '⇢ All links',
    tabDoc: 'Content',
    tabPrompt: '🤖 Prompt for AI',
    tabUnity: '🎮 Unity',
    copyForAi: 'Copy for AI',
    copyBranch: 'Copy branch',
    copySection: 'Copy this section',
    copied: '✓ Copied',
    copyErr: 'Copy failed — use HTTPS or localhost',
    children: 'Child nodes',
    refs: 'Sources',
    readingPath: 'Reading path',
    related: 'Related',
    promptHint: 'How to phrase a request on this topic so the AI gets your intent — what to state, a prompt template, and the usual traps.',
    unityHint: 'How to build this in Unity — which components, where they go, sample code.',
    statusDeep: 'written',
    statusStub: 'stub',
    notTranslated: 'Not translated yet — showing the Vietnamese original.',
    fontSize: 'Text size',
    closeEsc: 'Close (Esc)',
    openMenu: 'Index · reading path',
    loading: 'Loading knowledge base…',
    langTitle: 'Content language',
  },
}

/** t('tabDoc', 'both') → chữ tiếng Việt. */
export const t = (key, mode) => STRINGS[uiLang(mode)][key] ?? STRINGS.vi[key] ?? key

/**
 * Lấy một trường của node theo ngôn ngữ, có fallback.
 * Trả về { text, translated } — `translated: false` nghĩa là đang hiện bản gốc.
 */
export function field(node, key, lang) {
  if (lang === 'vi' || !node) return { text: node ? node[key] : '', translated: true }
  const tr = node.i18n && node.i18n[lang]
  if (tr && tr[key]) return { text: tr[key], translated: true }
  return { text: node[key], translated: false }
}

/** Chỉ lấy chữ, bỏ qua cờ fallback. Dùng cho tiêu đề trên mindmap, sidebar… */
export const text = (node, key, lang) => field(node, key, lang).text

/** Node đã có bản dịch cho ngôn ngữ này chưa. */
export const hasTranslation = (node, lang) =>
  lang === 'vi' || Boolean(node && node.i18n && node.i18n[lang])
