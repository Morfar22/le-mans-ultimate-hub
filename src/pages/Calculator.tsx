import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateStrategy, formatTime, type StrategyInputs, type StrategyResult } from "@/lib/strategy";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Fuel, Flag, Save, AlertTriangle, Gauge, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Track {
  id: string;
  name: string;
  length_km: number;
  fuel_estimate_hypercar: number | null;
  fuel_estimate_lmp2: number | null;
  fuel_estimate_gte: number | null;
  avg_lap_seconds_hypercar: number | null;
}
interface Car {
  id: string;
  name: string;
  class: string;
  default_fuel_per_lap: number;
  default_tank_size: number;
}

export const Calculator = () => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [trackId, setTrackId] = useState<string>("");
  const [carId, setCarId] = useState<string>("");

  const [inputs, setInputs] = useState<StrategyInputs>({
    raceMode: "minutes",
    raceLaps: 30,
    raceMinutes: 60,
    avgLapSeconds: 125,
    fuelPerLap: 4.2,
    tankSize: 90,
    pitLossSeconds: 28,
    marginMode: "safe",
  });

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: c }] = await Promise.all([
        supabase.from("tracks").select("id,name,length_km,fuel_estimate_hypercar,fuel_estimate_lmp2,fuel_estimate_gte,avg_lap_seconds_hypercar").order("name"),
        supabase.from("cars").select("id,name,class,default_fuel_per_lap,default_tank_size").order("name"),
      ]);
      setTracks(t ?? []);
      setCars(c ?? []);
    })();
  }, []);

  // Auto-fill from track + car selection
  useEffect(() => {
    const car = cars.find(c => c.id === carId);
    const track = tracks.find(t => t.id === trackId);
    setInputs(prev => {
      const next = { ...prev };
      if (car) {
        next.fuelPerLap = car.default_fuel_per_lap;
        next.tankSize = car.default_tank_size;
      }
      if (track) {
        const fuel =
          car?.class === "Hypercar" ? track.fuel_estimate_hypercar :
          car?.class === "LMP2" ? track.fuel_estimate_lmp2 :
          car?.class === "GTE" ? track.fuel_estimate_gte : null;
        if (fuel) next.fuelPerLap = Number(fuel);
        if (track.avg_lap_seconds_hypercar) next.avgLapSeconds = Number(track.avg_lap_seconds_hypercar);
      }
      return next;
    });
  }, [carId, trackId, cars, tracks]);

  const result: StrategyResult = useMemo(() => calculateStrategy(inputs), [inputs]);

  const update = <K extends keyof StrategyInputs>(key: K, value: StrategyInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const numUpdate = (key: keyof StrategyInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    update(key, (isNaN(v) ? 0 : v) as never);
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Sign in to save", description: "Create a free account to save strategies." });
      return;
    }
    const name = window.prompt("Name this strategy:", `${tracks.find(t => t.id === trackId)?.name ?? "Custom"} – ${inputs.raceMode === "minutes" ? `${inputs.raceMinutes}min` : `${inputs.raceLaps} laps`}`);
    if (!name) return;
    const { error } = await supabase.from("saved_strategies").insert([{
      user_id: user.id,
      name,
      track_id: trackId || undefined,
      car_id: carId || undefined,
      inputs: inputs as never,
      results: { totalLaps: result.totalLaps, pitStops: result.pitStops, totalFuel: result.totalFuel } as never,
    }]);
    if (error) toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    else toast({ title: "Strategy saved", description: name });
  };

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-primary mb-2">
          <Gauge className="h-3.5 w-3.5" /> Race Engineer
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Fuel & Pit Strategy</h1>
        <p className="text-muted-foreground max-w-2xl">
          Set your race parameters and get an optimal stint plan instantly. Pick a track and car class to auto-fill defaults.
        </p>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* INPUT PANEL */}
        <Card className="lg:sticky lg:top-20 lg:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Fuel className="h-5 w-5 text-primary" /> Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Track</Label>
                <Select value={trackId} onValueChange={setTrackId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {tracks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Car class</Label>
                <Select value={carId} onValueChange={setCarId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {cars.map(c => <SelectItem key={c.id} value={c.id}>{c.class}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Button
                  variant={inputs.raceMode === "minutes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("raceMode", "minutes")}
                  className="flex-1"
                >Time</Button>
                <Button
                  variant={inputs.raceMode === "laps" ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("raceMode", "laps")}
                  className="flex-1"
                >Laps</Button>
              </div>
              {inputs.raceMode === "minutes" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Race length (min)</Label>
                  <Input type="number" value={inputs.raceMinutes} onChange={numUpdate("raceMinutes")} className="font-mono" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Race length (laps)</Label>
                  <Input type="number" value={inputs.raceLaps} onChange={numUpdate("raceLaps")} className="font-mono" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Avg lap (s)</Label>
                <Input type="number" step="0.1" value={inputs.avgLapSeconds} onChange={numUpdate("avgLapSeconds")} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Fuel/lap (L)</Label>
                <Input type="number" step="0.1" value={inputs.fuelPerLap} onChange={numUpdate("fuelPerLap")} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tank (L)</Label>
                <Input type="number" step="1" value={inputs.tankSize} onChange={numUpdate("tankSize")} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pit loss (s)</Label>
                <Input type="number" step="1" value={inputs.pitLossSeconds} onChange={numUpdate("pitLossSeconds")} className="font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3 bg-secondary/40">
              <div>
                <div className="text-sm font-semibold">{inputs.marginMode === "safe" ? "Safe strategy" : "Aggressive strategy"}</div>
                <div className="text-xs text-muted-foreground">
                  {inputs.marginMode === "safe" ? "+1 lap fuel reserve" : "+0.3 lap reserve — risky"}
                </div>
              </div>
              <Switch
                checked={inputs.marginMode === "aggressive"}
                onCheckedChange={(c) => update("marginMode", c ? "aggressive" : "safe")}
              />
            </div>

            <Button onClick={handleSave} className="w-full" variant="outline">
              <Save className="h-4 w-4" /> {user ? "Save strategy" : "Sign in to save"}
            </Button>
          </CardContent>
        </Card>

        {/* RESULTS */}
        <div className="space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI label="Total laps" value={result.totalLaps.toString()} icon={<Flag className="h-4 w-4" />} />
            <KPI label="Pit stops" value={result.pitStops.toString()} icon={<Fuel className="h-4 w-4" />} accent />
            <KPI label="Race time" value={formatTime(result.raceTimeSec)} icon={<Timer className="h-4 w-4" />} />
            <KPI label="Total fuel" value={`${result.totalFuel.toFixed(1)} L`} icon={<Gauge className="h-4 w-4" />} />
          </div>

          {/* FUEL CURVE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" /> Fuel curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.fuelCurve} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="lap" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} unit="L" />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
                      labelFormatter={(l) => `Lap ${l}`}
                      formatter={(v: number) => [`${v.toFixed(1)} L`, 'Fuel']}
                    />
                    <ReferenceLine y={inputs.tankSize} stroke="hsl(var(--warning))" strokeDasharray="4 4" label={{ value: 'Tank', position: 'right', fill: 'hsl(var(--warning))', fontSize: 10 }} />
                    <Line type="monotone" dataKey="fuel" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* STINTS TABLE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" /> Stint plan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wider">Stint</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Laps</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">Fuel in</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider hidden sm:table-cell">Start</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider">End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-mono">
                  {result.stints.map(s => (
                    <TableRow key={s.index}>
                      <TableCell className="font-semibold text-primary">#{s.index}</TableCell>
                      <TableCell>{s.laps}</TableCell>
                      <TableCell>{s.fuelStart.toFixed(1)} L</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{formatTime(s.startTimeSec)}</TableCell>
                      <TableCell>{formatTime(s.endTimeSec)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SAFETY CAR BACKUP */}
          <Card className="border-warning/40">
            <CardContent className="pt-6 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Safety Car backup plan</div>
                <p className="text-sm text-muted-foreground">{result.safetyCarBackup}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const KPI = ({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) => (
  <div className={`rounded-md border p-4 ${accent ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
      {icon}{label}
    </div>
    <div className={`font-mono font-bold text-2xl ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
  </div>
);

export default Calculator;
