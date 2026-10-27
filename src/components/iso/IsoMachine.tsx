import { boxFaces, footprint, project, shade, type MachineSpec } from "@/lib/iso";

/** Draws a machine's base plate and blocks at the current SVG origin. */
export function MachineShape({ spec, scale }: { spec: MachineSpec; scale: number }) {
  const { w, d } = footprint(spec);
  const base = boxFaces({ x: -0.2, y: -0.2, w, d, h: 0.18 }, 0, scale);
  const parts = [...spec.parts].sort((a, b) => a.x + a.y - (b.x + b.y));
  return (
    <g>
      <polygon points={base.left} fill="#e4e7f6" />
      <polygon points={base.right} fill="#d3d7ee" />
      <polygon points={base.top} fill="#ffffff" />
      {parts.map((part, i) => {
        const f = boxFaces(part, 0.18, scale);
        return (
          <g key={i} stroke="rgba(21,22,58,0.12)" strokeWidth={0.75} strokeLinejoin="round">
            <polygon points={f.left} fill={shade(spec.color, 0.86)} />
            <polygon points={f.right} fill={shade(spec.color, 0.7)} />
            <polygon points={f.top} fill={shade(spec.color, 1.14)} />
          </g>
        );
      })}
    </g>
  );
}

/** A standalone machine illustration, cropped to its own bounds. */
export function IsoMachine({
  spec,
  className,
  scale = 30,
  title,
}: {
  spec: MachineSpec;
  className?: string;
  scale?: number;
  title?: string;
}) {
  const { w, d, h } = footprint(spec);
  const corners = [
    project(-0.2, -0.2, 0, scale),
    project(w, -0.2, 0, scale),
    project(-0.2, d, 0, scale),
    project(w, d, 0, scale),
    project(-0.2, -0.2, h + 0.2, scale),
    project(w, -0.2, h + 0.2, scale),
  ];
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const pad = 4;
  const vb = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
  return (
    <svg viewBox={vb.join(" ")} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <MachineShape spec={spec} scale={scale} />
    </svg>
  );
}
