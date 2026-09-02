import { useEffect, useRef } from "react";

/**
 * Warns the user before leaving the page when `enabled` is true (e.g. dirty form).
 * Uses the browser's beforeunload prompt for tab/refresh closes.
 */
export function useBeforeUnload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}

/**
 * Tracks the "dirty" state of any form. Pass `dirty` from react-hook-form.
 * Returns a self-resetting visual flag (used to display a "alterações não salvas" badge).
 */
export function useDirtyNotice(dirty: boolean) {
  const shownRef = useRef(false);
  useEffect(() => {
    if (dirty && !shownRef.current) {
      shownRef.current = true;
    }
    if (!dirty) {
      shownRef.current = false;
    }
  }, [dirty]);
  return dirty || shownRef.current;
}