-- ==========================================
-- Função: processar_pagamento_fracionado_agrupado
-- Transação segura para pagamento parcial de múltiplos itens com rateio.
-- ==========================================

CREATE OR REPLACE FUNCTION processar_pagamento_fracionado_agrupado(
    p_mesa_id text,
    p_itens_pagar jsonb, -- formato: [{"id_pedido_item": "uuid-do-item", "quantidade_paga": 2}]
    p_metodo_pagamento text,
    p_taxa_servico numeric,
    p_valor_total numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item RECORD;
    v_linha_item RECORD;
    v_qtd_restante integer;
    v_order_id text;
    v_financeiro_id uuid;
    v_total_produtos numeric := 0;
BEGIN
    -- 1. Identificar o pedido atual da mesa
    SELECT current_order_id INTO v_order_id
    FROM public.tables
    WHERE id = p_mesa_id AND status IN ('OCCUPIED', 'PAYMENT_PENDING');

    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'Mesa não possui um pedido ativo para pagamento.';
    END IF;

    -- 2. Loop pelos itens enviados e aplicação do Split
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_itens_pagar) AS x(id_pedido_item text, quantidade_paga integer)
    LOOP
        -- Buscar o item da comanda original
        SELECT * INTO v_linha_item
        FROM public.order_items
        WHERE id = v_item.id_pedido_item AND order_id = v_order_id AND status = 'PENDING'
        FOR UPDATE; -- Bloqueia a linha para evitar concorrência

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Item pendente % não encontrado no pedido %', v_item.id_pedido_item, v_order_id;
        END IF;

        IF v_item.quantidade_paga <= 0 THEN
            CONTINUE;
        END IF;

        IF v_item.quantidade_paga > v_linha_item.quantity THEN
            RAISE EXCEPTION 'Tentativa de fraude bloqueada: Quantidade a pagar (%) é maior que a quantidade restante na mesa (%) do produto %.', 
                v_item.quantidade_paga, v_linha_item.quantity, v_linha_item.product_name;
        END IF;

        -- Somar ao total de produtos validado na transação (opcional, para dupla verificação de p_valor_total)
        v_total_produtos := v_total_produtos + (v_linha_item.price * v_item.quantidade_paga);

        v_qtd_restante := v_linha_item.quantity - v_item.quantidade_paga;

        IF v_qtd_restante > 0 THEN
            -- SPLIT OCORRE AQUI (Quantidade paga é MENOR que a da mesa)
            
            -- 1. Atualizar a linha original mantendo o restante
            UPDATE public.order_items
            SET quantity = v_qtd_restante,
                total = price * v_qtd_restante
            WHERE id = v_item.id_pedido_item;

            -- 2. Inserir a nova linha clonada representando a porção PAGA
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
                v_linha_item.order_id,
                v_linha_item.product_id,
                v_linha_item.product_name,
                v_item.quantidade_paga,
                v_linha_item.price,
                (v_linha_item.price * v_item.quantidade_paga),
                'PAID',
                v_linha_item.category_id,
                v_linha_item.stock_deducted,
                'Pagamento Parcial Agrupado (Split)'
            );
        ELSE
            -- Quantidade paga é IGUAL a da mesa, apenas conclui o item
            UPDATE public.order_items
            SET status = 'PAID'
            WHERE id = v_item.id_pedido_item;
        END IF;

        -- Dar baixa na tabela de estoque
        UPDATE public.products
        SET stock = GREATEST(stock - v_item.quantidade_paga, 0)
        WHERE id = v_linha_item.product_id;

    END LOOP;

    -- 3. Inserir a entrada consolidada no financeiro
    INSERT INTO public.financial_transactions (
        description,
        type,
        amount,
        payment_method,
        status,
        order_id,
        is_service_fee
    ) VALUES (
        'Pagamento Parcial (Split) - Mesa ' || p_mesa_id,
        'INCOME',
        p_valor_total,
        p_metodo_pagamento,
        'COMPLETED',
        v_order_id,
        false
    ) RETURNING id INTO v_financeiro_id;

    -- Registrar a comissão (taxa de serviço) como uma transação separada ou complementar
    IF p_taxa_servico > 0 THEN
        UPDATE public.financial_transactions 
        SET description = description || ' | + R$ ' || p_taxa_servico || ' Serviço'
        WHERE id = v_financeiro_id;
    END IF;

    -- Sucesso: Efetiva o COMMIT implicitamente no fim do bloco
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Pagamento parcial fracionado processado com segurança',
        'transacao_id', v_financeiro_id
    );

EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro (ex: falta de internet, erro matemático, etc), transação será desfeita automaticamente
    RAISE WARNING 'Processamento cancelado: %', SQLERRM;
    RETURN jsonb_build_object(
        'success', false,
        'message', SQLERRM
    );
END;
$$;
