"use client";

import { useEffect, useRef, useState } from "react";
import { clearDraft, readDraft, type DraftPayload, valuesDiffer, writeDraft } from "@/lib/ui/drafts";

type DraftValues = {
  body: string;
  title?: string;
};

type UseDraftAutosaveParams = {
  draftKey: string;
  values: DraftValues;
  debounceMs?: number;
};

type UseDraftAutosaveResult = {
  hasRestorableDraft: boolean;
  restorableUpdatedAt: string | null;
  dirty: boolean;
  restoreDraft: () => DraftValues | null;
  discardDraft: () => void;
  clearDraftNow: () => void;
};

function serialize(values: DraftValues) {
  return JSON.stringify({
    title: values.title ?? "",
    body: values.body,
  });
}

export function useDraftAutosave({ draftKey, values, debounceMs = 600 }: UseDraftAutosaveParams): UseDraftAutosaveResult {
  const baselineRef = useRef<string>(serialize(values));
  const [restorable, setRestorable] = useState<DraftPayload | null>(null);
  const [initialized, setInitialized] = useState(false);

  const serialized = serialize(values);
  const dirty = serialized !== baselineRef.current;

  useEffect(() => {
    baselineRef.current = serialize(values);
    const existing = readDraft(draftKey);
    if (existing && valuesDiffer(existing, values)) {
      setRestorable(existing);
    } else {
      setRestorable(null);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (!dirty) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      writeDraft(draftKey, {
        title: values.title,
        body: values.body,
      });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, dirty, draftKey, initialized, values.body, values.title]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [dirty]);

  function restoreDraft() {
    if (!restorable) {
      return null;
    }

    setRestorable(null);
    return {
      title: restorable.title,
      body: restorable.body,
    };
  }

  function discardDraft() {
    clearDraft(draftKey);
    setRestorable(null);
  }

  function clearDraftNow() {
    clearDraft(draftKey);
    setRestorable(null);
  }

  return {
    hasRestorableDraft: Boolean(restorable),
    restorableUpdatedAt: restorable?.updatedAt ?? null,
    dirty,
    restoreDraft,
    discardDraft,
    clearDraftNow,
  };
}
