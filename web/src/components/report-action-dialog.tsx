"use client";

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ReportActionDialogProps = {
  targetId: string;
  targetType: "thread" | "reply";
  triggerLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  errorMessage?: string | null;
  action: (formData: FormData) => Promise<void>;
};

export function ReportActionDialog({
  targetId,
  targetType,
  triggerLabel,
  dialogTitle,
  dialogDescription,
  errorMessage = null,
  action,
}: ReportActionDialogProps) {
  const hiddenFieldName = targetType === "thread" ? "threadId" : "replyId";
  const reasonId = `report-${targetType}-reason-${targetId}`;
  const notesId = `report-${targetType}-notes-${targetId}`;

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <button type="button" className="btn btn-secondary btn-ghost">
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="dialog-overlay" />
        <DialogContent className="dialog-content card stack">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription className="meta">{dialogDescription}</DialogDescription>
          <form action={action} className="stack">
            <input type="hidden" name={hiddenFieldName} value={targetId} />
            {errorMessage ? <p className="thread-status locked">{errorMessage}</p> : null}
            <div className="field">
              <label htmlFor={reasonId}>Reason</label>
              <input id={reasonId} name="reason" type="text" required minLength={1} maxLength={500} placeholder="Reason for report" />
            </div>
            <div className="field">
              <label htmlFor={notesId}>Notes (optional)</label>
              <textarea id={notesId} name="notes" maxLength={2000} rows={3} placeholder="Extra context" />
            </div>
            <div className="inline-actions">
              <button type="submit" className="btn btn-primary">
                Submit report
              </button>
              <DialogClose asChild>
                <button type="button" className="btn btn-secondary">
                  Cancel
                </button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}
