import { processMailgunInbound } from "@/lib/mailgun/process-inbound";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Mailgun inbound (Routes / forward) webhook.
 * Configure in Mailgun: match recipient `reply+*@mail.luxpads.co` → POST this URL.
 * This Next.js app hosts the webhook (not PHP)—same DB as the rest of LuxPads.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const result = await processMailgunInbound(form);
    if (!result.ok) {
      return new Response(result.body, {
        status: result.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("[mailgun:inbound]", e);
    return new Response("Internal error", { status: 500 });
  }
}

export function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
