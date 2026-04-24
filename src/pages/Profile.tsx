import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Trash2, Fuel, Flag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SavedStrategy {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  results: { totalLaps?: number; pitStops?: number; totalFuel?: number };
  created_at: string;
}

export const Profile = () => {
  const { user, loading } = useAuth();
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("saved_strategies").select("id,name,inputs,results,created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      ]);
      setStrategies((s ?? []) as unknown as SavedStrategy[]);
      setDisplayName(p?.display_name ?? "");
    })();
  }, [user]);

  if (loading) return <div className="container py-12 text-center font-mono text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const deleteStrategy = async (id: string) => {
    const { error } = await supabase.from("saved_strategies").delete().eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { setStrategies(prev => prev.filter(s => s.id !== id)); toast({ title: "Deleted" }); }
  };

  return (
    <div className="container py-8 md:py-12 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <div className="h-16 w-16 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <UserIcon className="h-7 w-7 text-primary" />
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-1">Driver Profile</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">{displayName || user.email}</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Fuel className="h-5 w-5 text-primary" /> Saved strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {strategies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No strategies saved yet.</p>
              <Button asChild><Link to="/calculator">Create your first strategy</Link></Button>
            </div>
          ) : (
            <div className="space-y-2">
              {strategies.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-md border border-border bg-secondary/30 hover:border-primary/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{s.name}</div>
                    <div className="flex gap-4 mt-1 text-xs font-mono text-muted-foreground">
                      <span><Flag className="inline h-3 w-3 mr-1" />{s.results?.totalLaps ?? "—"} laps</span>
                      <span><Fuel className="inline h-3 w-3 mr-1" />{s.results?.pitStops ?? "—"} stops</span>
                      <span>{s.results?.totalFuel?.toFixed(1) ?? "—"} L</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteStrategy(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
