# Realhosti Partner Portal

Mobile-first Twitch Partner Portal mit Supabase als Backend und statischem Next Export fuer GitHub Pages.

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

Ohne `.env.local` startet die App im lokalen Demo-Modus. Fuer echte Twitch-Logins:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
NEXT_PUBLIC_PORTAL_CHAT_ROOM_ID=partner-lounge
```

## Supabase Setup

1. Neues Supabase Projekt erstellen.
2. `supabase/schema.sql` im Supabase SQL Editor ausfuehren.
3. Supabase Auth Provider `Twitch` aktivieren.
4. In Supabase die Redirect URLs eintragen:
   - Lokal: `http://localhost:3000/auth/callback/`
   - Lokal alternativ: `http://127.0.0.1:3000/auth/callback/`
   - Produktion: `https://partners.realhosti.de/auth/callback/`
   - Hash-Fallback: `https://partners.realhosti.de/#/auth/callback`
5. In Twitch Developer Console die Callback URL verwenden, die Supabase beim Twitch Provider anzeigt.

Der erste eingeloggte Admin muss in Supabase gesetzt werden:

```sql
update public.profiles
set is_admin = true,
    app_role = 'admin'
where twitch_username = 'dein_twitch_name';
```

Weitere Staff-/Moderationsrollen kannst du so vergeben:

```sql
update public.profiles
set app_role = 'moderator'
where twitch_username = 'twitch_name';
```

Firmenregistrierungen landen in `public.companies` mit `status = 'pending'` und werden im Portal von Staff/Moderatoren freigegeben.

## GitHub Pages

Das Projekt nutzt `output: 'export'` und ist fuer die Custom Domain `partners.realhosti.de` konfiguriert. Deshalb bleibt `NEXT_PUBLIC_BASE_PATH` leer.

Die GitHub Action in `.github/workflows/deploy.yml` erwartet diese Repository Secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Nach dem Build liegt die statische App in `out/`.

Wenn die App spaeter doch unter `https://<github-user>.github.io/<repo>/` statt unter der Custom Domain laufen soll, muss `NEXT_PUBLIC_BASE_PATH=/<repo>` gesetzt werden.
