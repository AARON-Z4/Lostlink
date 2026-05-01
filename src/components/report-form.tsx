/**
 * src/components/report-form.tsx
 * Fully wired to real backend:
 *  - useReportLost / useReportFound hooks (POST /items/lost, /items/found)
 *  - useImageUpload for Supabase Storage upload via backend
 *  - ImageUploader component with preview + progress bar
 *
 * In mock mode: stores locally via Zustand + URL.createObjectURL for preview.
 */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useReportLost, useReportFound } from "@/hooks/useItems";
import { ImageUploader } from "@/components/image-uploader";
import { CATEGORIES, type ItemStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ReportForm({ kind }: { kind: "lost" | "found" }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { mutate: reportLost, isPending: lostPending } = useReportLost();
  const { mutate: reportFound, isPending: foundPending } = useReportFound();
  const isPending = lostPending || foundPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("You must be logged in"); return; }
    if (!category) { toast.error("Please select a category"); return; }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category as (typeof CATEGORIES)[number],
      location: location.trim(),
      date: new Date(date).toISOString(),
      image: imageFile,   // File | null — service builds FormData
    };

    const mutate = kind === "lost" ? reportLost : reportFound;

    mutate(payload, {
      onSuccess: (created) => {
        toast.success(kind === "lost" ? "Lost item reported" : "Found item reported");
        navigate({ to: "/items/$id", params: { id: created.id } });
      },
      onError: (err: any) => toast.error(err?.message ?? "Could not submit report"),
    });
  };

  const isLost = kind === "lost";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isLost ? "Report a lost item" : "Report a found item"}
        description={
          isLost
            ? "Add details so we can find a possible match for you."
            : "Help return this item to its owner. Add what you remember."
        }
      />
      <Card className="p-6 md:p-8">
        <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black leather wallet"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Distinctive details, contents, color, brand…"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="loc">Location</Label>
            <Input
              id="loc"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Library, 2nd floor"
            />
          </div>

          {/* Image upload with preview + progress */}
          <div className="space-y-2 md:col-span-2">
            <Label>Image <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <ImageUploader
              onUploaded={(url) => {
                // In live mode, backend returns the Supabase URL.
                // We don't need to do anything here — the File is already in imageFile.
                // This callback is only used to show a success toast.
              }}
              onFileSelected={(file) => setImageFile(file)}
              maxSizeMB={5}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/dashboard/overview" })}
            >
              Cancel
            </Button>
            <Button type="submit" variant="premium" disabled={isPending}>
              {isPending ? "Submitting…" : "Submit report"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
