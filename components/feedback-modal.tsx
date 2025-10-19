"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiFetch } from "@/lib/api";

interface FeedbackModalProps {
  pagePath: string;
  userId?: string;
  /** Open initially after submit */
  forceOpen?: boolean;
  /** Kept for compatibility; navigation is already gated on pages */
  blocking?: boolean;
  /** Called once submission succeeds */
  onSubmitted?: () => void;
}

export default function FeedbackModal({
  pagePath,
  userId,
  forceOpen = false,
  /* eslint-disable @typescript-eslint/no-unused-vars */
  blocking = false,
  /* eslint-enable @typescript-eslint/no-unused-vars */
  onSubmitted,
}: FeedbackModalProps) {
  const [open, setOpen] = useState(!!forceOpen);
  const [rating, setRating] = useState<string>("5");
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  async function submit() {
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const payload = { page: pagePath, rating: Number(rating), comment, userId };
      await apiFetch("/feedback", { method: "POST", body: JSON.stringify(payload) });
      setSubmittedOnce(true);
      setSuccess("Thanks for your feedback!");
      setComment("");
      setRating("5");
      if (onSubmitted) onSubmitted();
      setTimeout(() => setOpen(false), 400);
    } catch (e) {
      setError("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate this page</DialogTitle>
          <DialogDescription>Your feedback helps us improve.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <RadioGroup value={rating} onValueChange={setRating} className="flex items-center gap-3">
              {["1","2","3","4","5"].map(v => (
                <div key={v} className="flex items-center space-x-2">
                  <RadioGroupItem id={"rating-"+v} value={v} />
                  <Label htmlFor={"rating-"+v}>{v}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb-comment">Comment (optional)</Label>
            <Textarea id="fb-comment" placeholder="Tell us what worked great or what could be better…" value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          {success && <p className="text-green-600 text-sm">{success}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <DialogFooter className="flex flex-col gap-2">
          {!submittedOnce ? (
            <Button onClick={submit} disabled={submitting} className="w-full">{submitting ? "Sending…" : "Submit feedback"}</Button>
          ) : (
            <Button onClick={() => setOpen(false)} className="w-full">Continue</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
