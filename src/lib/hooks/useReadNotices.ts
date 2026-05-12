"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "rebone_read_notices";

export function useReadNotices() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setReadIds(new Set(JSON.parse(raw)));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isUnread = useCallback((id: string) => !readIds.has(id), [readIds]);

  return { markAsRead, isUnread };
}
