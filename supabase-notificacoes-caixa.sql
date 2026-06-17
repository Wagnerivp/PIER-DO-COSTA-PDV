-- ==========================================
-- Tabela e Realtime: Notificações do Caixa
-- ==========================================

-- 1. Criar a Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.cashier_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id text NOT NULL,
    table_number integer,
    waiter_name text NOT NULL,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED')),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar ROW LEVEL SECURITY (Público no contexto local / simplificado do app)
ALTER TABLE public.cashier_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for cashier_notifications" ON public.cashier_notifications;
CREATE POLICY "Enable all access for cashier_notifications" ON public.cashier_notifications
    AS PERMISSIVE FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 3. Configurar Realtime para Atualizações
BEGIN;
  -- (Cria a publicação nativa supabase_realtime caso o banco seja novo e ainda não possua)
  -- DROP PUBLICATION IF EXISTS supabase_realtime;
  -- CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.cashier_notifications;
