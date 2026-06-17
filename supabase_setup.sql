-- Script completo para criar o banco de dados do sistema no Supabase
-- Usamos uma única tabela "app_state" com um campo JSONB "data" para sincronizar tudo em tempo real.

-- 1. Cria ou recria a tabela app_state
CREATE TABLE IF NOT EXISTS public.app_state (
  id integer primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilita o "Row Level Security" para a tabela, mas nós vamos permitir acesso de leitura/escrita público (por simplicidade do app)
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Remove as politicas antigas (caso existam) e cria a nova politica de acesso publico
DROP POLICY IF EXISTS "Enable all access for all users" ON public.app_state;
CREATE POLICY "Enable all access for all users" ON public.app_state
    AS PERMISSIVE FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 3. Habilitar o Realtime para a tabela app_state para suportar atualizações em outras telas / devices
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_state;

-- 4. Insere o estado inicial com ID 1, caso ainda não exista
INSERT INTO public.app_state (id, data, updated_at)
VALUES (1, '{}'::jsonb, timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;
