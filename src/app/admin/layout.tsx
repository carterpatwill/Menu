import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminTopbar } from "./AdminTopbar";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const styleSheet = () => `
:root {
  --paper: #F0F4F8;
  --surface: #FFFFFF;
  --surface-2: #E2EAF4;
  --ink: #0D1B2E;
  --ink-soft: #4A6080;
  --ink-faint: #8096B0;
  --line: #D0DCE8;
  --shadow: 0 1px 2px rgba(13,27,46,0.05);
  --shadow-lift: 0 12px 30px -12px rgba(13,27,46,0.20);
  --accent: #0057D9;
  --accent-soft: #D6E4FF;
  --positive: #1A7F5A;
  --negative: #C53030;
  --star: #C98A00;
}
.tappi-admin { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif; color: var(--ink); background: var(--paper); min-height: 100vh; position: relative; -webkit-font-smoothing: antialiased; line-height: 1.5; background-image: radial-gradient(1100px 500px at 85% -10%, rgba(0,87,217,0.06), transparent 60%), radial-gradient(900px 500px at -5% 0%, rgba(26,127,90,0.04), transparent 55%); }
.tappi-admin a { color: inherit; text-decoration: none; }
.tappi-admin .display { font-family: 'Libre Baskerville', Georgia, serif; }

.tappi-admin .topbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 32px; padding: 0 48px; height: 64px; background: rgba(240,244,248,0.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.tappi-admin .brand { display: flex; align-items: center; gap: 12px; }
.tappi-admin .brand-mark { width: 30px; height: 30px; border-radius: 8px; background: var(--accent); display: grid; place-items: center; color: #fff; font-weight: 600; font-size: 17px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18); }
.tappi-admin .brand-name { font-weight: 600; font-size: 19px; letter-spacing: -0.01em; }
.tappi-admin .nav { display: flex; align-items: center; gap: 4px; margin-left: 16px; }
.tappi-admin .nav a { padding: 8px 14px; border-radius: 999px; font-size: 14.5px; font-weight: 400; color: var(--ink-soft); transition: color .15s ease, background .15s ease; }
.tappi-admin .nav a:hover { color: var(--ink); background: rgba(13,27,46,0.04); }
.tappi-admin .nav a.active { color: var(--ink); background: var(--surface); box-shadow: var(--shadow); border: 1px solid var(--line); }
.tappi-admin .account { margin-left: auto; display: flex; align-items: center; gap: 16px; }
.tappi-admin .acct-chip { display: flex; align-items: center; gap: 12px; }
.tappi-admin .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--positive); color: #fff; display: grid; place-items: center; font-weight: 600; font-size: 13px; }
.tappi-admin .acct-name { font-size: 14px; font-weight: 600; line-height: 1.1; }
.tappi-admin .acct-role { font-size: 12px; font-weight: 300; color: var(--ink-faint); }
.tappi-admin .signout { font-size: 13.5px; font-weight: 400; color: var(--ink-soft); padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); transition: all .15s ease; font-family: inherit; cursor: pointer; }
.tappi-admin .signout:hover { color: var(--ink); border-color: var(--ink-faint); }

.tappi-admin .wrap { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; padding: 48px 48px 80px; }
.tappi-admin .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
.tappi-admin .greeting { font-weight: 700; font-size: 32px; letter-spacing: -0.02em; margin: 0; }
.tappi-admin .subhead { color: var(--ink-soft); font-size: 14.5px; font-weight: 300; margin: 6px 0 0; }
.tappi-admin .back-link { display: inline-block; margin-bottom: 4px; font-size: 13px; font-weight: 300; color: var(--ink-faint); transition: color .15s ease; }
.tappi-admin .back-link:hover { color: var(--ink-soft); }

.tappi-admin .btn-primary { background: var(--accent); color: #fff; border: none; padding: 11px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: transform .12s ease, filter .15s ease; box-shadow: 0 6px 16px -8px rgba(0,87,217,0.4); font-family: inherit; text-decoration: none; }
.tappi-admin .btn-primary:hover { filter: brightness(1.04); transform: translateY(-1px); }
.tappi-admin .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; filter: none; }
.tappi-admin .btn-ghost { background: var(--surface); color: var(--ink-soft); border: 1px solid var(--line); padding: 9px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 400; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: border-color .15s ease, color .15s ease; font-family: inherit; text-decoration: none; }
.tappi-admin .btn-ghost:hover { color: var(--ink); border-color: var(--ink-faint); }
.tappi-admin .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
.tappi-admin .btn-danger { background: var(--surface); color: var(--ink-soft); border: 1px solid var(--line); padding: 9px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 400; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all .15s ease; font-family: inherit; }
.tappi-admin .btn-danger:hover { color: var(--negative); border-color: var(--negative); }
.tappi-admin .btn-danger-solid { background: var(--negative); color: #fff; border: none; padding: 9px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
.tappi-admin .btn-danger-solid:hover { filter: brightness(1.05); }
.tappi-admin .icon-btn { width: 32px; height: 32px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--ink-soft); cursor: pointer; display: inline-grid; place-items: center; transition: all .15s ease; }
.tappi-admin .icon-btn:hover { color: var(--ink); border-color: var(--ink-faint); }

.tappi-admin .panel { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 24px; box-shadow: var(--shadow); }
.tappi-admin .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 12px; flex-wrap: wrap; }
.tappi-admin .panel-title { font-weight: 400; font-size: 18px; margin: 0; letter-spacing: -0.01em; }
.tappi-admin .panel-link { font-size: 13px; font-weight: 600; color: var(--accent); }
.tappi-admin .panel-link:hover { text-decoration: underline; }

.tappi-admin .card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 24px; box-shadow: var(--shadow); transition: transform .14s ease, box-shadow .18s ease, border-color .18s ease; cursor: pointer; display: block; }
.tappi-admin .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lift); border-color: #BCCDE0; }
.tappi-admin .card-icon { width: 42px; height: 42px; border-radius: 11px; background: var(--accent-soft); color: var(--accent); display: grid; place-items: center; margin-bottom: 16px; }
.tappi-admin .card-title { font-weight: 400; font-size: 17px; margin: 0 0 4px; }
.tappi-admin .card-count { font-size: 13.5px; font-weight: 300; color: var(--ink-soft); }
.tappi-admin .card-count strong { color: var(--ink); font-weight: 600; }

.tappi-admin .section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); margin: 0 0 16px; }

.tappi-admin .field-label { display: block; font-size: 13px; font-weight: 600; color: var(--ink-soft); margin-bottom: 6px; }
.tappi-admin .input { width: 100%; padding: 10px 14px; background: var(--surface); color: var(--ink); border: 1px solid var(--line); border-radius: 10px; font-family: inherit; font-size: 14px; transition: border-color .15s ease, box-shadow .15s ease; box-sizing: border-box; }
.tappi-admin .input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,87,217,0.15); }
.tappi-admin .input::placeholder { color: var(--ink-faint); }
.tappi-admin textarea.input { resize: vertical; min-height: 80px; font-family: inherit; }

.tappi-admin .stat { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 24px; box-shadow: var(--shadow); }
.tappi-admin .stat.hero { background: linear-gradient(160deg, #FFFFFF, #E2EAF4); border-color: #C8D8EC; }
.tappi-admin .stat-label { font-size: 13px; color: var(--ink-soft); font-weight: 300; margin: 0 0 10px; display: flex; align-items: center; gap: 7px; }
.tappi-admin .stat-value { font-size: 38px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; font-feature-settings: "tnum" 1; }
.tappi-admin .stat.hero .stat-value { font-size: 46px; }
.tappi-admin .stat-sub { margin-top: 10px; font-size: 13px; font-weight: 300; color: var(--ink-faint); display: flex; align-items: center; gap: 6px; }
.tappi-admin .delta { font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
.tappi-admin .delta.up { color: var(--positive); }
.tappi-admin .delta.down { color: var(--negative); }
.tappi-admin .stars-inline { display: inline-flex; gap: 1px; vertical-align: middle; }

.tappi-admin .empty { padding: 28px 0; text-align: center; font-size: 13.5px; font-weight: 300; color: var(--ink-faint); }
.tappi-admin .chip { padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 400; cursor: pointer; transition: all .15s ease; border: 1px solid var(--line); background: var(--surface); color: var(--ink-soft); font-family: inherit; }
.tappi-admin .chip:hover { color: var(--ink); border-color: var(--ink-faint); }
.tappi-admin .chip.active { background: var(--ink); color: #fff; border-color: var(--ink); }
.tappi-admin .chip.accent { background: var(--accent-soft); color: var(--accent); border-color: transparent; }
.tappi-admin .chip.positive { background: rgba(26,127,90,0.10); color: var(--positive); border-color: transparent; }
.tappi-admin .chip.negative { background: rgba(197,48,48,0.10); color: var(--negative); border-color: transparent; }

.tappi-admin .modal-backdrop { position: fixed; inset: 0; background: rgba(13,27,46,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.tappi-admin .modal { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 32px; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; margin: 16px; box-shadow: var(--shadow-lift); }
.tappi-admin .modal-title { font-weight: 400; font-size: 22px; letter-spacing: -0.01em; margin: 0 0 24px; }
.tappi-admin .error-banner { color: var(--negative); margin: 0 0 16px; font-size: 13.5px; padding: 10px 14px; background: rgba(197,48,48,0.07); border-radius: 10px; border: 1px solid rgba(197,48,48,0.18); }

.tappi-admin .stats { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.tappi-admin .grid-main { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; margin-bottom: 24px; }
.tappi-admin .chart-wrap { position: relative; }
.tappi-admin .chart svg { width: 100%; height: 180px; display: block; }
.tappi-admin .chart-axis { display: flex; justify-content: space-between; margin-top: 10px; }
.tappi-admin .chart-axis span { font-size: 11.5px; color: var(--ink-faint); font-weight: 300; }

.tappi-admin .review { padding: 16px 0; border-top: 1px solid var(--line); }
.tappi-admin .review:first-of-type { border-top: none; padding-top: 0; }
.tappi-admin .review-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.tappi-admin .review-name { font-weight: 600; font-size: 14px; }
.tappi-admin .review-time { font-size: 12px; font-weight: 300; color: var(--ink-faint); }
.tappi-admin .review-text { font-size: 13.5px; color: var(--ink-soft); margin: 0; }

.tappi-admin .manage { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }

@media (max-width: 980px) {
  .tappi-admin .manage { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 920px) {
  .tappi-admin .wrap { padding: 24px 16px 60px; }
  .tappi-admin .topbar { padding: 0 16px; gap: 16px; }
  .tappi-admin .nav { display: none; }
  .tappi-admin .acct-name, .tappi-admin .acct-role { display: none; }
  .tappi-admin .stats { grid-template-columns: 1fr 1fr; }
  .tappi-admin .stat.hero { grid-column: 1 / -1; }
  .tappi-admin .grid-main { grid-template-columns: 1fr; }
  .tappi-admin .greeting { font-size: 26px; }
}
@media (max-width: 520px) {
  .tappi-admin .stats, .tappi-admin .manage { grid-template-columns: 1fr; }
  .tappi-admin .page-head { flex-direction: column; align-items: flex-start; }
}
`;

const fontLinks = (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Outfit:wght@300;400;600&display=swap"
      rel="stylesheet"
    />
  </>
);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <>{children}</>;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const css = styleSheet();

  if (!restaurant) {
    return (
      <>
        {fontLinks}
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="tappi-admin">
          <main className="wrap">
            <p style={{ color: "var(--ink-soft)" }}>No restaurant found for your account.</p>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      {fontLinks}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="tappi-admin">
        <AdminTopbar
          restaurantName={restaurant.name}
          initials={initials(restaurant.name)}
          signOut={signOut}
        />
        {children}
      </div>
    </>
  );
}
