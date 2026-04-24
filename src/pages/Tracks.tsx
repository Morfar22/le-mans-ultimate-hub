import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map, Search, Flag } from "lucide-react";

interface Track {
  id: string;
  name: string;
  country: string | null;
  length_km: number;
  corners: number | null;
  tire_wear_level: string | null;
  fuel_estimate_hypercar: number | null;
}

export const Tracks = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("tracks")
        .select("id,name,country,length_km,corners,tire_wear_level,fuel_estimate_hypercar")
        .order("name");
      setTracks(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = tracks.filter(t =>
    t.name.toLowerCase().includes(q.toLowerCase()) || (t.country ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="container py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-primary mb-2">
            <Map className="h-3.5 w-3.5" /> Track Database
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Know every corner.</h1>
          <p className="text-muted-foreground mt-2">Track data, fuel estimates and community tips for every LMU circuit.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tracks..." className="pl-9" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground font-mono">Loading tracks...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <Link to={`/tracks/${t.id}`} key={t.id} className="group">
              <Card className="h-full hover:border-primary/50 transition-all hover:-translate-y-0.5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Flag className="h-5 w-5 text-primary" />
                    {t.tire_wear_level && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-border bg-secondary">
                        Tires: {t.tire_wear_level}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-xl mb-1 group-hover:text-primary transition-colors">{t.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-4">{t.country}</p>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                    <Spec label="Length" value={`${t.length_km} km`} />
                    <Spec label="Corners" value={t.corners?.toString() ?? "—"} />
                    <Spec label="Fuel/lap" value={t.fuel_estimate_hypercar ? `${t.fuel_estimate_hypercar}L` : "—"} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Spec = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-mono font-semibold text-sm">{value}</div>
  </div>
);

export default Tracks;
