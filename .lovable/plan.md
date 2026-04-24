# Le Mans Ultimate Race Hub — Plan

En komplet community-platform for LMU-spillere: race engineer-værktøjer, bane-database, leaderboards, setup-deling og et API som en Discord-bot kan kalde.

## 🎨 Design & feel
- **Dark + Le Mans orange**: dyb sort baggrund (#0a0a0a), Le Mans-orange accent (#FF6B00), med subtile carbon-tekstur detaljer
- Tekniske, monospace-inspirerede tal (race engineer dashboard-vibe)
- Responsivt — fungerer både på desktop (race-prep) og mobil (hurtig opslag mellem stints)

## 🏗️ Vi bygger i faser — fase 1 leveres nu

### FASE 1 (denne plan) — Fundamentet + killer feature
1. **Landing page** — hero med "Plan your race. Win the stint." + features overview + CTA til calculator
2. **Fuel & Pit Strategy Calculator** (gæst-tilgængelig, ingen login krævet)
   - Inputs: bane (fra database), bil-klasse (Hypercar / LMP2 / GTE), fuel per lap, gennemsnitlig lap-tid, race-længde (laps eller minutter), tank-størrelse, pit loss tid
   - Outputs: antal pit stops, optimal pit-vinduer, fuel per stint, total race-plan tabel, backup safety-car strategi
   - Visuel fuel-graf over race-distancen
   - "Aggressive vs. Safe" toggle (margin på fuel)
   - Gem strategi-knap (kræver login)
3. **Auth** — email/password + Google sign-in via Lovable Cloud
4. **Bane-database (read-only browse)**
   - Seed med 10-12 LMU-baner (Le Mans, Spa, Monza, Bathurst, Sebring, Fuji, Portimão, Imola, Interlagos, Algarve, COTA, Nürburgring)
   - Per bane: længde, sving-antal, fuel-estimat per klasse, tire wear-niveau, community-tips
   - Brugere kan **foreslå rettelser/tilføjelser** (godkendes af admin)
5. **Bruger-profil** — gemte strategier, favoritbaner

### FASE 2 (næste runde — efter du har testet fase 1)
- **Leaderboards & laptimes** — upload, per-track leaderboards, consistency rating, sammenlign med ven
- **Setup sharing** — upload setup med tags (track/car/conditions), rating system, kommentarer

### FASE 3
- **Teams / Leagues** — private leaderboards, events
- **Event-kalender** — race-planlægning, signup
- **Diskussion** per track / setup
- **Bruger-bidrag til bane-database** med moderation

### FASE 4 — Discord bot + AI
- **Discord bot** (hostes separat — jeg leverer bot-koden + den kalder vores API)
  - `!fuelcalc <track> <minutes> <class>` → strategi direkte i Discord
  - `!track <navn>` → bane-info embed
  - `!setup <car> <track>` → top-rated setups
  - `!leaderboard <track>` → top 10
  - Sync med bruger-profil via Discord OAuth
- **AI Strategy Assistant** — "foreslå bedste strategi" baseret på race-context
- **Vejr-integration** — regn-strategi, dæk-skift timing

## 🗄️ Data-model (fase 1)
- `profiles` — bruger info (display name, avatar)
- `tracks` — bane data (seed'es med start-baner)
- `track_suggestions` — community-foreslåede rettelser (admin godkender)
- `cars` — bil-klasser med default fuel-værdier
- `saved_strategies` — brugeres gemte race-planer
- `user_roles` — admin-rolle for moderation (sikkert sat op i separat tabel)

Alle tabeller med Row Level Security — brugere ser kun deres egne data, baner er offentlige.

## 🤖 Discord bot — sådan tænker vi det
Vi bygger web-platformen + et **offentligt API** (via edge functions) som bot'en kalder. Bot'en selv kører ikke i Lovable — du hoster den fx på Railway/Fly.io med discord.js. Når vi når fase 4 leverer jeg bot-koden klar til deploy.

## ✅ Hvad du får når fase 1 er færdig
- Funktionel calculator du kan dele med community fra dag 1
- Login + gemte strategier
- Bane-database folk kan browse
- Skalerbart fundament klar til leaderboards, setups og bot

Klar til at bygge fase 1? 🏁