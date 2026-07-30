import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const notifySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Enter your full name." })
    .max(100, { message: "Name must be under 100 characters." }),
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email address." })
    .max(255, { message: "Email must be under 255 characters." }),
  phone: z
    .string()
    .trim()
    .min(9, { message: "Enter a valid phone number." })
    .max(20, { message: "Phone must be under 20 characters." }),
});

type NotifyErrors = Partial<Record<"fullName" | "email" | "phone", string>>;

interface NotifyMeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  /** Room or variant identity being waited on. */
  roomId: string;
  roomName: string;
}

/** Waitlist capture for sold-out rooms. Available to guests without an account. */
export function NotifyMeModal({
  open,
  onOpenChange,
  hotelId,
  roomId,
  roomName,
}: NotifyMeModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<NotifyErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = notifySchema.safeParse({ fullName, email, phone });
    if (!parsed.success) {
      const next: NotifyErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof NotifyErrors;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.from("room_notifications").insert({
      hotel_id: hotelId,
      room_id: roomId,
      room_name: roomName,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
    setSubmitting(false);

    if (error) {
      toast.error("We could not save your request. Please try again.");
      return;
    }

    toast.success(`We'll let you know as soon as ${roomName} is available.`);
    setFullName("");
    setEmail("");
    setPhone("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Notify me when available</DialogTitle>
          <DialogDescription>
            {roomName} is sold out for your dates. Leave your details and we will contact you the
            moment it opens up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="notify-name">Full name</Label>
            <Input
              id="notify-name"
              value={fullName}
              maxLength={100}
              autoComplete="name"
              onChange={(event) => setFullName(event.target.value)}
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && <p className="text-xs text-nbc-scarlet">{errors.fullName}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notify-email">Email address</Label>
            <Input
              id="notify-email"
              type="email"
              value={email}
              maxLength={255}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-nbc-scarlet">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notify-phone">Phone number</Label>
            <Input
              id="notify-phone"
              type="tel"
              value={phone}
              maxLength={20}
              autoComplete="tel"
              placeholder="+255 700 000 000"
              onChange={(event) => setPhone(event.target.value)}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="text-xs text-nbc-scarlet">{errors.phone}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="scarlet" disabled={submitting}>
              {submitting ? "Sending…" : "Notify Me"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
