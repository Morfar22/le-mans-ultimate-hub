/**
 * Fuel & pit strategy calculator — pure functions, no UI.
 */

export interface StrategyInputs {
  raceMode: "laps" | "minutes";
  raceLaps: number;        // when raceMode === "laps"
  raceMinutes: number;     // when raceMode === "minutes"
  avgLapSeconds: number;
  fuelPerLap: number;      // litres
  tankSize: number;        // litres
  pitLossSeconds: number;  // total time lost per pit (in + stop + out)
  marginMode: "safe" | "aggressive"; // safe = +1 lap reserve, aggressive = +0.3 lap
}

export interface Stint {
  index: number;
  laps: number;
  fuelStart: number;
  fuelEnd: number;
  startTimeSec: number;
  endTimeSec: number;
}

export interface StrategyResult {
  totalLaps: number;
  raceTimeSec: number;
  totalFuel: number;
  pitStops: number;
  stints: Stint[];
  fuelPerStintMax: number;
  marginLitres: number;
  safetyCarBackup: string;
  fuelCurve: { lap: number; fuel: number }[];
}

export function calculateStrategy(inputs: StrategyInputs): StrategyResult {
  const margin = inputs.marginMode === "safe" ? 1 : 0.3; // laps of reserve
  const marginLitres = +(margin * inputs.fuelPerLap).toFixed(2);

  // Total laps
  let totalLaps: number;
  if (inputs.raceMode === "laps") {
    totalLaps = Math.max(1, Math.round(inputs.raceLaps));
  } else {
    totalLaps = Math.max(1, Math.ceil((inputs.raceMinutes * 60) / inputs.avgLapSeconds));
  }

  const usableFuel = Math.max(inputs.fuelPerLap, inputs.tankSize - marginLitres);
  const lapsPerStint = Math.max(1, Math.floor(usableFuel / inputs.fuelPerLap));
  const pitStops = Math.max(0, Math.ceil(totalLaps / lapsPerStint) - 1);

  // Build stints
  const stints: Stint[] = [];
  let lapsLeft = totalLaps;
  let stintIndex = 0;
  let cumulativeTime = 0;

  while (lapsLeft > 0) {
    const stintLaps = Math.min(lapsPerStint, lapsLeft);
    const fuelStart = +(stintLaps * inputs.fuelPerLap + marginLitres).toFixed(2);
    const fuelEnd = +(marginLitres).toFixed(2);
    const startTimeSec = cumulativeTime;
    const endTimeSec = cumulativeTime + stintLaps * inputs.avgLapSeconds;
    stints.push({
      index: stintIndex + 1,
      laps: stintLaps,
      fuelStart: Math.min(fuelStart, inputs.tankSize),
      fuelEnd,
      startTimeSec,
      endTimeSec,
    });
    cumulativeTime = endTimeSec;
    if (lapsLeft - stintLaps > 0) cumulativeTime += inputs.pitLossSeconds;
    lapsLeft -= stintLaps;
    stintIndex++;
  }

  // Fuel curve (per lap)
  const fuelCurve: { lap: number; fuel: number }[] = [];
  let lapCounter = 0;
  for (const s of stints) {
    let fuel = s.fuelStart;
    for (let i = 0; i < s.laps; i++) {
      lapCounter++;
      fuelCurve.push({ lap: lapCounter, fuel: +fuel.toFixed(2) });
      fuel -= inputs.fuelPerLap;
    }
  }

  const totalFuel = stints.reduce((sum, s) => sum + s.laps * inputs.fuelPerLap, 0);
  const fuelPerStintMax = Math.max(...stints.map(s => s.fuelStart));

  const safetyCarBackup =
    pitStops > 0
      ? `If a Safety Car comes out within ±3 laps of a planned stop, pit immediately to capitalise on reduced field pace. Reserve ${marginLitres.toFixed(1)}L for unexpected SC laps.`
      : `Single-stint race. Carry +${marginLitres.toFixed(1)}L reserve to cover SC laps without splash-and-dash.`;

  return {
    totalLaps,
    raceTimeSec: cumulativeTime,
    totalFuel: +totalFuel.toFixed(2),
    pitStops,
    stints,
    fuelPerStintMax: +fuelPerStintMax.toFixed(2),
    marginLitres,
    safetyCarBackup,
    fuelCurve,
  };
}

export function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function formatLapTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(3);
  return `${m}:${s.padStart(6, "0")}`;
}
