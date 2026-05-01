/**
 * src/routes/items.$id.tsx
 * Updated: uses useItem + useItemMatches React Query hooks.
 * Claim submission uses item_id (snake_case) to match real backend.
 */
import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useItem, useItemMatches } from "@/hooks/useItems";
import { useSubmitClaim } from "@/hooks/useClaims";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, MapPin, Hand, QrCode, Sparkles, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ItemCard } from "@/components/item-card";

export const Route = createFileRoute("/items/$id")({
  component: ItemDetails,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="font-display text-2xl font-semibold">Item not found</h1>
      <Button asChild className="mt-4" variant="premium"><Link to="/items/browse">Browse items</Link></Button>
    </div>
  ),
});

function ItemDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: item, isLoading, isError } = useItem(id);
  const { data: matchesData } = useItemMatches(id, !!item);
  const { mutate: submitClaim, isPending: claimPending } = useSubmitClaim();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) throw notFound();

  const matches = Array.isArray(matchesData)
    ? matchesData.map((m: any) => ({ item: m.item, score: m.score }))
    : [];

  const handleSubmitClaim = () => {
    if (!user) { navigate({ to: "/auth/login" }); return; }
    if (!message.trim()) { toast.error("Please describe why this is yours"); return; }

    submitClaim(
      {
        item_id: item.id,           // real backend uses item_id
        message: message.trim(),
        itemTitle: item.title,
        itemImage: item.image,
        claimantName: user.name,
        ownerId: item.reportedBy,
      },
      {
        onSuccess: () => {
          toast.success("Claim submitted");
          setOpen(false);
          setMessage("");
          navigate({ to: "/dashboard/claims" });
        },
        onError: (err: any) => toast.error(err?.message ?? "Could not submit claim"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover" />
        </Card>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize border-accent/30 bg-accent/10 text-accent-foreground">
              {item.status}
            </Badge>
            <Badge variant="outline">{item.category}</Badge>
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{item.title}</h1>
          <p className="mt-3 text-muted-foreground">{item.description}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={MapPin} label="Location" value={item.location} />
            <Info icon={Calendar} label="Date" value={format(new Date(item.date), "PPP")} />
            <Info icon={UserIcon} label="Reported by" value={item.reporterName} />
            <Info icon={Sparkles} label="Status" value={item.status.charAt(0).toUpperCase() + item.status.slice(1)} />
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="premium" size="lg" disabled={user?.id === item.reportedBy}>
                  <Hand className="mr-2 h-4 w-4" />Claim this item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Claim "{item.title}"</DialogTitle>
                  <DialogDescription>Describe distinctive details so the owner can verify it's yours.</DialogDescription>
                </DialogHeader>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="e.g. There's a small scratch on the back and a pink sticker inside…"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button variant="premium" onClick={handleSubmitClaim} disabled={claimPending}>
                    {claimPending ? "Submitting…" : "Submit claim"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="lg" asChild>
              <Link to="/qr/generate" search={{ id: item.id } as never}>
                <QrCode className="mr-2 h-4 w-4" />QR for this item
              </Link>
            </Button>
          </div>
          {user?.id === item.reportedBy && (
            <p className="mt-3 text-xs text-muted-foreground">You reported this item.</p>
          )}
        </div>
      </div>

      {/* Matches */}
      <section className="mt-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Possible matches</h2>
          <span className="text-sm text-muted-foreground">
            {matches.length} suggestion{matches.length === 1 ? "" : "s"}
          </span>
        </div>
        {matches.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No matches yet — we'll notify you when one appears.
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.slice(0, 6).map((m: any) => (
              <div key={m.item?.id ?? m.id} className="relative">
                <div className="absolute -top-2 left-3 z-10 inline-flex items-center gap-1 rounded-full gradient-gold px-2.5 py-0.5 text-[10px] font-bold text-gold-foreground shadow-gold-glow">
                  <Sparkles className="h-3 w-3" />{m.score}% match
                </div>
                <ItemCard item={m.item ?? m} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
