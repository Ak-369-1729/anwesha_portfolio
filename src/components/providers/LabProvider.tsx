"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ServiceId } from "@/data/types";

export type Mode = "client" | "recruiter";

interface LabState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  /** "lumos" easter egg — temporarily illuminates every constellation link. */
  lumos: boolean;
  setLumos: (on: boolean) => void;
  mischief: boolean;
  triggerMischief: () => void;
  /** Service pre-selected by a contextual CTA, consumed by the brief composer. */
  briefService: ServiceId | null;
  setBriefService: (s: ServiceId | null) => void;
}

const LabContext = createContext<LabState | null>(null);
const MODE_KEY = "ak-lab-mode";

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("client");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [lumos, setLumosState] = useState(false);
  const [mischief, setMischief] = useState(false);
  const [briefService, setBriefService] = useState<ServiceId | null>(null);
  const lumosTimer = useRef<number | undefined>(undefined);
  const mischiefTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted preference after mount
      if (saved === "client" || saved === "recruiter") setModeState(saved);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setLumos = useCallback((on: boolean) => {
    window.clearTimeout(lumosTimer.current);
    setLumosState(on);
    if (on) lumosTimer.current = window.setTimeout(() => setLumosState(false), 9000);
  }, []);

  const triggerMischief = useCallback(() => {
    window.clearTimeout(mischiefTimer.current);
    setMischief(true);
    mischiefTimer.current = window.setTimeout(() => setMischief(false), 7000);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(lumosTimer.current);
      window.clearTimeout(mischiefTimer.current);
    },
    [],
  );

  const value = useMemo(
    () => ({
      mode,
      setMode,
      paletteOpen,
      setPaletteOpen,
      lumos,
      setLumos,
      mischief,
      triggerMischief,
      briefService,
      setBriefService,
    }),
    [mode, setMode, paletteOpen, lumos, setLumos, mischief, triggerMischief, briefService],
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used inside <LabProvider>");
  return ctx;
}
