import type { TextAreaRef } from 'antd/es/input/TextArea';
import React, { forwardRef, useCallback, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button, Dropdown, Input, VcIcon, vcTokens } from 'vc-design';
import './VInput.css';

export const V_INPUT_LLM_DROPDOWN_CLASS = 'vc-biz-vcell-input-llm-dropdown';
/** @deprecated Use V_INPUT_LLM_DROPDOWN_CLASS instead */
export const VCELL_INPUT_LLM_DROPDOWN_CLASS = V_INPUT_LLM_DROPDOWN_CLASS;

export type VInputLlmOption = {
  value: string;
  label: string;
  disabled?: boolean;
};
/** @deprecated Use VInputLlmOption instead */
export type VcellInputLlmOption = VInputLlmOption;

export type VInputAttachedFile = Readonly<{
  id: string;
  file: File;
}>;
/** @deprecated Use VInputAttachedFile instead */
export type VcellInputAttachedFile = VInputAttachedFile;

/** 指令标签 */
export type VInputCommandTag = Readonly<{
  id: string;
  label: string;
  /** 标签来源类型 */
  type: 'slash' | 'hashtag';
}>;
/** @deprecated Use VInputCommandTag instead */
export type VcellInputCommandTag = VInputCommandTag;

function excelExtLabel(file: File): '.xlsx' | '.xls' | null {
  const n = file.name.toLowerCase();
  if (n.endsWith('.xlsx')) return '.xlsx';
  if (n.endsWith('.xls')) return '.xls';
  return null;
}

function excelBaseName(file: File): string {
  const n = file.name;
  const lower = n.toLowerCase();
  if (lower.endsWith('.xlsx')) return n.slice(0, -5);
  if (lower.endsWith('.xls')) return n.slice(0, -4);
  return n;
}

export type VInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** 取消发送回调（sending 时点击撤回按钮触发） */
  onCancel?: () => void;
  /** 当前是否正在发送（影响发送按钮图标） */
  sending?: boolean;
  placeholder?: string;
  /** 禁用输入与发送（如请求中） */
  disabled?: boolean;
  llmOptions: VInputLlmOption[];
  llmValue: string;
  onLlmChange: (value: string) => void;
  /** 受控：已选 Excel 附件列表（须与 onAttachedFilesChange 同时使用） */
  attachedFiles?: VInputAttachedFile[];
  onAttachedFilesChange?: (files: VInputAttachedFile[]) => void;
  /** 受控：指令标签列表（须与 onCommandTagsChange 同时使用） */
  commandTags?: VInputCommandTag[];
  onCommandTagsChange?: (tags: VInputCommandTag[]) => void;
  /** slash 按钮点击回调（打开 L0 预设面板） */
  onSlashClick?: () => void;
  /** hashtag 按钮点击回调（打开选择范围面板） */
  onHashtagClick?: () => void;
  /** 选择面板是否打开（打开时锁定悬停态样式） */
  paletteOpen?: boolean;
  /** 透传 Dropdown，默认使用包内样式类 */
  llmDropdownOverlayClassName?: string;
  className?: string;
  style?: React.CSSProperties;
};
/** @deprecated Use VInputProps instead */
export type VcellInputProps = VInputProps;

const VInput = forwardRef<TextAreaRef, VInputProps>(function VInput(
  {
    value,
    onChange,
    onSend,
    onCancel,
    sending = false,
    placeholder = '',
    disabled = false,
    llmOptions,
    llmValue,
    onLlmChange,
    attachedFiles: attachedFilesProp,
    onAttachedFilesChange,
    commandTags: commandTagsProp,
    onCommandTagsChange,
    onSlashClick,
    onHashtagClick,
    paletteOpen = false,
    llmDropdownOverlayClassName = V_INPUT_LLM_DROPDOWN_CLASS,
    className,
    style,
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [llmOpen, setLlmOpen] = useState(false);
  const [internalAttached, setInternalAttached] = useState<VInputAttachedFile[]>([]);
  const [internalCommandTags, setInternalCommandTags] = useState<VInputCommandTag[]>([]);
  const innerRef = useRef<TextAreaRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputId = useId();

  useImperativeHandle(ref, () => innerRef.current as TextAreaRef, []);

  const controlledAttach = onAttachedFilesChange != null;
  const attachedFiles = controlledAttach ? (attachedFilesProp ?? []) : internalAttached;
  const setAttachedFiles = controlledAttach ? onAttachedFilesChange : setInternalAttached;

  const controlledCommandTags = onCommandTagsChange != null;
  const commandTags = controlledCommandTags ? (commandTagsProp ?? []) : internalCommandTags;
  const setCommandTags = controlledCommandTags ? onCommandTagsChange : setInternalCommandTags;

  // 面板打开时锁定悬停态，或实际悬停/聚焦时显示悬停态
  const elevated = paletteOpen || focused || hovered;

  const llmLabel = useMemo(
    () => llmOptions.find((o) => o.value === llmValue)?.label ?? llmValue,
    [llmOptions, llmValue]
  );

  const menuItems = useMemo(
    () =>
      llmOptions.map((o) => ({
        key: o.value,
        label: o.label,
        disabled: o.disabled === true,
      })),
    [llmOptions]
  );

  const runSend = useCallback(() => {
    if (disabled) return;
    // 需要有内容（文本、指令标签或附件）才可发送
    if (!value.trim() && commandTags.length === 0 && attachedFiles.length === 0) return;
    innerRef.current?.blur();
    setFocused(false);
    onSend();
    if (!controlledAttach) {
      setInternalAttached([]);
    }
  }, [attachedFiles.length, commandTags.length, controlledAttach, disabled, onSend, value]);

  const onExcelInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      // FileList 在清空 value 后会失效，必须先拷贝成数组
      const picked = input.files?.length ? Array.from(input.files) : [];
      input.value = '';
      if (picked.length === 0) return;
      const next: VInputAttachedFile[] = [...attachedFiles];
      for (let i = 0; i < picked.length; i += 1) {
        const file = picked[i]!;
        if (!excelExtLabel(file)) continue;
        const id =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${file.name}-${file.size}-${file.lastModified}-${i}`;
        next.push({ id, file });
      }
      setAttachedFiles(next);
    },
    [attachedFiles, setAttachedFiles]
  );

  const removeAttached = useCallback(
    (id: string) => {
      setAttachedFiles(attachedFiles.filter((a) => a.id !== id));
    },
    [attachedFiles, setAttachedFiles]
  );

  const removeCommandTag = useCallback(
    (id: string) => {
      setCommandTags(commandTags.filter((t) => t.id !== id));
    },
    [commandTags, setCommandTags]
  );

  const hasTags = attachedFiles.length > 0 || commandTags.length > 0;

  return (
    <div className={className} style={style}>
      <input
        id={excelInputId}
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        multiple
        style={{ display: 'none' }}
        onChange={onExcelInputChange}
      />
      <div
        className="vc-biz-vcell-input-shell"
        data-keep-table-selection
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={
          {
            boxSizing: 'border-box',
            background: vcTokens.color.neutral.background.container,
            border: `1px solid ${vcTokens.color.neutral.border.default}`,
            borderRadius: 8,
            boxShadow: elevated ? vcTokens.style.boxShadowSecondary : 'none',
            transition: 'box-shadow 0.2s ease',
            padding: 12,
            ['--vc-biz-vcell-tag-bg' as string]: vcTokens.color.primary.bg,
            ['--vc-biz-vcell-tag-bg-hover' as string]: vcTokens.color.primary.bgHover,
            ['--vc-biz-vcell-tag-text' as string]: vcTokens.color.primary.text,
            ['--vc-biz-vcell-input-btn-color' as string]: vcTokens.color.neutral.text.label,
          } as React.CSSProperties
        }
      >
        {/* Tag 区：指令标签和文件附件 */}
        {hasTags && (
          <div className="vc-biz-vcell-input-tag-row">
            {/* 指令标签 */}
            {commandTags.map((tag) => (
              <span key={tag.id} className="vc-biz-vcell-input-command-tag">
                <button
                  type="button"
                  className="vc-biz-vcell-input-command-tag__icon-btn"
                  aria-label={`移除 ${tag.label}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCommandTag(tag.id);
                  }}
                >
                  <VcIcon
                    type={tag.type === 'slash' ? 'slash' : 'hashtag'}
                    fontSize={14}
                    className="vc-biz-vcell-input-command-tag__icon-default"
                  />
                  <VcIcon
                    type="close"
                    fontSize={14}
                    className="vc-biz-vcell-input-command-tag__icon-close"
                  />
                </button>
                <span className="vc-biz-vcell-input-tag__name">{tag.label}</span>
              </span>
            ))}
            {/* 文件附件标签 */}
            {attachedFiles.map((a) => {
              const ext = excelExtLabel(a.file);
              if (!ext) return null;
              const label = `${excelBaseName(a.file)}${ext}`;
              return (
                <span key={a.id} className="vc-biz-vcell-input-file-tag">
                  <button
                    type="button"
                    className="vc-biz-vcell-input-file-tag__icon-btn"
                    aria-label={`移除 ${label}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttached(a.id);
                    }}
                  >
                    <VcIcon
                      type="file-1"
                      fontSize={14}
                      className="vc-biz-vcell-input-file-tag__icon-file"
                    />
                    <VcIcon
                      type="close"
                      fontSize={14}
                      className="vc-biz-vcell-input-file-tag__icon-close"
                    />
                  </button>
                  <span className="vc-biz-vcell-input-file-tag__name">{label}</span>
                </span>
              );
            })}
          </div>
        )}
        {/* Input 区 */}
        <div
          onMouseDown={(e) => {
            const t = e.target as HTMLElement;
            if (t.closest('.vc-biz-vcell-input-command-tag__icon-btn') || t.closest('.vc-biz-vcell-input-file-tag__icon-btn')) return;
            innerRef.current?.focus();
          }}
        >
          <Input.TextArea
            ref={innerRef}
            className="vc-biz-vcell-input-textarea"
            variant="borderless"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoSize={{ minRows: 1, maxRows: 6 }}
            style={{ fontSize: vcTokens.style.font.size.base, lineHeight: '24px' }}
            disabled={disabled}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                runSend();
              }
            }}
          />
        </div>
        {/* Button 区 */}
        <div className="vc-biz-vcell-input-button-row">
          <Button
            type="text"
            size="small"
            icon={<VcIcon type="hashtag" fontSize={16} />}
            aria-label="标签"
            disabled={disabled}
            onClick={onHashtagClick}
            className="vc-biz-vcell-input-btn-hashtag"
          />
          <Button
            type="text"
            size="small"
            icon={<VcIcon type="slash" fontSize={16} />}
            aria-label="预设指令"
            disabled={disabled}
            onClick={onSlashClick}
            className="vc-biz-vcell-input-btn-slash"
          />
          <Button
            type="text"
            size="small"
            icon={<VcIcon type="add" fontSize={16} />}
            aria-label="添加 Excel"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="vc-biz-vcell-input-btn-add"
          />
          <Dropdown
            trigger={['click']}
            overlayClassName={llmDropdownOverlayClassName}
            menu={{
              items: menuItems,
              selectable: true,
              selectedKeys: [llmValue],
              onClick: ({ key }) => {
                const opt = llmOptions.find((o) => o.value === String(key));
                if (opt?.disabled) return;
                onLlmChange(String(key));
                setLlmOpen(false);
              },
            }}
            onOpenChange={setLlmOpen}
          >
            <Button
              type="text"
              size="small"
              className="vc-biz-vcell-input-btn-llm"
            >
              {llmLabel}
              <VcIcon
                type={llmOpen ? 'chevron-up' : 'chevron-down'}
                fontSize={14}
                style={{ marginLeft: 4 }}
              />
            </Button>
          </Dropdown>
          {/* 发送/撤回按钮：sending + onCancel 时显示 rollback 图标 */}
          {sending && onCancel ? (
            <Button
              type="primary"
              size="small"
              danger
              icon={<VcIcon type="rollback" fontSize={16} />}
              aria-label="撤回"
              onClick={onCancel}
              className="vc-biz-vcell-input-btn-cancel"
            />
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<VcIcon type="arrow-up" fontSize={16} />}
              aria-label="发送"
              disabled={disabled || sending || (!value.trim() && commandTags.length === 0 && attachedFiles.length === 0)}
              onClick={runSend}
              className="vc-biz-vcell-input-btn-send"
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default VInput;