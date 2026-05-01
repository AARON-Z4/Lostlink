import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, Sparkles, ShieldCheck, MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LostLink — Lost & Found, reimagined" },
      { name: "description", content: "Report lost or found items, get smart matches, and reclaim what's yours with QR-secured handoffs." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div>
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-foreground">
              <Sparkles className="h-3 w-3" /> Smart matching · QR-secured handoffs
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Reunite people with <span className="text-gradient-gold">what matters.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              LostLink is the premium lost & found platform for cities, campuses, and venues.
              Report, browse, match, and reclaim — securely.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="xl" variant="premium" asChild>
                <Link to="/auth/register">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/items/browse">Browse items</Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">No credit card required · Free for individuals</p>
          </div>

          {/* Feature strip */}
          <div className="mt-20 grid gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: "Smart matching", body: "We surface lost ↔ found candidates by category, location, time, and keywords." },
              { icon: QrCode, title: "QR-secured tags", body: "Print a QR for valuables. Finders scan to start a verified return — privately." },
              { icon: ShieldCheck, title: "Trusted claims", body: "Owners verify claims before any handoff. Audit trail included." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-elegant transition-transform hover:-translate-y-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gradient-emerald">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl gradient-emerald px-8 py-12 text-primary-foreground shadow-elegant md:px-16 md:py-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/30 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">Lost something? Found something?</h2>
              <p className="mt-3 max-w-md text-primary-foreground/80">Post in under a minute. We'll handle the rest with smart matches and secure messaging.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button variant="gold" size="lg" asChild><Link to="/report/lost"><MapPin className="mr-2 h-4 w-4" />Report lost</Link></Button>
              <Button variant="outline" size="lg" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link to="/report/found">Report found</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} LostLink. Crafted with care.</p>
          <div className="flex gap-6">
            <Link to="/items/browse" className="hover:text-foreground">Browse</Link>
            <Link to="/auth/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
