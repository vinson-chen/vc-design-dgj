/**
 * 与 `useTableGridEditing`、`TableGridTextCell` 行为对齐的快捷键说明（供宿主应用展示）。
 * 文案变更时请同步核对上述实现。
 */
export const V_TABLE_EDIT_KEYBOARD_HINT_LINES: readonly string[] = [
  '单击：锁定单元格；再次单击进入编辑。',
  '方向键 ↑↓←→：在锁定单元格之间移动（光标在单元格输入框内时不拦截）。',
  'Delete / Backspace：清空当前锁定单元格（焦点不在页面上其它输入框、文本域时）。',
  'Esc：结束编辑并保存。',
  '⌘ Enter / Ctrl+Enter：结束编辑并保存。',
  'Enter（编辑中）：保存本格并跳到下一行同列。',
  '字符键：锁定态下进入编辑并输入；已在编辑时写入当前格。',
  '⌘ C / Ctrl+C：复制当前单元格全文（光标在单元格输入框内时沿用浏览器选区复制）。',
  '⌘ V / Ctrl+V：将剪贴板文本粘贴到当前锁定/选中单元格。',
  '⌘ Z / Ctrl+Z：撤销上一步表格操作（单元格文案、插入/删除行列等；在单元格输入框内聚焦时由浏览器处理字级撤销）。',
  'Shift+⌘ Z / Shift+Ctrl+Z：重做。',
];

/** @deprecated Use V_TABLE_EDIT_KEYBOARD_HINT_LINES instead */
export const BIZ_TABLE_EDIT_KEYBOARD_HINT_LINES = V_TABLE_EDIT_KEYBOARD_HINT_LINES;
