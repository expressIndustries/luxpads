import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import {
  buildEmailVerifiedRelativePath,
  sanitizeEmailVerificationRedirect,
} from "@/lib/email-verification";
import { publicOriginForServer } from "@/lib/seo";

const COOKIE = "luxpads_post_verify";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function PostVerifyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  const path = sanitizeEmailVerificationRedirect(sp.next ?? "/account");
  const redirectTo = buildEmailVerifiedRelativePath(path);

  if (!raw?.trim()) {
    redirect("/login?verify=session");
  }

  const returned = await signIn("credentials", {
    postVerifyToken: raw.trim(),
    redirectTo,
    redirect: false,
  });

  const loc = typeof returned === "string" ? returned : "";
  let failed = !loc.trim();
  if (!failed) {
    try {
      failed = Boolean(new URL(loc, publicOriginForServer()).searchParams.get("error"));
    } catch {
      failed = true;
    }
  }
  if (failed) {
    redirect("/login?verify=session");
  }

  redirect(redirectTo);
}
