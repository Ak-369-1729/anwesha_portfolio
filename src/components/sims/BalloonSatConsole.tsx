"use client";

import { useCallback, useRef, useState } from "react";
import { useInView, useInterval } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { SimButton, SimFrame } from "./SimFrame";

type Phase = "PRELAUNCH" | "ASCENT" | "BURST" | "DESCENT" | "LANDED";

const BURST_ALT = 31_000;
const ASCENT_RATE = 5;
const MAX_ALT = 36_000;
const LAUNCH = { lat: 30.705, lon: 76.61 };

/** International Standard Atmosphere approximation (°C). */
function temperature(h: number) {
  if (h < 11_000) return 15 - 0.0065 * h;
  if (h < 20_000) return -56.5;
  if (h < 32_000) return -56.5 + 0.001 * (h - 20_000);
  return -44.5 + 0.0028 * (h - 32_000);
}

/** Barometric formula by layer (hPa). */
function pressure(h: number) {
  if (h < 11_000) return 1013.25 * Math.pow(1 - (0.0065 * h) / 288.15, 5.2559);
  if (h < 20_000) return 226.32 * Math.exp(-0.0001577 * (h - 11_000));
  if (h < 32_000) return 54.75 * Math.pow(1 + (0.001 * (h - 20_000)) / 216.65, -34.163);
  return 8.68 * Math.pow(1 + (0.0028 * (h - 32_000)) / 228.65, -12.2);
}

interface State {
  t: number;
  alt: number;
  vz: number;
  lat: number;
  lon: number;
  battery: number;
  phase: Phase;
  seq: number;
  sats: number;
  fix: "3D" | "2D" | "NONE";
  rssi: number;
  ok: number;
  crc: number;
  lost: number;
  history: number[];
  packets: { seq: number; text: string; status: "OK" | "CRC" | "LOST" }[];
}

const initial = (): State => ({
  t: 0,
  alt: 0,
  vz: 0,
  lat: LAUNCH.lat,
  lon: LAUNCH.lon,
  battery: 100,
  phase: "PRELAUNCH",
  seq: 0,
  sats: 10,
  fix: "3D",
  rssi: -42,
  ok: 0,
  crc: 0,
  lost: 0,
  history: [0],
  packets: [],
});

function step(s: State, dt: number): State {
  const n = { ...s, t: s.t + dt };
  if (s.phase === "LANDED") return s;
  if (s.phase === "PRELAUNCH") {
    n.phase = s.t > 20 ? "ASCENT" : "PRELAUNCH";
  } else if (s.phase === "ASCENT") {
    n.vz = ASCENT_RATE + Math.sin(s.t / 90) * 0.6;
    n.alt = s.alt + n.vz * dt;
    if (n.alt >= BURST_ALT) {
      n.alt = BURST_ALT;
      n.phase = "BURST";
    }
  } else if (s.phase === "BURST") {
    n.phase = "DESCENT";
  } else if (s.phase === "DESCENT") {
    // parachute descent: faster in thin air, slowing as density increases
    n.vz = -(5.5 * Math.exp(s.alt / 14_000));
    n.alt = Math.max(0, s.alt + n.vz * dt);
    if (n.alt <= 0) {
      n.phase = "LANDED";
      n.vz = 0;
    }
  }
  // wind drift — strongest around the jet stream (~10–14 km)
  const jet = Math.exp(-Math.pow((n.alt - 12_000) / 5_000, 2));
  const wind = 4 + jet * 28;
  n.lon = s.lon + (wind * dt) / 96_000;
  n.lat = s.lat + (Math.sin(s.t / 400) * 2 * dt) / 111_000;
  const cold = temperature(n.alt) < -40 ? 1.6 : 1;
  n.battery = Math.max(0, s.battery - 0.0016 * dt * cold);
  const ground = Math.hypot((n.lat - LAUNCH.lat) * 111, (n.lon - LAUNCH.lon) * 96);
  const dist = Math.max(0.05, Math.hypot(ground, n.alt / 1000));
  n.rssi = Math.round(-42 - 20 * Math.log10(dist / 0.05) * 0.62 + (Math.random() - 0.5) * 3);
  n.sats = Math.max(5, Math.min(14, s.sats + Math.round((Math.random() - 0.5) * 1.4)));
  n.fix = n.sats >= 7 ? "3D" : n.sats >= 5 ? "2D" : "NONE";
  n.seq = s.seq + 1;
  const r = Math.random();
  const lossChance = Math.min(0.06, dist / 900);
  const status: "OK" | "CRC" | "LOST" = r < lossChance ? "LOST" : r < lossChance + 0.02 ? "CRC" : "OK";
  n.ok = s.ok + (status === "OK" ? 1 : 0);
  n.crc = s.crc + (status === "CRC" ? 1 : 0);
  n.lost = s.lost + (status === "LOST" ? 1 : 0);
  const text = `$BSAT,${n.seq},${n.alt.toFixed(0)},${n.lat.toFixed(4)},${n.lon.toFixed(4)},${temperature(n.alt).toFixed(1)},${pressure(n.alt).toFixed(1)},${n.battery.toFixed(1)},${n.rssi},${n.sats}`;
  n.packets = [...s.packets.slice(-5), { seq: n.seq, text, status }];
  n.history = [...s.history.slice(-119), n.alt];
  return n;
}

const LAYERS = [
  { from: 0, to: 12_000, name: "Troposphere", color: "rgba(45,91,227,0.10)" },
  { from: 12_000, to: MAX_ALT, name: "Stratosphere", color: "rgba(45,91,227,0.04)" },
];

function fmtTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `T+${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function BalloonSatConsole() {
  const [s, setS] = useState<State>(initial);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(240);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");

  const tick = useCallback(() => setS((prev) => step(prev, speed * 0.25)), [speed]);
  useInterval(tick, 250, visible && running && s.phase !== "LANDED");

  const H = 300;
  const y = (alt: number) => H - (alt / MAX_ALT) * H;
  const temp = temperature(s.alt);
  const pres = pressure(s.alt);
  const last = s.packets[s.packets.length - 1];

  const tiles: { k: string; v: string; unit?: string; tone?: string }[] = [
    { k: "Altitude", v: s.alt.toFixed(0), unit: "m", tone: "text-blueprint" },
    { k: "Vertical velocity", v: s.vz.toFixed(1), unit: "m/s", tone: s.vz < 0 ? "text-ochre" : "text-ink" },
    { k: "Latitude", v: s.lat.toFixed(5), unit: "°N" },
    { k: "Longitude", v: s.lon.toFixed(5), unit: "°E" },
    { k: "Temperature", v: temp.toFixed(1), unit: "°C", tone: temp < -40 ? "text-blueprint" : "text-ink" },
    { k: "Pressure", v: pres.toFixed(pres < 10 ? 2 : 1), unit: "hPa" },
    { k: "Battery", v: s.battery.toFixed(1), unit: "%", tone: s.battery < 30 ? "text-redline" : "text-verdigris" },
    { k: "Signal", v: String(s.rssi), unit: "dBm", tone: s.rssi < -105 ? "text-ochre" : "text-ink" },
    { k: "GNSS fix", v: `${s.fix} · ${s.sats} sats`, tone: s.fix === "3D" ? "text-verdigris" : "text-ochre" },
    { k: "Packets", v: `${s.ok} ok · ${s.crc} crc · ${s.lost} lost`, tone: "text-graphite" },
  ];

  const spark = s.history
    .map((a, i) => `${(i / Math.max(1, s.history.length - 1)) * 100},${30 - (a / MAX_ALT) * 30}`)
    .join(" ");

  return (
    <div ref={ref}>
      <SimFrame
        title="BalloonSat · mission control"
        status={
          <span>
            {fmtTime(s.t)} ·{" "}
            <span className={cn(s.phase === "DESCENT" ? "text-ochre" : s.phase === "LANDED" ? "text-verdigris" : "text-blueprint")}>{s.phase}</span>
          </span>
        }
        controls={
          <>
            <SimButton onClick={() => setRunning((r) => !r)} disabled={s.phase === "LANDED"}>
              {running ? "Hold" : "Resume"}
            </SimButton>
            <SimButton
              onClick={() => {
                setS(initial());
                setRunning(true);
              }}
            >
              Reset flight
            </SimButton>
            <span className="ml-auto flex gap-1.5">
              {[30, 60, 240].map((x) => (
                <SimButton key={x} onClick={() => setSpeed(x)} pressed={speed === x}>
                  {x}×
                </SimButton>
              ))}
            </span>
          </>
        }
        footer={
          <div className="px-4 py-3">
            <p className="label mb-1.5 text-[12.5px]">raw downlink</p>
            <ol className="h-[92px] overflow-hidden font-cond text-[13px] leading-[1.55]" aria-label="Raw telemetry packets">
              {s.packets.map((p) => (
                <li key={p.seq} className={cn("truncate", p.status === "OK" ? "text-graphite" : p.status === "CRC" ? "text-ochre" : "text-redline")}>
                  {p.status === "LOST" ? `#${p.seq} — packet lost (sequence gap)` : `${p.text}${p.status === "CRC" ? "  ← CRC FAIL" : "*OK"}`}
                </li>
              ))}
            </ol>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-[150px_minmax(0,1fr)]">
          <div className="relative border-b border-line md:border-b-0 md:border-r">
            <svg viewBox={`0 0 150 ${H}`} className="h-[220px] w-full md:h-full" preserveAspectRatio="none" role="img" aria-label={`Balloon at ${s.alt.toFixed(0)} metres in the ${s.alt < 12_000 ? "troposphere" : "stratosphere"}`}>
              {LAYERS.map((l) => (
                <rect key={l.name} x={0} y={y(l.to)} width={150} height={y(l.from) - y(l.to)} fill={l.color} />
              ))}
              <rect x={0} y={y(35_000)} width={150} height={y(15_000) - y(35_000)} fill="rgba(43,122,75,0.05)" />
              {[0, 5, 10, 15, 20, 25, 30, 35].map((km) => (
                <g key={km}>
                  <line x1={0} x2={8} y1={y(km * 1000)} y2={y(km * 1000)} stroke="rgba(27,47,110,0.3)" />
                  <text x={11} y={y(km * 1000) + 3} fontSize={7} fill="#5e6977" fontFamily="var(--font-archivo)">
                    {km}km
                  </text>
                </g>
              ))}
              <line x1={0} x2={150} y1={y(12_000)} y2={y(12_000)} stroke="rgba(45,91,227,0.35)" strokeDasharray="3 3" />
              <text x={146} y={y(12_000) - 3} textAnchor="end" fontSize={6.5} fill="#2d5be3" fontFamily="var(--font-archivo)">
                Tropopause
              </text>
              <text x={146} y={y(26_000)} textAnchor="end" fontSize={6.5} fill="#2b7a4b" fontFamily="var(--font-archivo)">
                Ozone layer
              </text>
              <line x1={0} x2={150} y1={y(BURST_ALT)} y2={y(BURST_ALT)} stroke="rgba(179,48,31,0.35)" strokeDasharray="2 4" />
              <text x={146} y={y(BURST_ALT) - 3} textAnchor="end" fontSize={6.5} fill="#b3301f" fontFamily="var(--font-archivo)">
                Burst at about 31 km
              </text>
              <g style={{ transform: `translate(95px, ${y(s.alt)}px)`, transition: "transform 250ms linear" }}>
                <line y1={0} y2={14} stroke="#1b2f6e" strokeWidth={0.8} />
                {s.phase === "DESCENT" || s.phase === "LANDED" ? (
                  <path d="M-9 -2 Q0 -12 9 -2 Z" fill="#87570c" />
                ) : (
                  <ellipse cx={0} cy={-8} rx={6 + (s.alt / MAX_ALT) * 6} ry={8 + (s.alt / MAX_ALT) * 6} fill="#1b2f6e" opacity={0.9} />
                )}
                <rect x={-3} y={14} width={6} height={5} fill="#2d5be3" />
              </g>
            </svg>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
              {tiles.map((t) => (
                <div key={t.k} className="bg-paper-deep p-2.5">
                  <dt className="font-cond text-[12px] text-pencil">{t.k}</dt>
                  <dd className={cn("mt-1 font-cond text-[13px] tabular-nums", t.tone ?? "text-ink")}>
                    {t.v}
                    {t.unit ? <span className="ml-1 text-[12.5px] text-pencil">{t.unit}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 border border-line p-2">
              <div className="flex justify-between font-cond text-[12px] text-pencil">
                <span>Altitude profile</span>
                <span>
                  last packet #{last?.seq ?? 0} · {last?.status ?? "—"}
                </span>
              </div>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-1 h-14 w-full" aria-hidden="true">
                <polyline points={spark} fill="none" stroke="#2d5be3" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <p className="mt-2 font-cond text-[12.5px] text-pencil">
              Simulated flight using standard-atmosphere temperature and pressure models. Not recorded flight data.
            </p>
          </div>
        </div>
      </SimFrame>
    </div>
  );
}
