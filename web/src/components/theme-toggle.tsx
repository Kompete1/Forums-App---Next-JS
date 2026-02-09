"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "sa-forum-theme";

function resolveInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => resolveInitialTheme());

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  function onToggle() {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      aria-label="Switch theme"
      onClick={onToggle}
    >
      <span aria-hidden>Theme</span>
    </button>
  );
}
