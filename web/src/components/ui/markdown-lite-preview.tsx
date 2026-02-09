import type { ReactNode } from "react";

type MarkdownLitePreviewProps = {
  text: string;
};

function renderInline(value: string) {
  const segments = value.split("**");
  if (segments.length < 3) {
    return value;
  }

  return segments.map((segment, index) => {
    if (index % 2 === 1) {
      return <strong key={`${segment}-${index}`}>{segment}</strong>;
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
}

export function MarkdownLitePreview({ text }: MarkdownLitePreviewProps) {
  const lines = text.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    nodes.push(
      <ul key={`list-${nodes.length}`} className="markdown-list">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();

    if (line.startsWith("### ")) {
      nodes.push(<h4 key={`h4-${nodes.length}`}>{renderInline(line.slice(4))}</h4>);
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(<h3 key={`h3-${nodes.length}`}>{renderInline(line.slice(3))}</h3>);
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(<h2 key={`h2-${nodes.length}`}>{renderInline(line.slice(2))}</h2>);
      continue;
    }

    nodes.push(
      <p key={`p-${nodes.length}`} className="markdown-paragraph">
        {renderInline(line)}
      </p>,
    );
  }

  flushList();

  if (nodes.length === 0) {
    return <p className="meta">Nothing to preview yet.</p>;
  }

  return <div className="markdown-preview">{nodes}</div>;
}
