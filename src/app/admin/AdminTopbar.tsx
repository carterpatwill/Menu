"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", match: (p: string) => p === "/admin" },
  { href: "/admin/menu", label: "Menu", match: (p: string) => p.startsWith("/admin/menu") },
  { href: "/admin/tags", label: "Tags", match: (p: string) => p.startsWith("/admin/tags") },
  { href: "/admin/analytics", label: "Analytics", match: (p: string) => p.startsWith("/admin/analytics") },
  { href: "/admin/reviews", label: "Reviews", match: (p: string) => p.startsWith("/admin/reviews") },
];

interface Props {
  restaurantName: string;
  initials: string;
  signOut: () => void | Promise<void>;
}

export function AdminTopbar({ restaurantName, initials, signOut }: Props) {
  const pathname = usePathname() ?? "";
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark display">T</div>
        <span className="brand-name display">Tappi</span>
      </div>
      <nav className="nav">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={n.match(pathname) ? "active" : ""}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="account">
        <div className="acct-chip">
          <div className="avatar">{initials}</div>
          <div>
            <div className="acct-name">{restaurantName}</div>
            <div className="acct-role">Owner</div>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="signout">Sign out</button>
        </form>
      </div>
    </header>
  );
}
