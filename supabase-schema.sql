-- Habilita o uso de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Criação das Tabelas
-- ==========================================

-- Tabela de Usuários (Equipe)
CREATE TABLE public.users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'CASHIER', 'WAITER')),
  pin text NOT NULL UNIQUE,
  commission_balance numeric(10,2) DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Categorias
CREATE TABLE public.categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  icon text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Produtos
CREATE TABLE public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  cost numeric(10,2) NOT NULL DEFAULT 0.00,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Mesas
CREATE TABLE public.tables (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_number integer NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'PAYMENT_PENDING')),
  current_order_id uuid, -- Será uma chave estrangeira para orders (adicionada depois)
  waiter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  custom_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Pedidos
CREATE TABLE public.orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_id uuid REFERENCES public.tables(id) ON DELETE SET NULL,
  waiter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0.00,
  service_fee numeric(10,2) NOT NULL DEFAULT 0.00,
  discount numeric(10,2) NOT NULL DEFAULT 0.00,
  total numeric(10,2) NOT NULL DEFAULT 0.00,
  payment_method text CHECK (payment_method IN ('CASH', 'CARD_CREDIT', 'CARD_DEBIT', 'PIX', 'MIXED')),
  opened_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  closed_at timestamp with time zone
);

-- Itens do Pedido
CREATE TABLE public.order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  product_name text NOT NULL, -- armazenado para histórico caso o produto mude o nome
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL, -- preço no momento da venda
  total numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionando a FK cruzada em mesas (current_order_id)
ALTER TABLE public.tables ADD CONSTRAINT fk_current_order FOREIGN KEY (current_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- Log de Comissões
CREATE TABLE public.commission_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  waiter_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID'))
);

-- ==========================================
-- 2. Configuração de Segurança (Row Level Security - RLS)
-- ==========================================

-- Habilitando RLS para todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_logs ENABLE ROW LEVEL SECURITY;

-- Políticas Simples (permitindo todas as operações autenticadas inicialmente)
-- O ideal depois é restringir baseado na role (ex: waiter não deleta produto)
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.users FOR ALL USING (true);
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.categories FOR ALL USING (true);
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.products FOR ALL USING (true);
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.tables FOR ALL USING (true);
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.orders FOR ALL USING (true);
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.commission_logs FOR ALL USING (true);

-- Tabela de Despesas
CREATE TABLE public.expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  category text NOT NULL CHECK (category IN ('MAINTENANCE', 'CLEANING', 'SALARY', 'SUPPLIES', 'OTHER')),
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura/escrita anonima para testes" ON public.expenses FOR ALL USING (true);


-- Cria usuário ADMIN padrão (PIN: 1234)
INSERT INTO public.users (name, role, pin) VALUES ('Administrador', 'ADMIN', '1234');

-- Cria dados básicos de Categorias
INSERT INTO public.categories (name, icon) VALUES 
('Porções', '🍟'),
('Bebidas', '🍺'),
('Drinks', '🍹');

-- Gera 20 Mesas Livres
DO $$
DECLARE
    i INT := 1;
BEGIN
    WHILE i <= 20 LOOP
        INSERT INTO public.tables (table_number, status) VALUES (i, 'AVAILABLE');
        i := i + 1;
    END LOOP;
END $$;
