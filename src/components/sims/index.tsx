"use client";

import dynamic from "next/dynamic";
import { LazyMount } from "@/components/ui/LazyMount";
import type { SimulationId } from "@/data/types";

function SimLoading() {
  return (
    <div className="frame flex h-[420px] items-center justify-center" role="status">
      <span className="label animate-pulse-soft">Booting simulation…</span>
    </div>
  );
}

/** Each simulation is code-split; only the one on screen is downloaded. */
const SIMS: Record<SimulationId, React.ComponentType> = {
  eventmesh: dynamic(() => import("./EventMeshSim"), { ssr: false, loading: SimLoading }),
  nexus: dynamic(() => import("./NexusSim"), { ssr: false, loading: SimLoading }),
  resqmesh: dynamic(() => import("./ResqSim"), { ssr: false, loading: SimLoading }),
  chronoheritage: dynamic(() => import("./ChronoJourney"), { ssr: false, loading: SimLoading }),
  careeros: dynamic(() => import("./CareerConstellation"), { ssr: false, loading: SimLoading }),
  boundarylens: dynamic(() => import("./AuthzPlayground"), { ssr: false, loading: SimLoading }),
  prepai: dynamic(() => import("./InterviewSim"), { ssr: false, loading: SimLoading }),
  balloonsat: dynamic(() => import("./BalloonSatConsole"), { ssr: false, loading: SimLoading }),
};

export function Simulation({ id }: { id: SimulationId }) {
  const Sim = SIMS[id];
  return (
    <LazyMount placeholderClassName="frame h-[420px]">
      <Sim />
    </LazyMount>
  );
}
