import type { ReactNode } from "react";

type MarkdownLitePreviewProps = {
  text: string;
};

function renderInline(value: string, keyPrefix: string) {
  const tokens: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  const pushPlain = (segment: string) => {
    if (!segment) {
      return;
    }

    const boldParts = segment.split("**");
    if (boldParts.length < 3) {
      tokens.push(<span key={`${keyPrefix}-plain-${tokenIndex++}`}>{segment}</span>);
      return;
    }

    boldParts.forEach((part, index) => {
      if (!part) {
        return;
      }
      if (index % 2 === 1) {
        tokens.push(<strong key={`${keyPrefix}-bold-${tokenIndex++}`}>{part}</strong>);
      } else {
        tokens.push(<span key={`${keyPrefix}-plain-${tokenIndex++}`}>{part}</span>);
      }
    });
  };

  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let match = linkPattern.exec(value);
  while (match) {
    const [whole, label, href] = match;
    const start = match.index;
    pushPlain(value.slice(cursor, start));
    tokens.push(
      <a key={`${keyPrefix}-link-${tokenIndex++}`} href={href} target="_blank" rel="noreferrer" className="btn-link focus-link">
        {label}
      </a>,
    );
    cursor = start + whole.length;
    match = linkPattern.exec(value);
  }

  pushPlain(value.slice(cursor));
  return tokens.length > 0 ? tokens : value;
}

export function MarkdownLitePreview({ text }: MarkdownLitePreviewProps) {
  const lines = text.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    nodes.push(
      <ul key={`list-${nodes.length}`} className="markdown-list">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item, `list-${nodes.length}-${index}`)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  const flushCodeBlock = () => {
    if (codeLines.length === 0) {
      nodes.push(
        <pre key={`code-${nodes.length}`} className="markdown-code-block">
          <code />
        </pre>,
      );
      return;
    }

    nodes.push(
      <pre key={`code-${nodes.length}`} className="markdown-code-block">
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
    codeLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === "```") {
      flushList();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

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
      nodes.push(<h4 key={`h4-${nodes.length}`}>{renderInline(line.slice(4), `h4-${nodes.length}`)}</h4>);
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(<h3 key={`h3-${nodes.length}`}>{renderInline(line.slice(3), `h3-${nodes.length}`)}</h3>);
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(<h2 key={`h2-${nodes.length}`}>{renderInline(line.slice(2), `h2-${nodes.length}`)}</h2>);
      continue;
    }

    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={`quote-${nodes.length}`} className="markdown-quote">
          {renderInline(line.slice(2), `quote-${nodes.length}`)}
        </blockquote>,
      );
      continue;
    }

    nodes.push(
      <p key={`p-${nodes.length}`} className="markdown-paragraph">
        {renderInline(line, `p-${nodes.length}`)}
      </p>,
    );
  }

  flushList();
  if (inCodeBlock) {
    flushCodeBlock();
  }

  if (nodes.length === 0) {
    return <p className="meta">Nothing to preview yet.</p>;
  }

  return <div className="markdown-preview">{nodes}</div>;
}
