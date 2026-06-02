-- Enable Row Level Security (RLS) but allow public access for this MVP
create table if not exists public.perfis (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  cargo text not null check (cargo in ('ADMIN', 'GARCOM', 'CAIXA')),
  ativo boolean default true,
  pin text -- pode ser nulo para garçons
);

-- Habilitar Realtime para a tabela perfis
alter publication supabase_realtime add table public.perfis;

-- Inserir dados de teste
insert into public.perfis (nome, cargo, ativo, pin) values
  ('Administrativo', 'ADMIN', true, '1111'),
  ('Garçom Igor', 'GARCOM', true, null),
  ('Garçom Cris', 'GARCOM', true, null),
  ('Caixa Principal', 'CAIXA', true, '3333');
