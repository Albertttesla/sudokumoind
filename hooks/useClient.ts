"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
