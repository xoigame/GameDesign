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
    exportInterview: '🎤 Xuất bộ ôn phỏng vấn (.md)',
    exportInterviewTitle: 'Mục Phỏng vấn của mọi node, theo lộ trình đọc — để ôn offline trên điện thoại',
    exportAll: '⭳ Xuất toàn bộ kho (.md)',
    exportAllTitle: 'Toàn bộ kiến thức + prompt — dùng khi AI không đọc được ổ đĩa',
    viewMap: '🗺 Bản đồ',
    viewPractice: '🎤 Luyện phỏng vấn',
    modeMindmap: 'Mindmap',
    modeTree: 'Cây',
    modeRadial: 'Toả tròn',
    expandAll: '⤢ Mở hết',
    collapseAll: '⤡ Thu gọn',
    allRelations: '⇢ Mọi liên kết',
    tabDoc: 'Nội dung',
    tabPrompt: '🤖 Prompt cho AI',
    tabUnity: '🎮 Unity',
    tabCode: '💻 Code',
    tabInterview: '🎤 Phỏng vấn',
    copyForAi: 'Copy cho AI',
    copyBranch: 'Copy cả nhánh',
    copySection: 'Copy mục này',
    copied: '✓ Đã copy',
    copyErr: 'Không copy được — hãy dùng HTTPS/localhost',
    children: 'Node con',
    refs: 'Nguồn tham khảo',
    readingPath: 'Lộ trình đọc',
    related: 'Liên quan',
    promptHint: 'Dùng AI thế nào cho loại việc này — vai của nó, phải nêu rõ gì, mẫu prompt, và bẫy thường gặp.',
    unityHint: 'Hiện thực hoá bước này trong Unity — component nào, đặt ở đâu, code mẫu.',
    codeHint: 'Script demo chạy được cho node này, kèm sơ đồ thiết lập Inspector / Hierarchy. Copy vào dự án Unity 6 là chạy.',
    interviewHint: 'Câu hỏi thật hay gặp về chủ đề này, khung trả lời 60 giây, câu hỏi đào sâu tiếp theo, và cờ đỏ làm bạn bị loại.',
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
    exportInterview: '🎤 Export interview pack (.md)',
    exportInterviewTitle: 'The interview section of every node, in reading order — for offline revision',
    exportAll: '⭳ Export whole vault (.md)',
    exportAllTitle: 'Everything — use when the AI cannot read your disk',
    viewMap: '🗺 Map',
    viewPractice: '🎤 Interview drill',
    modeMindmap: 'Mindmap',
    modeTree: 'Tree',
    modeRadial: 'Radial',
    expandAll: '⤢ Expand',
    collapseAll: '⤡ Collapse',
    allRelations: '⇢ All links',
    tabDoc: 'Content',
    tabPrompt: '🤖 Prompt for AI',
    tabUnity: '🎮 Unity',
    tabCode: '💻 Code',
    tabInterview: '🎤 Interview',
    copyForAi: 'Copy for AI',
    copyBranch: 'Copy branch',
    copySection: 'Copy this section',
    copied: '✓ Copied',
    copyErr: 'Copy failed — use HTTPS or localhost',
    children: 'Child nodes',
    refs: 'Sources',
    readingPath: 'Reading path',
    related: 'Related',
    promptHint: 'How to use AI for this kind of task — its role, what to state, a prompt template, and the usual traps.',
    unityHint: 'How to build this in Unity — which components, where they go, sample code.',
    codeHint: 'A runnable demo script for this node, with an Inspector / Hierarchy setup diagram. Paste into a Unity 6 project and it runs.',
    interviewHint: 'Questions you will actually be asked on this topic, a 60-second answer skeleton, follow-up probes, and the red flags that get you rejected.',
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
