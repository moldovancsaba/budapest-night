"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bn.reviewerId";

function createReviewerId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  }
  return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function readReviewerId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
    const next = createReviewerId();
    localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return createReviewerId();
  }
}

export function useReviewerId(): string {
  const [reviewerId, setReviewerId] = useState("");

  useEffect(() => {
    setReviewerId(readReviewerId());
  }, []);

  return reviewerId;
}
