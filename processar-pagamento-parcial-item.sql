-- ==========================================
-- Função RPC: processar_pagamento_parcial_item
-- Executa a baixa atômica de uma quantidade parcial de um item
-- ==========================================

CREATE OR REPLACE FUNCTION processar_pagamento_parcial_item(
  p_id_item_pedido uuid,
  p_quantidade_paga int,
  p_valor_pago numeric,
  p_taxa_servico numeric
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item record;
  v_order_id uuid;
  v_table_id uuid;
  v_waiter_id uuid;
  
  v_new_partial_order_id uuid;
  v_remaining_subtotal numeric(10,2);
  v_new_service_fee numeric(10,2);
  v_new_total numeric(10,2);
BEGIN
  -- 1. Buscar o item original associado à comanda em aberto
  SELECT * INTO v_item 
  FROM public.order_items 
  WHERE id = p_id_item_pedido;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item de pedido não encontrado.';
  END IF;

  IF p_quantidade_paga <= 0 THEN
      RAISE EXCEPTION 'Quantidade paga deve ser maior que zero.';
  END IF;

  IF v_item.quantity < p_quantidade_paga THEN
      RAISE EXCEPTION 'Não é possível dar baixa em % unidades. A mesa possui apenas %.', p_quantidade_paga, v_item.quantity;
  END IF;

  -- 2. Buscar informações da comanda e da mesa
  SELECT id, table_id, waiter_id, service_fee INTO v_order_id, v_table_id, v_waiter_id, v_new_service_fee
  FROM public.orders 
  WHERE id = v_item.order_id;
  
  -- 3. Iniciar Nova "Via Fechada" (Comanda invisível separada para manter registro Financeiro)
  INSERT INTO public.orders (
    table_id, waiter_id, status, subtotal, service_fee, discount, total, payment_method, opened_at, closed_at
  ) VALUES (
    v_table_id, v_waiter_id, 'CLOSED', p_valor_pago, p_taxa_servico, 0, p_valor_pago + p_taxa_servico, 'COMPOSITE', now(), now()
  ) RETURNING id INTO v_new_partial_order_id;

  -- Verifica se é Split ou Total
  IF p_quantidade_paga < v_item.quantity THEN
      -- SPLIT: Atualizar a linha original (Descontar quantidade paga)
      UPDATE public.order_items 
      SET 
          quantity = quantity - p_quantidade_paga,
          total = price * (quantity - p_quantidade_paga)
      WHERE id = p_id_item_pedido;

      -- Inserir nova linha vinculada à via fechada com status Pago
      INSERT INTO public.order_items (
        order_id, product_id, product_name, quantity, price, total
      ) VALUES (
        v_new_partial_order_id, v_item.product_id, v_item.product_name, p_quantidade_paga, v_item.price, p_valor_pago
      );

  ELSE
      -- TOTAL: A quantidade paga é idêntica à que está na mesa.
      -- Apenas troca o order_id do item para a nova comanda fechada
      UPDATE public.order_items 
      SET order_id = v_new_partial_order_id
      WHERE id = p_id_item_pedido;
  END IF;

  -- 4. Dar baixa no Estoque
  UPDATE public.products 
  SET stock = GREATEST(0, stock - p_quantidade_paga)
  WHERE id = v_item.product_id;

  -- 5. Lançamento no Financeiro do Garçom (Comissão)
  IF p_taxa_servico > 0 AND v_waiter_id IS NOT NULL THEN
     INSERT INTO public.commission_logs (
       waiter_id, order_id, amount, status, type, description
     ) VALUES (
       v_waiter_id, v_new_partial_order_id, p_taxa_servico, 'PAID', 'COMMISSION', 'Taxa de serviço (Pagamento Parcial)'
     );
  END IF;

  -- 6. Recalcular os totais da Mesa Mãe (que continua em aberto)
  SELECT COALESCE(SUM(total), 0) INTO v_remaining_subtotal 
  FROM public.order_items 
  WHERE order_id = v_order_id;

  IF v_new_service_fee > 0 THEN
      -- Se a mesa estava com 10%, reajustamos 10% do novo subtotal
      v_new_service_fee := ROUND((v_remaining_subtotal * 0.10), 2);
  ELSE
      v_new_service_fee := 0;
  END IF;
  
  -- Para forçar a consistência com o banco json caso estejamos usando supabase offline
  -- UPDATE public.orders:
  UPDATE public.orders 
  SET 
    subtotal = v_remaining_subtotal,
    service_fee = v_new_service_fee,
    total = ROUND(v_remaining_subtotal + v_new_service_fee, 2)
  WHERE id = v_order_id;

END;
$$;
