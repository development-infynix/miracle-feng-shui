'use client';

import { useEffect, useState } from 'react';

export interface StoreSettings {
  cancellationAllowed: boolean;
}

// Asked once per page load and shared by everything that needs it.
let request: Promise<StoreSettings | null> | null = null;
const load = () =>
  (request ??= fetch('/api/settings')
    .then((res) => res.json())
    .then((json) => (json.success ? (json.data as StoreSettings) : null))
    .catch(() => null));

/** The store's public settings, or null until they've loaded (or if they couldn't be). */
export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  useEffect(() => {
    let live = true;
    load().then((value) => live && setSettings(value));
    return () => {
      live = false;
    };
  }, []);
  return settings;
}
