-- Delibera — Schema inicial (Supabase)
-- Fundação de dados do MVP: perfis, conselhos, operação colegiada, deliberação e transparência.

-- =============================================================================
-- Extensiones e enums
-- =============================================================================
create extension if not exists "pgcrypto";

do $$ begin
  create type public.council_status as enum ('ativo', 'inativo', 'em_transicao');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mandate_status as enum ('vigente', 'encerrado', 'previsto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.meeting_status as enum ('planejada', 'convocada', 'em_andamento', 'concluida', 'cancelada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.agenda_status as enum ('pendente', 'em_preparacao', 'aprovada', 'adiada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.vote_type as enum ('favor', 'contra', 'abstencao');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_status as enum ('rascunho', 'em_revisao', 'publicado', 'arquivado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_type as enum ('Ata', 'Resolucao', 'Pauta', 'Relatorio', 'Parecer', 'Outro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.forwarding_status as enum ('pendente', 'em_curso', 'concluido', 'vencido');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- Tabelas principais
-- =============================================================================

-- Perfis públicos vinculados a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'membro' check (role in ('administrador', 'presidente', 'secretario', 'membro', 'observador')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conselhos (instâncias colegiadas)
create table if not exists public.councils (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  acronym text not null unique,
  description text,
  status public.council_status not null default 'ativo',
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Membros com vínculo ao conselho
create table if not exists public.council_members (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text,
  representacao text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (council_id, profile_id)
);

-- Mandatos (períodos de atuação)
create table if not exists public.mandates (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id) on delete cascade,
  council_member_id uuid references public.council_members (id) on delete set null,
  start_date date not null,
  end_date date,
  status public.mandate_status not null default 'previsto',
  instrument text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reuniões
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  location text,
  quorum_min int,
  status public.meeting_status not null default 'planejada',
  external_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pautas (itens de preparação)
create table if not exists public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  position int not null,
  title text not null,
  description text,
  status public.agenda_status not null default 'pendente',
  responsible_id uuid references public.council_members (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meeting_id, position)
);

-- Presença em reunião
create table if not exists public.meeting_attendance (
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  council_member_id uuid not null references public.council_members (id) on delete cascade,
  present boolean not null default true,
  justification text,
  primary key (meeting_id, council_member_id)
);

-- Deliberações (votações)
create table if not exists public.votations (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  agenda_item_id uuid references public.agenda_items (id) on delete set null,
  subject text not null,
  open_at timestamptz,
  close_at timestamptz,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  votation_id uuid not null references public.votations (id) on delete cascade,
  council_member_id uuid not null references public.council_members (id) on delete cascade,
  vote public.vote_type not null,
  created_at timestamptz not null default now(),
  unique (votation_id, council_member_id)
);

-- Documentos do acervo
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  council_id uuid references public.councils (id) on delete set null,
  meeting_id uuid references public.meetings (id) on delete set null,
  title text not null,
  type public.document_type not null default 'Outro',
  status public.document_status not null default 'rascunho',
  file_path text,
  public boolean not null default false,
  published_at timestamptz,
  version int not null default 1,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Encaminhamentos (responsáveis e prazos)
create table if not exists public.forwardings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents (id) on delete set null,
  votation_id uuid references public.votations (id) on delete set null,
  description text not null,
  responsible_id uuid references public.council_members (id) on delete set null,
  due_at timestamptz,
  status public.forwarding_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trilha de auditoria (somente inserção)
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Índices
-- =============================================================================
create index if not exists idx_council_members_council on public.council_members (council_id);
create index if not exists idx_council_members_profile on public.council_members (profile_id);
create index if not exists idx_meetings_council on public.meetings (council_id, scheduled_at);
create index if not exists idx_agenda_meeting on public.agenda_items (meeting_id);
create index if not exists idx_votations_meeting on public.votations (meeting_id);
create index if not exists idx_documents_council on public.documents (council_id);
create index if not exists idx_documents_public on public.documents (public) where public = true;
create index if not exists idx_forwardings_due on public.forwardings (status, due_at);
create index if not exists idx_audit_entity on public.audit_logs (entity_type, entity_id);

-- =============================================================================
-- Gatilho de updated_at
-- =============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$ declare t text;
begin
  foreach t in array array['profiles', 'councils', 'council_members', 'mandates', 'meetings', 'agenda_items', 'votations', 'documents', 'forwardings'] loop
    if not exists (
      select 1 from pg_trigger where tgname = 'trg_' || t || '_updated_at'
    ) then
      execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t, t);
    end if;
  end loop;
end $$;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.councils enable row level security;
alter table public.council_members enable row level security;
alter table public.mandates enable row level security;
alter table public.meetings enable row level security;
alter table public.agenda_items enable row level security;
alter table public.meeting_attendance enable row level security;
alter table public.votations enable row level security;
alter table public.votes enable row level security;
alter table public.documents enable row level security;
alter table public.forwardings enable row level security;
alter table public.audit_logs enable row level security;

-- Perfis: o usuário lê/atualiza o próprio perfil; leitura pública mínima.
drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);

-- Conselhos: leitura autenticada; escrita apenas para administradores (ajustar por papel em stage 2).
drop policy if exists "councils select auth" on public.councils;
drop policy if exists "councils insert admin" on public.councils;
drop policy if exists "councils update admin" on public.councils;
create policy "councils select auth" on public.councils for select using (auth.role() = 'authenticated');
create policy "councils insert admin" on public.councils for insert with check (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'administrador'));
create policy "councils update admin" on public.councils for update using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'administrador'));

-- Membros e mandatos: leitura autenticada; escrita administrador.
drop policy if exists "members select auth" on public.council_members;
drop policy if exists "members write admin" on public.council_members;
create policy "members select auth" on public.council_members for select using (auth.role() = 'authenticated');
create policy "members write admin" on public.council_members for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'administrador'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'administrador'));

drop policy if exists "mandates select auth" on public.mandates;
drop policy if exists "mandates write admin" on public.mandates;
create policy "mandates select auth" on public.mandates for select using (auth.role() = 'authenticated');
create policy "mandates write admin" on public.mandates for all using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'administrador'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'administrador'));

-- Operação colegiada: leitura autenticada; escrita autenticada (fortalecer papéis na etapa 3).
drop policy if exists "meetings select auth" on public.meetings;
drop policy if exists "meetings insert auth" on public.meetings;
drop policy if exists "meetings update auth" on public.meetings;
create policy "meetings select auth" on public.meetings for select using (auth.role() = 'authenticated');
create policy "meetings insert auth" on public.meetings for insert with check (auth.role() = 'authenticated');
create policy "meetings update auth" on public.meetings for update using (auth.role() = 'authenticated');

drop policy if exists "agenda select auth" on public.agenda_items;
drop policy if exists "agenda write auth" on public.agenda_items;
create policy "agenda select auth" on public.agenda_items for select using (auth.role() = 'authenticated');
create policy "agenda write auth" on public.agenda_items for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "attendance select auth" on public.meeting_attendance;
drop policy if exists "attendance write auth" on public.meeting_attendance;
create policy "attendance select auth" on public.meeting_attendance for select using (auth.role() = 'authenticated');
create policy "attendance write auth" on public.meeting_attendance for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "votations select auth" on public.votations;
drop policy if exists "votations write auth" on public.votations;
create policy "votations select auth" on public.votations for select using (auth.role() = 'authenticated');
create policy "votations write auth" on public.votations for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "votes select auth" on public.votes;
drop policy if exists "votes insert own" on public.votes;
create policy "votes select auth" on public.votes for select using (auth.role() = 'authenticated');
create policy "votes insert own" on public.votes for insert with check (auth.uid() in (
  select cm.profile_id from public.council_members cm where cm.id = council_member_id));

-- Documentos: públicos visíveis a todos; internos apenas autenticados.
drop policy if exists "documents select" on public.documents;
drop policy if exists "documents write auth" on public.documents;
create policy "documents select" on public.documents for select using ("public" or auth.role() = 'authenticated');
create policy "documents write auth" on public.documents for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Encaminhamentos: autenticados.
drop policy if exists "forwardings select auth" on public.forwardings;
drop policy if exists "forwardings write auth" on public.forwardings;
create policy "forwardings select auth" on public.forwardings for select using (auth.role() = 'authenticated');
create policy "forwardings write auth" on public.forwardings for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Auditoria: nenhum acesso por tabela; escrita acontece por função segura (etapa 6) ou service_role.
drop policy if exists "audit none" on public.audit_logs;
create policy "audit none" on public.audit_logs for select using (false);