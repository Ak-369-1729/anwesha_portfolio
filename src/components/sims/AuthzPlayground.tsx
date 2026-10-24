"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SimButton, SimFrame } from "./SimFrame";

type Role = "viewer" | "editor" | "admin";
type Action = "read" | "update" | "delete";

const USERS = [
  { id: "alice", role: "editor" as Role, tenant: "acme" },
  { id: "bob", role: "viewer" as Role, tenant: "acme" },
  { id: "mallory", role: "viewer" as Role, tenant: "globex" },
  { id: "root", role: "admin" as Role, tenant: "acme" },
];

const RESOURCES = [
  { id: "invoice/1042", owner: "alice", tenant: "acme" },
  { id: "invoice/2077", owner: "carol", tenant: "globex" },
  { id: "profile/bob", owner: "bob", tenant: "acme" },
];

const ACTIONS: { id: Action; method: string }[] = [
  { id: "read", method: "GET" },
  { id: "update", method: "PATCH" },
  { id: "delete", method: "DELETE" },
];

const ROLE_PERMS: Record<Role, Action[]> = {
  viewer: ["read"],
  editor: ["read", "update"],
  admin: ["read", "update", "delete"],
};

type StepState = "pass" | "fail" | "skip";
interface Step {
  label: string;
  detail: string;
  state: StepState;
}

function evaluate(user: (typeof USERS)[number], res: (typeof RESOURCES)[number], action: Action, objectLevel: boolean) {
  const steps: Step[] = [];
  steps.push({ label: "Authenticate", detail: `token → ${user.id}`, state: "pass" });
  steps.push({ label: "Resolve role", detail: `${user.id} is ${user.role} @ ${user.tenant}`, state: "pass" });
  const rolePermits = ROLE_PERMS[user.role].includes(action);
  steps.push({
    label: "Role permits action",
    detail: rolePermits ? `${user.role} may ${action}` : `${user.role} may not ${action}`,
    state: rolePermits ? "pass" : "fail",
  });
  if (!rolePermits) return { allow: false, steps, rule: `role:${user.role} lacks ${action}` };

  if (!objectLevel) {
    steps.push({ label: "Tenant boundary", detail: "not checked", state: "skip" });
    steps.push({ label: "Ownership / grant", detail: "not checked", state: "skip" });
    return { allow: true, steps, rule: `role:${user.role} allows ${action}` };
  }

  const sameTenant = res.tenant === user.tenant;
  steps.push({
    label: "Tenant boundary",
    detail: sameTenant ? `${res.tenant} = ${user.tenant}` : `${res.tenant} ≠ ${user.tenant}`,
    state: sameTenant ? "pass" : "fail",
  });
  if (!sameTenant) return { allow: false, steps, rule: "tenant isolation" };

  const owns = res.owner === user.id;
  const needsOwnership = action !== "read";
  const ok = !needsOwnership || owns || user.role === "admin";
  steps.push({
    label: "Ownership / grant",
    detail: !needsOwnership ? "read within tenant" : owns ? `${user.id} owns ${res.id}` : user.role === "admin" ? "tenant admin" : `owner is ${res.owner}`,
    state: ok ? "pass" : "fail",
  });
  return { allow: ok, steps, rule: ok ? "policy grant" : "object ownership required" };
}

const CHAIN = ["User", "Role", "Resource", "Action", "Policy", "Decision"];

export default function AuthzPlayground() {
  const [userId, setUserId] = useState("mallory");
  const [resId, setResId] = useState("invoice/1042");
  const [action, setAction] = useState<Action>("read");
  const [reveal, setReveal] = useState(CHAIN.length);

  const user = USERS.find((u) => u.id === userId)!;
  const res = RESOURCES.find((r) => r.id === resId)!;
  const naive = evaluate(user, res, action, false);
  const lens = evaluate(user, res, action, true);
  const vulnerable = naive.allow && !lens.allow;
  const method = ACTIONS.find((a) => a.id === action)!.method;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- replay the evaluation animation when inputs change
    setReveal(0);
    const timers = CHAIN.map((_, i) => window.setTimeout(() => setReveal(i + 1), 140 * (i + 1)));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [userId, resId, action]);

  const picker = <T extends string>(label: string, options: { id: T; text: string }[], value: T, set: (v: T) => void) => (
    <fieldset className="flex flex-wrap items-center gap-1.5">
      <legend className="sr-only">{label}</legend>
      <span className="w-16 font-mono text-[10px] uppercase tracking-[0.14em] text-muted" aria-hidden="true">
        {label}
      </span>
      {options.map((o) => (
        <SimButton key={o.id} onClick={() => set(o.id)} pressed={value === o.id}>
          {o.text}
        </SimButton>
      ))}
    </fieldset>
  );

  return (
    <SimFrame
      title="BoundaryLens · authorization playground"
      status={vulnerable ? <span className="text-danger">IDOR / BOLA exposed</span> : "evaluating"}
      controls={
        <div className="grid w-full gap-2">
          {picker(
            "user",
            USERS.map((u) => ({ id: u.id, text: `${u.id} · ${u.role}@${u.tenant}` })),
            userId,
            setUserId,
          )}
          {picker(
            "resource",
            RESOURCES.map((r) => ({ id: r.id, text: `${r.id} (${r.owner}@${r.tenant})` })),
            resId,
            setResId,
          )}
          {picker(
            "action",
            ACTIONS.map((a) => ({ id: a.id, text: a.id })),
            action,
            setAction,
          )}
        </div>
      }
    >
      <div className="p-4">
        <pre className="overflow-x-auto border border-line bg-bg-deep px-3 py-2 font-mono text-[11px] text-ivory-dim scrollbar-thin">
          <span className="text-ice">{method}</span> /api/{res.id}
          {"\n"}Authorization: Bearer &lt;{user.id}&gt;
        </pre>

        <ol className="mt-4 flex flex-wrap items-center gap-1.5 font-mono text-[10.5px]" aria-label="Authorization chain">
          {CHAIN.map((c, i) => (
            <li key={c} className="flex items-center gap-1.5">
              {i > 0 ? <span className={cn("transition-colors", reveal > i ? "text-ice" : "text-line-strong")}>→</span> : null}
              <span
                className={cn(
                  "border px-2 py-1 uppercase tracking-[0.12em] transition-all duration-200",
                  reveal > i ? "border-ice/50 text-ivory" : "border-line text-muted",
                  i === CHAIN.length - 1 && reveal > i && (lens.allow ? "border-mint bg-mint/10 text-mint" : "border-danger bg-danger/10 text-danger"),
                )}
              >
                {i === CHAIN.length - 1 && reveal > i ? (lens.allow ? "Allow" : "Deny") : c}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            { name: "Role-only check", r: naive, note: "what many APIs actually do" },
            { name: "BoundaryLens policy", r: lens, note: "role + tenant + ownership" },
          ].map(({ name, r, note }) => (
            <div key={name} className={cn("border p-3", r.allow ? "border-mint/30" : "border-danger/30")}>
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-[11px] text-ivory">{name}</p>
                <p className={cn("font-mono text-xs font-semibold", r.allow ? "text-mint" : "text-danger")}>{r.allow ? "ALLOW" : "DENY"}</p>
              </div>
              <p className="font-mono text-[10px] text-muted">{note}</p>
              <ul className="mt-2 grid gap-1">
                {r.steps.map((st) => (
                  <li key={st.label} className="flex justify-between gap-3 font-mono text-[10.5px]">
                    <span className="text-ivory-dim">
                      <span
                        className={cn(st.state === "pass" ? "text-mint" : st.state === "fail" ? "text-danger" : "text-amber")}
                        aria-label={st.state}
                      >
                        {st.state === "pass" ? "✓" : st.state === "fail" ? "✗" : "–"}
                      </span>{" "}
                      {st.label}
                    </span>
                    <span className="truncate text-muted">{st.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-mono text-[10px] text-muted">decided by: {r.rule}</p>
            </div>
          ))}
        </div>

        <p className={cn("mt-4 text-sm leading-relaxed", vulnerable ? "text-danger" : "text-ivory-dim")} aria-live="polite">
          {vulnerable
            ? `Vulnerable: the role check lets ${user.id} ${action} ${res.id}, which belongs to ${res.owner}@${res.tenant}. Changing the ID in the URL is enough — that is IDOR / broken object-level authorization.`
            : naive.allow === lens.allow
              ? "Both checks agree here. Try mallory reading invoice/1042, or bob updating invoice/1042."
              : "The role check is stricter than needed here."}
        </p>
      </div>
    </SimFrame>
  );
}
