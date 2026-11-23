"use client";

import { createContext, Fragment, useContext, useState, type ReactNode } from "react";
import { createDemoState, type DemoState } from "../../lib/frontend-demo";

type DemoContextValue = { state: DemoState; update: (change: (state: DemoState) => DemoState, recordId: string, message: string) => void; notice: string; dismiss: () => void; reset: () => void };
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDemoState);
  const [notice, setNotice] = useState("");
  const [generation, setGeneration] = useState(0);
  function update(change: (state: DemoState) => DemoState, recordId: string, message: string) {
    const event = { id: crypto.randomUUID(), actorId: "demo-owner", recordId, time: new Date().toISOString() };
    setState(previous => { const next = change(previous); return { ...next, activity: [event, ...next.activity].slice(0, 100) }; });
    setNotice(`${message} · Sample only, kept until refresh.`);
  }
  return <DemoContext.Provider value={{ state, update, notice, dismiss: () => setNotice(""), reset: () => { setState(createDemoState()); setGeneration(g => g + 1); setNotice("Sample workspace reset."); } }}><Fragment key={generation}>{children}</Fragment></DemoContext.Provider>;
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}
