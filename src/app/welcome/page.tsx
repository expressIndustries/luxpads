import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WelcomeClient } from "./welcome-client";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ email_verified?: string; dest?: string; upgrade?: string }>;
};

export default async function WelcomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/welcome");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { welcomeCompletedAt: true, role: true },
  });

  const upgradeOnly = sp.upgrade === "1";
  if (upgradeOnly && (user?.role === Role.owner || user?.role === Role.admin)) {
    redirect("/dashboard");
  }

  if (user?.welcomeCompletedAt && !upgradeOnly) {
    if (user.role === Role.owner || user.role === Role.admin) {
      redirect("/dashboard");
    }
    redirect("/");
  }

  const dest = typeof sp.dest === "string" && sp.dest.startsWith("/listing/") ? sp.dest.slice(0, 512) : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <WelcomeClient
        upgradeOnly={upgradeOnly}
        dest={dest}
        emailVerifiedBanner={sp.email_verified === "1"}
      />
    </div>
  );
}
