"use client";

import { addDays, endOfMonth, format, isBefore } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitInquiry, type InquiryState } from "@/lib/actions/inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarketplaceDisclaimer } from "@/components/marketplace-disclaimer";
import { TurnstileField, turnstileConfigured } from "@/components/security/turnstile-field";
import { gaEvent } from "@/lib/gtag";

const initial: InquiryState = {};

function parseLocalYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

/** Move checkout into check-in’s calendar month, keeping day-of-month when valid; ensure checkout is not before check-in. */
function alignCheckOutToCheckInMonth(checkInStr: string, checkOutStr: string): string {
  const cin = parseLocalYmd(checkInStr);
  const cout = parseLocalYmd(checkOutStr);
  if (!cin || !cout) return checkOutStr;

  const y = cin.getFullYear();
  const m = cin.getMonth();
  const lastDom = endOfMonth(cin).getDate();
  const targetDom = Math.min(cout.getDate(), lastDom);
  let next = new Date(y, m, targetDom);
  if (isBefore(next, cin)) {
    next = addDays(cin, 1);
  }
  return format(next, "yyyy-MM-dd");
}

function SubmitRow() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : "Send inquiry"}
    </Button>
  );
}

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}…@${domain}`;
}

export function InquiryForm({
  listingSlug,
  messagingAs,
}: {
  listingSlug: string;
  messagingAs: { name: string; email: string };
}) {
  const [state, formAction] = useFormState(submitInquiry, initial);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const inquiryTracked = useRef(false);

  useEffect(() => {
    if (!state.ok || inquiryTracked.current) return;
    inquiryTracked.current = true;
    gaEvent("renter_inquiry_sent", {
      listing_slug: listingSlug,
      is_new_thread: state.is_new_thread ?? true,
    });
  }, [state.ok, state.is_new_thread, listingSlug]);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-sm text-emerald-950">
        <p className="font-medium">Inquiry sent</p>
        <p className="mt-2 text-emerald-900/90">
          The homeowner can reply here on LuxPads and you will be notified by email. Open Messages in your account to
          continue the thread. Final agreements and payments stay between you and the owner.
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);
    if (turnstileConfigured() && !turnstileToken?.trim()) {
      setClientError("Please complete the security check.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("listingSlug", listingSlug);
    if (turnstileToken?.trim()) {
      fd.set("cf-turnstile-response", turnstileToken);
    }
    formAction(fd);
  }

  return (
    <div className="space-y-6">
      <MarketplaceDisclaimer />
      <p className="text-xs text-stone-600">
        Messaging as <span className="font-medium text-stone-800">{messagingAs.name}</span> (
        {redactEmail(messagingAs.email)}). The owner sees the name on your account.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="listingSlug" value={listingSlug} />
        <div className="hidden" aria-hidden>
          <label>
            Website
            <input name="website" autoComplete="off" tabIndex={-1} className="hidden" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="renterPhone">Phone (optional)</Label>
            <Input id="renterPhone" name="renterPhone" type="tel" placeholder="+1 …" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestCount">Guests</Label>
            <Input id="guestCount" name="guestCount" type="number" min={1} max={50} placeholder="4" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="checkIn">Check-in</Label>
            <Input
              id="checkIn"
              name="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                setCheckOut((prev) => (v && prev ? alignCheckOutToCheckInMonth(v, prev) : prev));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut">Check-out</Label>
            <Input
              id="checkOut"
              name="checkOut"
              type="date"
              value={checkOut}
              min={checkIn || undefined}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message to owner</Label>
          <Textarea
            id="message"
            name="message"
            required
            minLength={10}
            placeholder="Share dates, purpose of stay, and any screening details the homeowner should know."
          />
        </div>
        <TurnstileField action="listing_inquiry" onToken={setTurnstileToken} />
        {clientError ? <p className="text-sm text-red-600">{clientError}</p> : null}
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <SubmitRow />
      </form>
    </div>
  );
}
