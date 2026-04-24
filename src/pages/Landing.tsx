import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Fuel, Map, Bot, Trophy, ArrowRight, Gauge, Zap, Users } from "lucide-react";

export const Landing = () => {
  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-primary">Le Mans Ultimate · Race Engineer</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] mb-6">
              Plan your race.<br />
              <span className="gradient-text">Win the stint.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              The race engineer toolkit for Le Mans Ultimate. Calculate fuel, plan pit windows, study every track, and share strategies with your community — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="text-base h-12 px-8 animate-pulse-glow">
                <Link to="/calculator">
                  <Fuel className="h-5 w-5" /> Open the calculator <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base h-12 px-8">
                <Link to="/tracks"><Map className="h-5 w-5" /> Browse tracks</Link>
              </Button>
            </div>

            {/* Stat strip */}
            <div className="mt-12 grid grid-cols-3 max-w-lg gap-6 border-t border-border pt-6">
              <Stat value="12" label="Tracks" />
              <Stat value="3" label="Car classes" />
              <Stat value="∞" label="Strategies" />
            </div>
          </div>
        </div>

        {/* Checkered flag strip at bottom */}
        <div className="checkered absolute bottom-0 left-0 right-0 h-2 opacity-20" />
      </section>

      {/* FEATURES */}
      <section className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3">/ Features</div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Built for the cockpit.</h2>
          <p className="text-muted-foreground">Everything a sim racer needs to prepare, execute and improve — without spreadsheets.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature icon={<Fuel />} title="Fuel & Pit Calculator" desc="Optimal stint plans, fuel curves and Safety Car backup strategies. Toggle aggressive vs safe." live />
          <Feature icon={<Map />} title="Track database" desc="12 LMU tracks with fuel estimates, lap times, overtaking spots and danger zones." live />
          <Feature icon={<Gauge />} title="Saved strategies" desc="Sign in and save every race plan. Reuse them, refine them, share them." live />
          <Feature icon={<Trophy />} title="Leaderboards" desc="Upload laptimes, rank by consistency, compare with friends." soon />
          <Feature icon={<Users />} title="Setup sharing" desc="Upload setups tagged by track/car/conditions. Rated by the community." soon />
          <Feature icon={<Bot />} title="Discord bot" desc="Run !fuelcalc, !track and !setup directly in Discord. Synced with your profile." soon />
        </div>
      </section>

      {/* CTA strip */}
      <section className="container pb-20">
        <div className="rounded-2xl border border-primary/30 p-8 md:p-14 text-center relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 grid-bg opacity-10" />
          <div className="relative">
            <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Ready for green flag?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              No spreadsheets. No guesswork. Just open the calculator and start planning your next race.
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link to="/calculator">Launch calculator <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="font-display font-bold text-3xl text-primary">{value}</div>
    <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
  </div>
);

const Feature = ({ icon, title, desc, live, soon }: { icon: React.ReactNode; title: string; desc: string; live?: boolean; soon?: boolean }) => (
  <div className="group rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-all hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div className="h-11 w-11 rounded-md bg-primary/10 text-primary flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      {live && <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary border border-primary/40 px-2 py-0.5 rounded">Live</span>}
      {soon && <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground border border-border px-2 py-0.5 rounded">Soon</span>}
    </div>
    <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

export default Landing;
