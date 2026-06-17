-- ==========================================
-- Função: processar_pagamento_agrupado
-- Descrição: Processa o pagamento de múltiplos itens de uma mesa simultaneamente, com rateio ou divisão total.
-- ==========================================

CREATE OR REPLACE FUNCTION processar_pagamento_agrupado(
    p_mesa_id uuid,
    p_itens jsonb, -- [{ "id_pedido_item": "uuid", "quantidade_paga": 2 }, ...]
    p_metodo_pagamento text,
    p_taxa_servico numeric,
    p_desconto numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id uuid;
    v_total_produtos numeric := 0;
    v_item RECORD;
    v_row RECORD;
    v_qtd_restante integer;
    v_valor_item numeric;
    v_total_operacao numeric;
    v_financeiro_id uuid;
BEGIN
    -- 1. Identificar o pedido atual da mesa
    SELECT current_order_id INTO v_order_id
    FROM public.tables
    WHERE id = p_mesa_id AND status IN ('OCCUPIED', 'PAYMENT_PENDING');

    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'Mesa não possui um pedido ativo para pagamento.';
    END IF;

    -- 2. Iterar sobre os itens no JSONB para atualizar (ou realizar split) e somar valor
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_itens) AS x(id_pedido_item uuid, quantidade_paga integer)
    LOOP
        -- Buscar o item da comanda
        SELECT * INTO v_row
        FROM public.order_items
        WHERE id = v_item.id_pedido_item AND order_id = v_order_id AND status = 'PENDING';

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Item pendente % não encontrado no pedido %', v_item.id_pedido_item, v_order_id;
        END IF;

        IF v_item.quantidade_paga <= 0 THEN
            CONTINUE; -- ignora itens com 0
        END IF;

        IF v_item.quantidade_paga > v_row.quantity THEN
            RAISE EXCEPTION 'Tentativa de pagar quantidade maior que a pedida. Produto: %', v_row.product_name;
        END IF;

        v_valor_item := v_row.price * v_item.quantidade_paga;
        v_total_produtos := v_total_produtos + v_valor_item;

        v_qtd_restante := v_row.quantity - v_item.quantidade_paga;

        IF v_qtd_restante > 0 THEN
            -- A quantidade a pagar é menor que a total no item (SPLIT)
            -- Atualiza o item original subtraindo a quantidade paga
            UPDATE public.order_items
            SET quantity = v_qtd_restante,
                total = price * v_qtd_restante
            WHERE id = v_item.id_pedido_item;

            -- Insere a nova linha representando a porção paga
            INSERT INTO public.order_items (
                order_id,
                product_id,
                product_name,
                quantity,
                price,
                total,
                status,
                category_id,
                stock_deducted,
                notes
            ) VALUES (
                v_row.order_id,
                v_row.product_id,
                v_row.product_name,
                v_item.quantidade_paga,
                v_row.price,
                v_valor_item,
                'PAID',
                v_row.category_id,
                v_row.stock_deducted, -- já foi deduzido ao fazer o pedido, mantemos true
                'Pagamento Parcial Agrupado'
            );
        ELSE
            -- Pagou a quantidade exata
            UPDATE public.order_items
            SET status = 'PAID'
            WHERE id = v_item.id_pedido_item;
        END IF;
    END LOOP;

    -- 3. Inserir a transação financeira consolidada
    v_total_operacao := v_total_produtos + p_taxa_servico - p_desconto;

    INSERT INTO public.financial_transactions (
        description,
        type,
        amount,
        payment_method,
        status,
        order_id,
        is_service_fee
    ) VALUES (
        'Pagamento Parcial de Mesa ' || (SELECT number::text FROM public.tables WHERE id = p_mesa_id),
        'INCOME',
        v_total_operacao,
        p_metodo_pagamento,
        'COMPLETED',
        v_order_id,
        false
    ) RETURNING id INTO v_financeiro_id;

    -- 4. Inserir um registro separado para a taxa de comissão se for > 0 para clareza (opcional no design atual, mas seguindo o padrão)
    IF p_taxa_servico > 0 THEN
        UPDATE public.financial_transactions 
        SET description = description || ' (+ Serviço)' 
        WHERE id = v_financeiro_id;
    END IF;

    -- 5. Atualizar subtotal da comanda geral restando itens PENDING
    UPDATE public.orders
    SET subtotal = (
        SELECT COALESCE(SUM(total), 0)
        FROM public.order_items
        WHERE order_id = v_order_id AND status = 'PENDING'
    )
    WHERE id = v_order_id;
    
    -- Retornar sucesso
    RETURN jsonb_build_object(
        'success', true,
        'total_pago', v_total_operacao,
        'transacao_id', v_financeiro_id
    );
END;
$$;
