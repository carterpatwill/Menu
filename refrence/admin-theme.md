# Tappi Admin — Design System

Reference for implementing consistent styling across all `/admin/*` pages. The `/admin` overview page is the canonical implementation — when in doubt, match it.

---

## Color tokens

Define these once on a wrapper element via inline style or a scoped `<style>` block. All component styles reference them as CSS variables.

```css
:root {
  /* Surfaces */
  --paper:       #f6f3ec;   /* page background, warm cream */
  --surface:     #fffdf8;   /* card / panel fill */
  --surface-2:   #f1ece2;   /* tinted chip / tag backgrounds */

  /* Text */
  --ink:         #211c16;   /* primary, warm near-black */
  --ink-soft:    #756b5e;   /* secondary */
  --ink-faint:   #a39a8b;   /* captions, labels, disabled */

  /* Lines + elevation */
  --line:        #e6dfd2;
  --shadow:      0 1px 2px rgba(33,28,22,0.04);
  --shadow-lift: 0 12px 30px -12px rgba(33,28,22,0.18);

  /* Brand + semantic */
  --accent:      #bd4b2b;   /* terracotta — primary action */
  --accent-soft: #f4e2d8;   /* icon backgrounds, tinted fills */
  --positive:    #5d7a52;   /* sage — delta up, avatar bg */
  --negative:    #b1492f;   /* delta down */
  --star:        #d4972c;   /* amber — star ratings */

  /* Scale */
  --s1: 4px;  --s2: 8px;  --s3: 12px; --s4: 16px;
  --s5: 24px; --s6: 32px; --s7: 48px;
  --radius:    14px;
  --radius-sm: 10px;
}
```

The page background uses a two-stop radial gradient atmosphere on top of `--paper`:

```css
body, .tappi-admin {
  background-color: var(--paper);
  background-image:
    radial-gradient(1100px 500px at 85% -10%, rgba(189,75,43,0.06), transparent 60%),
    radial-gradient(900px 500px at -5%   0%, rgba(93,122,82,0.05),  transparent 55%);
}
```

---

## Typography

Two fonts loaded via `next/font/google` in each page file:

```tsx
import { Fraunces, Hanken_Grotesk } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

Usage pattern:
- **Hanken Grotesk** is the base sans — apply `hanken.style.fontFamily` on the root wrapper.
- **Fraunces** is the display serif — apply `fraunces.style.fontFamily` on headings, card titles, panel titles, and the brand name.

```tsx
// root wrapper
<div style={{ fontFamily: `${hanken.style.fontFamily}, -apple-system, sans-serif` }}>

  // headings / card titles
  <h1 style={{ fontFamily: fraunces.style.fontFamily }}>Good afternoon</h1>
```

### Type scale

| Role               | Size    | Weight | Notes                      |
|--------------------|---------|--------|----------------------------|
| Page greeting      | 32px    | 600    | Fraunces, letter-spacing −0.02em |
| Panel / card title | 17–18px | 600    | Fraunces, letter-spacing −0.01em |
| Nav links          | 14.5px  | 500    | Hanken                     |
| Body / list        | 13.5px  | 400    | Hanken                     |
| Labels / captions  | 12–13px | 500    | Hanken, `--ink-soft`       |
| Section label      | 12px    | 600    | Hanken, uppercase, 0.08em tracking |
| Stat value (hero)  | 46px    | 700    | tabular-nums               |
| Stat value         | 38px    | 700    | tabular-nums               |

---

## Shared topbar

Every admin page renders the same sticky topbar. The active `<Link>` gets the `.active` class. Copy the markup below and update which link has `className="active"`.

```tsx
// CSS (in scoped <style> or CSS module)
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: var(--s6);
  padding: 0 var(--s7); height: 64px;
  background: rgba(246,243,236,0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.brand-mark {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--accent);
  display: grid; place-items: center;
  color: #fff; font-weight: 600; font-size: 17px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
}
.brand-name { font-weight: 600; font-size: 19px; letter-spacing: -0.01em; }
.nav { display: flex; align-items: center; gap: var(--s1); margin-left: var(--s4); }
.nav a {
  padding: 8px 14px; border-radius: 999px;
  font-size: 14.5px; font-weight: 500; color: var(--ink-soft);
  transition: color .15s ease, background .15s ease;
}
.nav a:hover  { color: var(--ink); background: rgba(33,28,22,0.04); }
.nav a.active { color: var(--ink); background: var(--surface);
                box-shadow: var(--shadow); border: 1px solid var(--line); }
.account { margin-left: auto; display: flex; align-items: center; gap: var(--s4); }
.avatar  {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--positive); color: #fff;
  display: grid; place-items: center; font-weight: 600; font-size: 13px;
}
.signout {
  font-size: 13.5px; font-weight: 500; color: var(--ink-soft);
  padding: 7px 14px; border-radius: 999px;
  border: 1px solid var(--line); background: var(--surface);
  transition: all .15s ease; font-family: inherit; cursor: pointer;
}
.signout:hover { color: var(--ink); border-color: var(--ink-faint); }
```

```tsx
// JSX
<header className="topbar">
  <div className="brand">
    <div className="brand-mark" style={{ fontFamily: fraunces.style.fontFamily }}>T</div>
    <span className="brand-name" style={{ fontFamily: fraunces.style.fontFamily }}>Tappi</span>
  </div>
  <nav className="nav">
    <Link href="/admin"            className="">Overview</Link>
    <Link href="/admin/menu"       className="active">Menu</Link>  {/* ← update per page */}
    <Link href="/admin/tags"       className="">Tags</Link>
    <Link href="/admin/analytics"  className="">Analytics</Link>
    <Link href="/admin/reviews"    className="">Reviews</Link>
  </nav>
  <div className="account">
    <div className="acct-chip">
      <div className="avatar">{initials(restaurant.name)}</div>
      <div>
        <div className="acct-name">{restaurant.name}</div>
        <div className="acct-role">Owner</div>
      </div>
    </div>
    <form action={signOut}>
      <button type="submit" className="signout">Sign out</button>
    </form>
  </div>
</header>
```

`initials()` helper — first letter of each of the first two words, uppercased:

```ts
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
```

---

## Page layout

```css
.wrap {
  position: relative; z-index: 1;
  max-width: 1120px; margin: 0 auto;
  padding: var(--s7) var(--s7) 80px;
}

/* sub-page header with back link */
.page-head {
  display: flex; align-items: flex-end;
  justify-content: space-between;
  gap: var(--s4); margin-bottom: var(--s6);
}
.greeting {
  font-weight: 600; font-size: 32px;
  letter-spacing: -0.02em; margin: 0;
}
.subhead { color: var(--ink-soft); font-size: 14.5px; margin: 6px 0 0; }
```

Sub-pages (menu, tags, analytics, reviews, settings) use a simpler page header with a back link:

```tsx
<div className="page-head">
  <div>
    <Link href="/admin" className="back-link">← Overview</Link>
    <h1 className="greeting" style={{ fontFamily: fraunces.style.fontFamily }}>Menu</h1>
    <p className="subhead">Add, edit and organise your menu items.</p>
  </div>
</div>
```

```css
.back-link {
  display: inline-block; margin-bottom: 4px;
  font-size: 13px; color: var(--ink-faint);
  transition: color .15s ease;
}
.back-link:hover { color: var(--ink-soft); }
```

---

## Buttons

### Primary (terracotta)

```css
.btn-primary {
  background: var(--accent); color: #fff; border: none;
  padding: 11px 18px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
  transition: transform .12s ease, filter .15s ease;
  box-shadow: 0 6px 16px -8px rgba(189,75,43,0.6);
  font-family: inherit;
}
.btn-primary:hover { filter: brightness(1.04); transform: translateY(-1px); }
```

### Ghost (secondary)

```css
.btn-ghost {
  background: var(--surface); color: var(--ink-soft);
  border: 1px solid var(--line);
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 13.5px; font-weight: 500; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  transition: border-color .15s ease, color .15s ease;
  font-family: inherit;
}
.btn-ghost:hover { color: var(--ink); border-color: var(--ink-faint); }
```

### Destructive

Same as ghost but uses `--negative` for the text color on hover.

---

## Cards / panels

```css
.panel {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: var(--s5);
  box-shadow: var(--shadow);
}

/* card with hover lift (used in the Manage grid) */
.card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: var(--s5);
  box-shadow: var(--shadow);
  transition: transform .14s ease, box-shadow .18s ease, border-color .18s ease;
  cursor: pointer; display: block;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lift);
  border-color: #d8cdbb;
}

/* icon badge inside a card */
.card-icon {
  width: 42px; height: 42px; border-radius: 11px;
  background: var(--accent-soft); color: var(--accent);
  display: grid; place-items: center; margin-bottom: var(--s4);
}
```

Panel header:
```css
.panel-head {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: var(--s5);
}
.panel-title { font-weight: 600; font-size: 18px; margin: 0; letter-spacing: -0.01em; }
.panel-link  { font-size: 13px; font-weight: 600; color: var(--accent); }
.panel-link:hover { text-decoration: underline; }
```

---

## Section label

Used above groups of related cards:

```css
.section-label {
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--ink-faint); margin: 0 0 var(--s4);
}
```

---

## Form elements (settings, menu editor)

```css
.field-label {
  display: block; font-size: 13px; font-weight: 600;
  color: var(--ink-soft); margin-bottom: 6px;
}

.input {
  width: 100%; padding: 10px 14px;
  background: var(--surface); color: var(--ink);
  border: 1px solid var(--line); border-radius: var(--radius-sm);
  font-family: inherit; font-size: 14px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(189,75,43,0.12);
}
.input::placeholder { color: var(--ink-faint); }
```

---

## Responsive breakpoints

```css
@media (max-width: 920px) {
  .wrap     { padding: var(--s5) var(--s4) 60px; }
  .topbar   { padding: 0 var(--s4); gap: var(--s4); }
  .nav      { display: none; }
  .acct-name, .acct-role { display: none; }
  .greeting { font-size: 26px; }
}

@media (max-width: 520px) {
  .page-head { flex-direction: column; align-items: flex-start; }
}
```

---

## Empty states

```css
.empty {
  padding: 28px 0; text-align: center;
  font-size: 13.5px; color: var(--ink-faint);
}
```

---

## Implementing on a new admin page

Checklist:

1. Import `Fraunces` and `Hanken_Grotesk` from `next/font/google` at the top of the file (module-level, not inside the component).
2. Wrap the whole page in a `<div>` that applies the Hanken font-family and `--paper` background.
3. Render a `<style dangerouslySetInnerHTML={{ __html: ... }}>` with the token definitions and scoped component classes (or use a CSS module).
4. Add the topbar markup, marking the current page's nav link with `className="active"`.
5. Use the `.wrap` container for content.
6. Use `.panel` / `.card` for content surfaces; never use white `#fff` or arbitrary grays directly.
7. Apply Fraunces (`fraunces.style.fontFamily`) to any heading, panel title, or card title.
