import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UnreadMessagesIcon } from "@/components/dashboard/unread-messages-icon";
import { countOwnerUnreadGuestMessages } from "@/lib/queries/owner-unread-messages";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/listings", label: "Listings" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/account", label: "Account" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "admin") redirect("/admin");

  const unreadGuestMessages = await countOwnerUnreadGuestMessages(session.user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
      <aside className="lg:w-56 lg:shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Owner hub</p>
        <nav className="mt-4 flex flex-col gap-2">
          {links.map((l) => {
            const showUnread = l.href === "/dashboard/messages" && unreadGuestMessages > 0;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-label={showUnread ? `${l.label}, ${unreadGuestMessages} unread from guests` : undefined}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900"
              >
                {showUnread ? <UnreadMessagesIcon className="text-amber-600" /> : null}
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
