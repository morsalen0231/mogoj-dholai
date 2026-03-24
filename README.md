# রহস্যঘর

Playful knowledge website prototype with:

- ৫টি category, ৩০টি article route
- Supabase email/password login
- age-switch content mode
- funny fact box
- profile, leaderboard, archive, share, about, feedback pages
- invisible chat room UI
- Supabase schema for realtime chat and community data

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup

1. `.env.example` কপি করে `.env.local` বানান।
2. আপনার Supabase project URL ও anon key বসান।
3. `supabase/schema.sql` Supabase SQL editor-এ run করুন।
4. যদি আগের schema already run করা থাকে, পুরনো auth-unaware table structure-এর বদলে নতুন schema apply করুন।
5. `profiles.bio does not exist` বা similar error এলে বুঝবেন latest schema run হয়নি। তখন `supabase/schema.sql` আবার run করুন।

## Google OAuth setup

Google login কাজ করাতে শুধু button code থাকলেই হবে না, Supabase dashboard config-ও লাগবে।

1. Supabase Dashboard -> Authentication -> Providers -> Google enable করুন।
2. আপনার Google OAuth client ID এবং secret Supabase-এ বসান।
3. Supabase Dashboard -> Authentication -> URL Configuration এ:
   Local `Site URL` হিসেবে `http://localhost:3000` দিন।
4. একই জায়গায় `Redirect URLs` এ অন্তত এই URL add করুন:
   `http://localhost:3000/auth/callback`
5. Production deploy থাকলে production domain-এর callback-ও add করুন:
   `https://your-domain.com/auth/callback`
6. Google Cloud Console-এ Supabase যে redirect URI দেয়, সেটা Authorized redirect URIs-এ add করতে হবে।

যদি login-এর পর `No code provided` বা callback-এ `code` missing error আসে, সাধারণত redirect URL mismatch-ই কারণ।

## Roles

- default role: `reader`
- admin করতে চাইলে SQL Editor-এ এই query run করুন:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_ID';
```

## Chat logic

- `chat_messages` table প্রতি room-এর latest 4 message রাখে।
- ৫ নম্বর message insert হলেই trigger পুরনো message delete করে।
- চাইলে client থেকে `room_id` ভিত্তিক cleanup call করে refresh/leave-এ room purge করা যাবে।

## Main routes

- `/`
- `/archive`
- `/articles/[slug]`
- `/login`
- `/profile`
- `/leaderboard`
- `/share`
- `/about`
- `/feedback`
- `/chat`
