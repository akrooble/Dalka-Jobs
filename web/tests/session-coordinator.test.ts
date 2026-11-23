import assert from "node:assert/strict";
import test from "node:test";
import { SessionCoordinator } from "../lib/session/coordinator.ts";
import type { Session } from "../lib/api/client.ts";

const anonymous: Session = {state:"anonymous",csrfToken:"a".repeat(64)};
const applicant: Session = {state:"applicant",subject:"applicant",csrfToken:"b".repeat(64)};
function deferred<T>() { let resolve!: (value:T)=>void; const promise = new Promise<T>(r=>{resolve=r;}); return {promise,resolve}; }

test("late anonymous focus read cannot overwrite successful code verification",async()=>{
  const held=deferred<Session>(); const seen:(Session|null)[]=[]; let signal:AbortSignal|undefined;
  const c=new SessionCoordinator(s=>{signal=s;return held.promise;},s=>seen.push(s),()=>{},()=>{});
  const pending=c.refresh();await c.mutate(async()=>applicant);assert.ok(signal?.aborted);
  held.resolve(anonymous);await pending;assert.deepEqual(seen,[applicant]);
});
test("late applicant focus read cannot restore private state after logout or deletion",async()=>{
  for(const action of ["logout","deletion"]){const held=deferred<Session>();const seen:(Session|null)[]=[];
    const c=new SessionCoordinator(()=>held.promise,s=>seen.push(s),()=>{},()=>{});
    const pending=c.refresh();await c.mutate(async()=>anonymous);held.resolve(applicant);await pending;
    assert.deepEqual(seen,[anonymous],action);
  }
});
test("focus reads cannot race a session write, and failed current reads clear authority",async()=>{
  let reads=0;const held=deferred<Session>();const seen:(Session|null)[]=[];let errors=0;
  const c=new SessionCoordinator(async()=>{reads++;throw Error("synthetic unavailable");},s=>seen.push(s),()=>{},()=>{errors++;});
  const changing=c.mutate(()=>held.promise);await c.refresh();assert.equal(reads,0);held.resolve(applicant);await changing;
  await c.refresh();assert.deepEqual(seen,[applicant,null]);assert.equal(errors,1);
});
test("disposed session readers cannot update an unmounted account",async()=>{
  const held=deferred<Session>();const seen:(Session|null)[]=[];
  const c=new SessionCoordinator(()=>held.promise,s=>seen.push(s),()=>{},()=>{});
  const pending=c.refresh();c.dispose();held.resolve(applicant);await pending;assert.deepEqual(seen,[]);
});
