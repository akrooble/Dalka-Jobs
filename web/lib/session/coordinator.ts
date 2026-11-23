import type { Session } from "../api/client.ts";

// Coordinates all browser-session reads and writes. Aborted reads can still
// settle in a transport, so generation checks are required as well as abort.
export class SessionCoordinator {
  private generation = 0;
  private read: AbortController | null = null;
  private changing = false;
  private disposed = false;
  private load: (signal: AbortSignal) => Promise<Session>;
  private accept: (session: Session | null) => void;
  private checking: (value: boolean) => void;
  private failed: (error: unknown) => void;
  constructor(load: (signal: AbortSignal) => Promise<Session>, accept: (session: Session | null) => void, checking: (value: boolean) => void, failed: (error: unknown) => void) { this.load=load; this.accept=accept; this.checking=checking; this.failed=failed; }
  private cancelRead() { this.read?.abort(); this.read = null; return ++this.generation; }
  async refresh() {
    if (this.disposed || this.changing) return;
    const generation = this.cancelRead(); const abort = new AbortController(); this.read = abort; this.checking(true);
    try { const value = await this.load(abort.signal); if (!this.disposed && generation === this.generation) this.accept(value); }
    catch (error) { if (!this.disposed && generation === this.generation && !abort.signal.aborted) { this.accept(null); this.failed(error); } }
    finally { if (!this.disposed && generation === this.generation) { this.read = null; this.checking(false); } }
  }
  async mutate(change: () => Promise<Session>) {
    if (this.disposed || this.changing) throw new Error("A session change is already in progress.");
    const generation = this.cancelRead(); this.changing = true; this.checking(true);
    try { const value = await change(); if (!this.disposed && generation === this.generation) this.accept(value); return value; }
    finally { this.changing = false; if (!this.disposed && generation === this.generation) this.checking(false); }
  }
  clear() { this.cancelRead(); if (!this.disposed) this.accept(null); }
  dispose() { this.disposed = true; this.cancelRead(); }
  activate() { this.disposed = false; }
}
