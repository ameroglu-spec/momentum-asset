-- Momentum Asset V5 Supabase kurulumu / güncellemesi
-- Supabase > SQL Editor içinde tek sefer çalıştırın.
-- V4.2 üzerine güvenli şekilde günceller. Aynı SQL tekrar çalıştırılabilir.

create extension if not exists "pgcrypto";

create table if not exists public.homes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text default 'Kiradaki Ev',
  address text,
  created_at timestamptz default now()
);

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  plate text,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  home_id uuid references public.homes(id) on delete set null,
  car_id uuid references public.cars(id) on delete set null,
  type text not null check (type in ('income','expense')),
  category text not null default 'Diğer',
  amount numeric default 0,
  date date not null,
  repeat_type text default 'Tek seferlik',
  status text default 'Bekleniyor',
  note text,
  created_at timestamptz default now()
);

create table if not exists public.definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  name text not null,
  active boolean not null default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  unique(user_id,type,name)
);

-- V4: varlık değeri, alış bilgisi ve kiracı/araç detayları
alter table public.homes add column if not exists purchase_price numeric default 0;
alter table public.homes add column if not exists current_value numeric default 0;
alter table public.homes add column if not exists purchase_date date;
alter table public.homes add column if not exists tenant_name text;
alter table public.homes add column if not exists tenant_phone text;
alter table public.homes add column if not exists rent_amount numeric default 0;
alter table public.homes add column if not exists rent_increase_month text;

alter table public.cars add column if not exists purchase_price numeric default 0;
alter table public.cars add column if not exists current_value numeric default 0;
alter table public.cars add column if not exists purchase_date date;
alter table public.cars add column if not exists km numeric default 0;

-- V4: doc_type tanımı için eski check constraint varsa güncelle
alter table public.definitions drop constraint if exists definitions_type_check;
alter table public.definitions add constraint definitions_type_check check (type in ('home_expense','car_expense','income','status','doc_type'));

-- V4: belge arşivi
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  home_id uuid references public.homes(id) on delete cascade,
  car_id uuid references public.cars(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete set null,
  doc_type text default 'Diğer',
  file_name text not null,
  file_path text not null,
  created_at timestamptz default now()
);


-- V4.2: Belgeleri doğrudan gelir/gider kayıtlarına bağlama
alter table public.documents add column if not exists entry_id uuid references public.entries(id) on delete set null;
create index if not exists idx_documents_entry on public.documents(entry_id);

alter table public.homes enable row level security;
alter table public.cars enable row level security;
alter table public.entries enable row level security;
alter table public.definitions enable row level security;
alter table public.documents enable row level security;

drop policy if exists "own homes" on public.homes;
create policy "own homes" on public.homes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own cars" on public.cars;
create policy "own cars" on public.cars for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own entries" on public.entries;
create policy "own entries" on public.entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own definitions" on public.definitions;
create policy "own definitions" on public.definitions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own documents" on public.documents;
create policy "own documents" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_homes_user on public.homes(user_id);
create index if not exists idx_cars_user on public.cars(user_id);
create index if not exists idx_entries_user_date on public.entries(user_id,date);
create index if not exists idx_definitions_user_type on public.definitions(user_id,type);
create index if not exists idx_documents_user on public.documents(user_id);

-- Supabase Storage bucket
insert into storage.buckets (id, name, public)
values ('asset-documents', 'asset-documents', false)
on conflict (id) do nothing;

-- Storage RLS: kullanıcı sadece kendi user_id klasöründeki dosyalara erişir.
drop policy if exists "asset documents select own" on storage.objects;
create policy "asset documents select own" on storage.objects
for select using (bucket_id = 'asset-documents' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "asset documents insert own" on storage.objects;
create policy "asset documents insert own" on storage.objects
for insert with check (bucket_id = 'asset-documents' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "asset documents update own" on storage.objects;
create policy "asset documents update own" on storage.objects
for update using (bucket_id = 'asset-documents' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "asset documents delete own" on storage.objects;
create policy "asset documents delete own" on storage.objects
for delete using (bucket_id = 'asset-documents' and auth.uid()::text = (storage.foldername(name))[1]);
