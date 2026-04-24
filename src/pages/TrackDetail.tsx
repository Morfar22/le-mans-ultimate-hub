import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Flag, Fuel, AlertTriangle, Trophy, Lightbulb, MessageSquarePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TrackDetail {
  id: string;
  name: string;
  country: string | null;
  length_km: number;
  corners: number | null;
  tire_wear_level: string | null;
  fuel_estimate_hypercar: number | null;
  fuel_estimate_lmp2: number | null;
  fuel_estimate_gte: number | null;
  avg_lap_seconds_hypercar: number | null;
  best_overtaking_spots: string | null;
  danger_zones: string | null;
  tips: string | null;
}

export const TrackDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("tracks").select("*").eq("id", id).maybeSingle();
      setTrack(data);
      setLoading(false);
    })();
  }, [id]);

  const submitSuggestion = async () => {
    if (!user) { toast({ title: "Sign in to suggest edits" }); return; }
    if (suggestion.trim().length < 10) { toast({ title: "Please add more detail" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("track_suggestions").insert({
      user_id: user.id,
      track_id: id,
      proposed_changes: { note: suggestion } as Record<string, unknown>,
      note: suggestion,
    });
    setSubmitting(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Thanks! Suggestion sent for review." }); setSuggestion(""); }
  };

  if (loading) return <div className="container py-12 text-center text-muted-foreground font-mono">Loading...</div>;
  if (!track) return <div className="container py-12 text-center">Track not found.</div>;

  return (
    <div className="container py-8 md:py-12 animate-fade-in max-w-5xl">
      <Link to="/tracks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All tracks
      </Link>

      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-primary mb-2">
          <Flag className="h-3.5 w-3.5" /> {track.country}
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">{track.name}</h1>
        <div className="flex flex-wrap gap-3">
          <Stat label="Length" value={`${track.length_km} km`} />
          <Stat label="Corners" value={track.corners?.toString() ?? "—"} />
          <Stat label="Tire wear" value={track.tire_wear_level ?? "—"} />
          {track.avg_lap_seconds_hypercar && <Stat label="Pace (Hypercar)" value={`${track.avg_lap_seconds_hypercar}s`} />}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Fuel className="h-5 w-5 text-primary" />Fuel per lap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono">
            <FuelRow label="Hypercar" value={track.fuel_estimate_hypercar} />
            <FuelRow label="LMP2" value={track.fuel_estimate_lmp2} />
            <FuelRow label="GTE" value={track.fuel_estimate_gte} />
          </CardContent>
        </Card>

        {track.tips && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Lightbulb className="h-5 w-5 text-primary" />Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{track.tips}</p>
            </CardContent>
          </Card>
        )}

        {track.best_overtaking_spots && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-success" />Overtaking spots</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{track.best_overtaking_spots}</p></CardContent>
          </Card>
        )}

        {track.danger_zones && (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5 text-destructive" />Danger zones</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{track.danger_zones}</p></CardContent>
          </Card>
        )}
      </div>

      {/* Suggest edit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><MessageSquarePlus className="h-5 w-5 text-primary" />Suggest a correction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Spotted wrong fuel data? Got a better tip? Send it in and we'll review it.</p>
          <Textarea
            placeholder={user ? "Your suggestion..." : "Sign in to send suggestions"}
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
            disabled={!user}
            rows={4}
          />
          <Button onClick={submitSuggestion} disabled={!user || submitting}>
            {submitting ? "Sending..." : "Send suggestion"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-border bg-card px-4 py-2.5">
    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-mono font-bold text-base">{value}</div>
  </div>
);
const FuelRow = ({ label, value }: { label: string; value: number | null }) => (
  <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="font-bold">{value ? `${value} L` : "—"}</span>
  </div>
);

export default TrackDetail;
