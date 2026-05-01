/**
 * src/routes/qr.generate.tsx
 * Updated: calls POST /qr/:itemId to register the QR token on backend.
 * Falls back to local URL if in mock mode.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { useItems } from "@/hooks/useItems";
import { qrService } from "@/services/qr.service";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const Route = createFileRoute("/qr/generate")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  component: QRGenerate,
});

function QRGenerate() {
  const { id: presetId } = Route.useSearch();
  const { data: itemsData } = useItems();
  const items = itemsData?.items ?? [];
  const [selectedId, setSelectedId] = useState(presetId ?? items[0]?.id ?? "");
  const [label, setLabel] = useState("If found, please scan");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const item = items.find((i: any) => i.id === selectedId);

  // Fallback URL (used in mock mode or before the token is generated)
  const localUrl = typeof window !== "undefined"
    ? `${window.location.origin}/items/${selectedId}`
    : `/items/${selectedId}`;

  const displayUrl = qrUrl ?? localUrl;

  const { mutate: generateToken, isPending } = useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return { url: localUrl, itemId: id, token: "mock", expiresAt: "" };
      return qrService.generate(id);
    },
    onSuccess: (data) => {
      setQrUrl(data.url);
      toast.success("QR token registered with backend.");
    },
    onError: () => toast.error("Could not generate QR token — using local URL."),
  });

  const download = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `lostlink-${selectedId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="QR tags" description="Generate a printable QR code for any item. Finders scan it to start a secure return." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item</Label>
              <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setQrUrl(null); }}>
                <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                <SelectContent>
                  {items.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tag label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground break-all">
              <span className="font-medium text-foreground">URL:</span> {displayUrl}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => selectedId && generateToken(selectedId)}
                disabled={!item || isPending}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                {qrUrl ? "Refresh token" : "Register QR"}
              </Button>
              <Button variant="premium" onClick={download} disabled={!item}>
                <Download className="mr-2 h-4 w-4" />Download PNG
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex items-center justify-center p-6">
          {item ? (
            <div ref={containerRef} className="w-full max-w-xs rounded-2xl border bg-background p-6 text-center shadow-elegant">
              <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-foreground">LostLink</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              <div className="my-4 flex justify-center">
                <QRCodeCanvas value={displayUrl} size={200} bgColor="#ffffff" fgColor="#064e3b" includeMargin />
              </div>
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-[10px] text-muted-foreground">Scan to verify · Secure handoff</p>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <QrCode className="mx-auto mb-2 h-8 w-8" />Select an item to preview the QR.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
