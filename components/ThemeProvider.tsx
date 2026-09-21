"use client";

import { useEffect } from "react";

/**
 * Reads `fm_gender` from localStorage on mount and sets
 * `document.documentElement.dataset.theme` to "male" or "female".
 *
 * - Runs once per page load, before first paint where possible.
 * - Does nothing if no stored value exists (defaults to male/orange via CSS :root).
 * - Also listens for storage events so the theme syncs if the user updates
 *   their choice in another tab.
 */
export default function ThemeProvider() {
  useEffect(() => {
    function applyTheme() {
      try {
        const gender = localStorage.getItem("fm_gender");
        if (gender === "female" || gender === "male") {
          document.documentElement.dataset.theme = gender;
        } else {
          // No stored preference — use default (male/orange) by removing attr
          delete document.documentElement.dataset.theme;
        }
      } catch {
        // localStorage unavailable — do nothing
      }
    }

    applyTheme();

    // Keep in sync if choice changes in another tab
    window.addEventListener("storage", applyTheme);
    return () => window.removeEventListener("storage", applyTheme);
  }, []);

  // This component renders nothing — pure side-effect only
  return null;
}
