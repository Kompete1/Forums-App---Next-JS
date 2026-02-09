"use client";

type ReplyQuoteButtonProps = {
  threadId: string;
  replyBody: string;
};

function toQuoteSnippet(body: string) {
  const quotedLines = body
    .split(/\r?\n/)
    .map((line) => `> ${line}`.trimEnd())
    .join("\n");

  return `${quotedLines}\n\nReply:`;
}

export function ReplyQuoteButton({ threadId, replyBody }: ReplyQuoteButtonProps) {
  function onClick() {
    const snippet = toQuoteSnippet(replyBody);
    window.dispatchEvent(
      new CustomEvent("forum:quote-reply", {
        detail: {
          threadId,
          snippet,
        },
      }),
    );
    const composer = document.getElementById("reply-composer");
    composer?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={onClick}>
      Quote
    </button>
  );
}
