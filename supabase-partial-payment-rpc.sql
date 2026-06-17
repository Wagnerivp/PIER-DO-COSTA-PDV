-- ==========================================
-- Função RPC: realizar_pagamento_parcial
-- Executa a baixa atômica de um pagamento parcial de mesa
-- ==========================================

CREATE OR REPLACE FUNCTION realizar_pagamento_parcial(
  p_table_id uuid,
  p_items jsonb, -- Array de items com formatação: [{"product_id": "uuid", "quantity": 1}]
  p_payment_method text,
  p_service_fee numeric
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_order_id uuid;
  v_waiter_id uuid;
  v_new_partial_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_qty_to_pay int;
  
  v_partial_subtotal numeric(10,2) := 0.00;
  v_partial_total numeric(10,2) := 0.00;
  
  v_item_price numeric(10,2);
  v_item_name text;
  v_qty_available int;
  
  v_remaining_subtotal numeric(10,2);
  v_remaining_service_fee numeric(10,2);
BEGIN
  -- 1. Obter a comanda (order) atual da mesa
  SELECT current_order_id INTO v_current_order_id 
  FROM public.tables 
  WHERE id = p_table_id AND status = 'OCCUPIED';

  IF v_current_order_id IS NULL THEN
    RAISE EXCEPTION 'Mesa não possui uma comanda aberta.';
  END IF;

  SELECT waiter_id INTO v_waiter_id 
  FROM public.orders 
  WHERE id = v_current_order_id;

  -- 2. Criar uma nova comanda 'CLOSED' para representar a via paga (Financeiro/Receita)
  INSERT INTO public.orders (
    table_id, waiter_id, status, subtotal, service_fee, discount, total, payment_method, opened_at, closed_at
  ) VALUES (
    p_table_id, v_waiter_id, 'CLOSED', 0, p_service_fee, 0, 0, p_payment_method, now(), now()
  ) RETURNING id INTO v_new_partial_order_id;

  -- 3. Iterar sobre os itens que estão sendo pagos
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty_to_pay := (v_item->>'quantity')::int;

    IF v_qty_to_pay > 0 THEN
      -- Buscar o item correspondente na comanda principal
      SELECT price, product_name, quantity 
      INTO v_item_price, v_item_name, v_qty_available
      FROM public.order_items 
      WHERE order_id = v_current_order_id AND product_id = v_product_id 
      LIMIT 1;

      IF v_item_price IS NULL OR v_qty_available < v_qty_to_pay THEN
        RAISE EXCEPTION 'Item % indisponível em quantidade suficiente na mesa.', v_item_name;
      END IF;

      -- Adicionar item pago na via fechada
      INSERT INTO public.order_items (
        order_id, product_id, product_name, quantity, price, total
      ) VALUES (
        v_new_partial_order_id, v_product_id, v_item_name, v_qty_to_pay, v_item_price, v_item_price * v_qty_to_pay
      );

      v_partial_subtotal := v_partial_subtotal + (v_item_price * v_qty_to_pay);

      -- Atualizar a comanda mãe (reduzir a quantidade)
      IF v_qty_available = v_qty_to_pay THEN
        -- Remove se foi pago integralmente
        DELETE FROM public.order_items 
        WHERE order_id = v_current_order_id AND product_id = v_product_id;
      ELSE
        -- Subtrai se ficou resto
        UPDATE public.order_items 
        SET 
          quantity = quantity - v_qty_to_pay,
          total = price * (quantity - v_qty_to_pay)
        WHERE order_id = v_current_order_id AND product_id = v_product_id;
      END IF;

      -- Deduzir do Estoque
      -- Tratamento de Fardo vs Unidade pode ser ajustado modificando a regra de stock abaixo
      UPDATE public.products 
      SET stock = GREATEST(0, stock - v_qty_to_pay)
      WHERE id = v_product_id;
    END IF;
  END LOOP;

  -- 4. Atualizar os totais da Via Fechada (Receita)
  v_partial_total := v_partial_subtotal + p_service_fee;
  UPDATE public.orders 
  SET 
    subtotal = v_partial_subtotal,
    total = v_partial_total
  WHERE id = v_new_partial_order_id;

  -- 5. Se houve pagamento de taxa de serviço (comissão), lançar no financeiro do Garçom
  IF p_service_fee > 0 AND v_waiter_id IS NOT NULL THEN
     INSERT INTO public.commission_logs (
       waiter_id, order_id, amount, status, type, description
     ) VALUES (
       v_waiter_id, v_new_partial_order_id, p_service_fee, 'PAID', 'COMMISSION', 'Taxa de serviço (Pagamento Parcial)'
     );
  END IF;

  -- 6. Recalcular os totais da Mesa Mãe que continuará aberta
  SELECT COALESCE(SUM(total), 0) INTO v_remaining_subtotal 
  FROM public.order_items 
  WHERE order_id = v_current_order_id;

  -- Recalcula 10% se o pedido tinha service fee aplicado (Simplificação, assume 10% padrão)
  -- Se a mesa mãe estiver com serviço incluso, mantemos 10% no restante.
  UPDATE public.orders 
  SET 
    subtotal = v_remaining_subtotal,
    service_fee = CASE WHEN service_fee > 0 THEN ROUND((v_remaining_subtotal * 0.10), 2) ELSE 0 END,
    total = ROUND((v_remaining_subtotal + (CASE WHEN service_fee > 0 THEN (v_remaining_subtotal * 0.10) ELSE 0 END) - discount), 2)
  WHERE id = v_current_order_id;

END;
$$;
