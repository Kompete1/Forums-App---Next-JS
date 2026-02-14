"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type PinThreadToggleProps = {
  threadId: string;
  initialPinned: boolean;
  action: (threadId: string, nextPinned: boolean) => Promise<void>;
};

export function PinThreadToggle({ threadId, initialPinned, action }: PinThreadToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPinned, setIsPinned] = useState(initialPinned);

  useEffect(() => {
    setIsPinned(initialPinned);
  }, [initialPinned]);

  return (
    <button
      type="button"
      disabled={isPending}
      className={`btn pin-thread-btn ${isPinned ? "pin-thread-btn-pinned" : "pin-thread-btn-unpinned"}`}
      onClick={() => {
        const nextPinned = !isPinned;
        setIsPinned(nextPinned);
        startTransition(async () => {
          try {
            await action(threadId, nextPinned);
          } catch {
            setIsPinned(!nextPinned);
          } finally {
            router.refresh();
          }
        });
      }}
    >
      {isPinned ? "Pinned" : "Pin"}
    </button>
  );
}
