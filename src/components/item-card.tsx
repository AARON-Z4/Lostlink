import { Link } from "@tanstack/react-router";
import type { Item } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  lost: "bg-destructive/10 text-destructive border-destructive/20",
  found: "bg-success/15 text-success border-success/30",
  claimed: "bg-gold/20 text-gold-foreground border-gold/30",
  returned: "bg-primary/10 text-primary border-primary/20",
};

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to="/items/$id" params={{ id: item.id }} className="group block">
      <Card className="overflow-hidden border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <Badge variant="outline" className={`capitalize backdrop-blur-md ${statusStyles[item.status]}`}>
              {item.status}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="truncate font-display text-base font-semibold">{item.title}</h3>
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location.split(",")[0]}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(item.date), "MMM d")}</span>
          </div>
          <div className="mt-3 inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.category}
          </div>
        </div>
      </Card>
    </Link>
  );
}
