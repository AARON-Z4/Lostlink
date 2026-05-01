/**
 * src/routes/items.browse.tsx
 * Updated: uses useItems React Query hook with loading skeleton.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useItems } from "@/hooks/useItems";
import { CATEGORIES, type Item } from "@/lib/types";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ItemCard } from "@/components/item-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/items/browse")({ component: Browse });

function Browse() {
  const { data, isLoading, isError } = useItems();
  const items = data?.items ?? [];

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");

  const locations = useMemo(
    () => Array.from(new Set(items.map((i: Item) => i.location.split(",")[0]))),
    [items],
  );

  const filtered = items.filter((i) => {
    if (q && !(`${i.title} ${i.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (category !== "all" && i.category !== category) return false;
    if (status !== "all" && i.status !== status) return false;
    if (location !== "all" && !i.location.startsWith(location)) return false;
    return true;
  });

  const reset = () => { setQ(""); setCategory("all"); setStatus("all"); setLocation("all"); };

  return (
    <div>
      <PageHeader title="Browse items" description="Search lost & found items reported by the community." />

      <div className="mb-6 grid gap-3 rounded-2xl border bg-card p-4 shadow-elegant md:grid-cols-12">
        <div className="relative md:col-span-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or description…" className="pl-9" />
        </div>
        <div className="md:col-span-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="found">Found</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={reset} className="md:col-span-1"><X className="mr-1 h-4 w-4" />Reset</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Could not load items" description="Please check your connection and try again." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try adjusting your filters or search terms." />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((i) => <ItemCard key={i.id} item={i} />)}
          </div>
        </>
      )}
    </div>
  );
}
