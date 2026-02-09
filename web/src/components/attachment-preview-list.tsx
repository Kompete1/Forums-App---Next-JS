"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

type AttachmentPreviewListProps = {
  files: File[];
  onRemove: (index: number) => void;
};

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentPreviewList({ files, onRemove }: AttachmentPreviewListProps) {
  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [previews]);

  if (previews.length === 0) {
    return null;
  }

  return (
    <div className="attachments-preview-grid">
      {previews.map((preview, index) => (
        <article key={`${preview.file.name}-${index}`} className="attachment-preview-card">
          <Image src={preview.url} alt={preview.file.name} className="attachment-preview-image" width={200} height={112} unoptimized />
          <div className="stack-tight">
            <p className="meta attachment-preview-name">{preview.file.name}</p>
            <p className="meta">{formatBytes(preview.file.size)}</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => onRemove(index)}>
            Remove
          </button>
        </article>
      ))}
    </div>
  );
}
