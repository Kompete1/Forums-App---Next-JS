"use client";

import type { RefObject } from "react";

type MarkdownToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
};

function replaceSelection(
  input: HTMLTextAreaElement,
  value: string,
  nextValue: string,
  nextCursorStart: number,
  nextCursorEnd: number,
  onChange: (next: string) => void,
) {
  onChange(nextValue);
  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(nextCursorStart, nextCursorEnd);
  });
}

function wrapSelection(input: HTMLTextAreaElement, value: string, prefix: string, suffix: string, placeholder: string, onChange: (next: string) => void) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const selected = value.slice(start, end) || placeholder;
  const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
  const cursorStart = start + prefix.length;
  const cursorEnd = cursorStart + selected.length;
  replaceSelection(input, value, next, cursorStart, cursorEnd, onChange);
}

function prefixLines(input: HTMLTextAreaElement, value: string, marker: string, fallback: string, onChange: (next: string) => void) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const selected = value.slice(start, end) || fallback;
  const transformed = selected
    .split(/\r?\n/)
    .map((line) => `${marker}${line}`)
    .join("\n");
  const next = `${value.slice(0, start)}${transformed}${value.slice(end)}`;
  replaceSelection(input, value, next, start, start + transformed.length, onChange);
}

function insertHeading(input: HTMLTextAreaElement, value: string, level: 2 | 3, onChange: (next: string) => void) {
  const marker = level === 2 ? "## " : "### ";
  prefixLines(input, value, marker, "Heading", onChange);
}

function insertCodeBlock(input: HTMLTextAreaElement, value: string, onChange: (next: string) => void) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const selected = value.slice(start, end) || "code";
  const block = `\`\`\`\n${selected}\n\`\`\``;
  const next = `${value.slice(0, start)}${block}${value.slice(end)}`;
  replaceSelection(input, value, next, start + 4, start + 4 + selected.length, onChange);
}

function insertLink(input: HTMLTextAreaElement, value: string, onChange: (next: string) => void) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const selected = value.slice(start, end) || "link text";
  const snippet = `[${selected}](https://example.com)`;
  const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
  const urlStart = start + selected.length + 3;
  const urlEnd = urlStart + "https://example.com".length;
  replaceSelection(input, value, next, urlStart, urlEnd, onChange);
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  function withTextarea(action: (textarea: HTMLTextAreaElement) => void) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    action(textarea);
  }

  return (
    <div className="markdown-toolbar" role="toolbar" aria-label="Markdown formatting">
      <button type="button" className="toolbar-btn" onClick={() => withTextarea((el) => insertHeading(el, value, 2, onChange))}>
        H2
      </button>
      <button type="button" className="toolbar-btn" onClick={() => withTextarea((el) => insertHeading(el, value, 3, onChange))}>
        H3
      </button>
      <button type="button" className="toolbar-btn" onClick={() => withTextarea((el) => wrapSelection(el, value, "**", "**", "bold text", onChange))}>
        Bold
      </button>
      <button type="button" className="toolbar-btn" onClick={() => withTextarea((el) => prefixLines(el, value, "- ", "List item", onChange))}>
        List
      </button>
      <button type="button" className="toolbar-btn" onClick={() => withTextarea((el) => prefixLines(el, value, "> ", "Quoted text", onChange))}>
        Quote
      </button>
      <button type="button" className="toolbar-btn" onClick={() => withTextarea((el) => insertCodeBlock(el, value, onChange))}>
        Code
      </button>
      <button type="button" className="toolbar-btn" onClick={() => withTextarea((el) => insertLink(el, value, onChange))}>
        Link
      </button>
    </div>
  );
}
