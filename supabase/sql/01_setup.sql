-- Execute este script no SQL Editor do Supabase DEPOIS de rodar as migrations
-- do Drizzle (npm run db:migrate), pois ele depende das tabelas já existirem.

-- 1) Cria automaticamente uma linha em "profiles" sempre que alguém se
--    cadastra pelo Supabase Auth (auth.users é gerenciado pelo Supabase,
--    não pelo Drizzle).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Row-Level Security: cada tabela "de household" só pode ser lida/escrita
--    por quem é membro daquela household. Isso é a segunda camada de defesa
--    (a primeira é o filtro por household_id em cada query do Drizzle).
alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.receipts enable row level security;
alter table public.budgets enable row level security;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = target_household_id and user_id = auth.uid()
  );
$$;

create policy "members can read their household" on public.households
  for select using (public.is_household_member(id));
create policy "members can update their household" on public.households
  for update using (public.is_household_member(id));

create policy "users can read their own profile" on public.profiles
  for select using (id = auth.uid());
create policy "users can update their own profile" on public.profiles
  for update using (id = auth.uid());

create policy "members can read memberships of their household" on public.household_members
  for select using (public.is_household_member(household_id));
create policy "members can manage memberships of their household" on public.household_members
  for all using (public.is_household_member(household_id));

create policy "members can read invites of their household" on public.household_invites
  for select using (public.is_household_member(household_id));
create policy "invited user can read their own invite" on public.household_invites
  for select using (email = auth.jwt()->>'email');
create policy "members can manage invites of their household" on public.household_invites
  for all using (public.is_household_member(household_id));

create policy "members can read categories" on public.categories
  for select using (public.is_household_member(household_id));
create policy "members can manage categories" on public.categories
  for all using (public.is_household_member(household_id));

create policy "members can read transactions" on public.transactions
  for select using (public.is_household_member(household_id));
create policy "members can manage transactions" on public.transactions
  for all using (public.is_household_member(household_id));

create policy "members can read receipts" on public.receipts
  for select using (public.is_household_member(household_id));
create policy "members can manage receipts" on public.receipts
  for all using (public.is_household_member(household_id));

create policy "members can read budgets" on public.budgets
  for select using (public.is_household_member(household_id));
create policy "members can manage budgets" on public.budgets
  for all using (public.is_household_member(household_id));

-- 3) Bucket de Storage para as fotos de notas fiscais.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "members can read their household receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and public.is_household_member((storage.foldername(name))[1]::uuid)
  );

create policy "members can upload their household receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and public.is_household_member((storage.foldername(name))[1]::uuid)
  );
