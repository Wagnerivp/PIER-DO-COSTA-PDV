import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { CATEGORIES } from '../constants';
import { ShoppingCart, Plus, Minus, Trash2, Send, Percent, DollarSign, Package, Users, PlusCircle, X, Box } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { EditableNumber } from '../components/EditableNumber';

export const Wholesale = () => {
    const { products, updateProduct, customers, addCustomer } = useApp();
    const [activeTab, setActiveTab] = useState(CATEGORIES[0]?.id);
    const [quoteItems, setQuoteItems] = useState<{ id: string; productId: string; type: 'UNIT' | 'BOX'; quantity: number; price: number; boxSize: number }[]>([]);
    
    // Product Search in Quote
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);

    // Customer Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerPhone, setCustomerPhone] = useState(''); // Used for new or editing

    // Product Creation Modal
    const { addProduct } = useApp();
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductCost, setNewProductCost] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductStock, setNewProductStock] = useState('');
    const [newProductBoxSize, setNewProductBoxSize] = useState('1');

    const handleCreateProduct = () => {
        if (!newProductName || !newProductCost || !newProductPrice) {
            alert("Preencha o nome, custo e preço de varejo.");
            return;
        }

        const cost = parseFloat(newProductCost.replace(',', '.'));
        const price = parseFloat(newProductPrice.replace(',', '.'));
        const stock = parseInt(newProductStock, 10) || 0;
        const wholesaleBoxSize = parseInt(newProductBoxSize, 10) || 1;

        if (isNaN(cost) || isNaN(price)) {
            alert("Valores numéricos inválidos.");
            return;
        }

        const newProduct = {
            id: `prod-${Date.now()}`,
            name: newProductName,
            categoryId: activeTab, // Creates it in the current category
            cost,
            price,
            stock,
            wholesaleMargin: 0,
            wholesalePrice: cost,
            wholesaleBoxSize
        };

        addProduct(newProduct);
        setIsProductModalOpen(false);
        setNewProductName('');
        setNewProductCost('');
        setNewProductPrice('');
        setNewProductStock('');
        setNewProductBoxSize('1');
    };

    const currentCategoryProducts = products.filter(p => p.categoryId === activeTab);

    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleUpdateMargin = (product: any, marginText: string) => {
        const margin = parseFloat(marginText);
        if (isNaN(margin)) return;
        const newWholesalePrice = product.cost * (1 + margin / 100);
        updateProduct({ ...product, wholesaleMargin: margin, wholesalePrice: newWholesalePrice });
    };

    const handleUpdatePrice = (product: any, priceText: string) => {
        const price = parseFloat(priceText);
        if (isNaN(price)) return;
        const newMargin = product.cost > 0 ? ((price - product.cost) / product.cost) * 100 : 0;
        updateProduct({ ...product, wholesalePrice: price, wholesaleMargin: newMargin });
    };

    const handleUpdateBoxSize = (product: any, sizeText: string) => {
        const size = parseInt(sizeText, 10);
        if (isNaN(size) || size < 1) return;
        updateProduct({ ...product, wholesaleBoxSize: size });
    };

    const handleUpdateBoxPrice = (product: any, boxPriceText: string) => {
        const boxPrice = parseFloat(boxPriceText);
        if (isNaN(boxPrice)) return;
        const boxSize = product.wholesaleBoxSize || 1;
        const unitPrice = boxPrice / boxSize;
        const newMargin = product.cost > 0 ? ((unitPrice - product.cost) / product.cost) * 100 : 0;
        updateProduct({ ...product, wholesalePrice: unitPrice, wholesaleMargin: newMargin });
    };

    const handleAddToQuote = (product: any, type: 'UNIT' | 'BOX') => {
        const currentPrice = product.wholesalePrice || product.price;
        const boxSize = product.wholesaleBoxSize || 1;
        const itemPrice = type === 'BOX' ? currentPrice * boxSize : currentPrice;
        const itemId = `${product.id}-${type}`;
        
        const existing = quoteItems.find(i => i.id === itemId);
        if (existing) {
            setQuoteItems(quoteItems.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1, price: itemPrice, boxSize } : i));
        } else {
            setQuoteItems([...quoteItems, { id: itemId, productId: product.id, type, quantity: 1, price: itemPrice, boxSize }]);
        }
    };

    const handleUpdateQuoteQuantity = (id: string, delta: number) => {
        setQuoteItems(quoteItems.map(i => {
            if (i.id === id) {
                return { ...i, quantity: Math.max(1, i.quantity + delta) };
            }
            return i;
        }));
    };

    const handleRemoveFromQuote = (id: string) => {
        setQuoteItems(quoteItems.filter(i => i.id !== id));
    };

    const quoteTotal = quoteItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCreateCustomer = () => {
        if (!searchTerm || !customerPhone) {
            alert('Por favor, preencha o nome e o WhatsApp para cadastrar o cliente.');
            return;
        }
        const newCustomer = {
            id: `cust-${Date.now()}`,
            name: searchTerm,
            phone: customerPhone
        };
        addCustomer(newCustomer);
        setSelectedCustomer(newCustomer);
        setShowSuggestions(false);
        alert('Cliente cadastrado com sucesso!');
    };

    const handleSendQuote = () => {
        const phoneToSend = selectedCustomer?.phone || customerPhone;
        const nameToSend = selectedCustomer?.name || searchTerm;

        if (!phoneToSend) {
            alert('Por favor, selecione ou informe o telefone do cliente.');
            return;
        }

        let msg = `*Orçamento - Pier do Costa*\n`;
        if (nameToSend) msg += `Cliente: ${nameToSend}\n`;
        msg += `------------------------\n`;
        quoteItems.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const typeText = item.type === 'BOX' ? `Cx (${item.boxSize} un)` : 'Un';
                msg += `${item.quantity}x ${product.name} - ${typeText} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
            }
        });
        msg += `------------------------\n`;
        msg += `*Total: R$ ${quoteTotal.toFixed(2)}*\n\n`;
        msg += `Válido por 7 dias.`;

        const encodedMsg = encodeURIComponent(msg);
        const cleanPhone = phoneToSend.replace(/\D/g, '');
        window.open(`https://wa.me/55${cleanPhone}?text=${encodedMsg}`, '_blank');
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-4 animate-fade-in p-4 max-w-7xl mx-auto w-full">
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 shrink-0 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Package className="text-pier-neon" /> Catálogo Atacado
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Defina margens e preços de atacado para seus produtos de forma independente do PDV</p>
                    </div>
                    <button 
                        onClick={() => setIsProductModalOpen(true)}
                        className="bg-pier-neon/20 hover:bg-pier-neon text-pier-neon hover:text-black px-4 py-2 rounded-xl transition-colors font-bold flex items-center gap-2 border border-pier-neon/30 hover:border-pier-neon"
                    >
                        <Plus size={18} /> Novo Produto
                    </button>
                </div>

                {/* Categories Tabs */}
                <div className="flex overflow-x-auto scrollbar-none border-b border-white/10 shrink-0 bg-black/20">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-6 py-4 flex items-center gap-2 font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === cat.id ? 'border-pier-neon text-pier-neon bg-pier-neon/5' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span>{cat.icon}</span> {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                    {currentCategoryProducts.map(product => {
                        const boxSize = product.wholesaleBoxSize || 1;
                        const margin = product.wholesaleMargin !== undefined ? product.wholesaleMargin.toFixed(1) : (product.cost > 0 ? ((product.price - product.cost) / product.cost * 100).toFixed(1) : '0.0');
                        const priceUn = product.wholesalePrice !== undefined ? product.wholesalePrice.toFixed(2) : product.price.toFixed(2);
                        const priceCx = (parseFloat(priceUn) * boxSize).toFixed(2);
                        const profitUn = (parseFloat(priceUn) - product.cost).toFixed(2);

                        return (
                            <div key={product.id} className="flex flex-col p-4 bg-slate-800/50 rounded-xl border border-white/5 gap-4 hover:border-white/10 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-lg truncate">{product.name}</h3>
                                    <div className="flex items-center gap-4 text-xs mt-1">
                                        <span className="text-slate-400">Custo: <strong className="text-slate-300">R$ {product.cost.toFixed(2)}</strong></span>
                                        <span className="text-slate-400">Lucro Un: <strong className="text-green-400">R$ {profitUn}</strong></span>
                                        <span className="text-slate-400">Estoque: <strong className="text-pier-neon">{product.stock}</strong></span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {/* Unidade configs */}
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-wrap items-end justify-between gap-4">
                                        <div className="flex flex-wrap items-end gap-3">
                                            <div className="flex flex-col gap-1 w-24">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">Margem Un (%)</label>
                                                <EditableNumber 
                                                    value={margin}
                                                    onChange={(val) => handleUpdateMargin(product, val)}
                                                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-pier-neon outline-none"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 w-28">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">Preço Un (R$)</label>
                                                <EditableNumber 
                                                    value={priceUn}
                                                    onChange={(val) => handleUpdatePrice(product, val)}
                                                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-pier-neon font-mono text-sm font-bold focus:border-pier-neon outline-none"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddToQuote(product, 'UNIT')}
                                            className="w-full sm:w-auto hover:bg-pier-neon bg-pier-neon/10 text-pier-neon hover:text-black px-6 py-2 rounded-lg transition-colors text-sm font-bold border border-pier-neon/30 whitespace-nowrap h-[42px] flex items-center justify-center"
                                        >
                                            +1 Unidade
                                        </button>
                                    </div>

                                    {/* Caixa configs */}
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-wrap items-end justify-between gap-4">
                                        <div className="flex flex-wrap items-end gap-3">
                                            <div className="flex flex-col gap-1 w-24">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">Un por Caixa</label>
                                                <EditableNumber 
                                                    value={boxSize}
                                                    onChange={(val) => handleUpdateBoxSize(product, val)}
                                                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-green-400 outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 w-28">
                                                <label className="text-[10px] text-slate-400 uppercase font-bold">Preço Cx (R$)</label>
                                                <EditableNumber 
                                                    value={priceCx}
                                                    onChange={(val) => handleUpdateBoxPrice(product, val)}
                                                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-green-400 font-mono text-sm font-bold focus:border-green-400 outline-none"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddToQuote(product, 'BOX')}
                                            className="w-full sm:w-auto hover:bg-green-400 bg-green-400/10 text-green-400 hover:text-black px-6 py-2 rounded-lg transition-colors text-sm font-bold border border-green-400/30 whitespace-nowrap h-[42px] flex items-center justify-center"
                                        >
                                            +1 Caixa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {currentCategoryProducts.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            Nenhum produto nesta categoria.
                        </div>
                    )}
                </div>
            </div>

            {/* Quote Sidebar */}
            <div className="w-full md:w-96 flex flex-col bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shrink-0">
                <div className="p-4 border-b border-white/10 bg-black/20 flex flex-col gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="text-white" />
                        <h2 className="text-xl font-bold text-white">Orçamento</h2>
                    </div>
                    
                    {/* Product Search */}
                    <div className="relative z-10">
                        <input 
                            type="text" 
                            placeholder="Buscar produto para adicionar..."
                            value={productSearchTerm}
                            onChange={(e) => {
                                setProductSearchTerm(e.target.value);
                                setShowProductSuggestions(true);
                            }}
                            onFocus={() => setShowProductSuggestions(true)}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-pier-neon outline-none"
                        />
                        {showProductSuggestions && productSearchTerm.trim() !== '' && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                {products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())).length > 0 ? (
                                    products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())).map(product => {
                                        const priceUn = product.wholesalePrice !== undefined ? product.wholesalePrice : product.price;
                                        const boxSize = product.wholesaleBoxSize || 1;
                                        const priceCx = priceUn * boxSize;

                                        return (
                                            <div key={product.id} className="p-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                <div className="text-white font-bold text-sm mb-1">{product.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            handleAddToQuote(product, 'UNIT');
                                                            setProductSearchTerm('');
                                                            setShowProductSuggestions(false);
                                                        }}
                                                        className="flex-1 text-xs bg-pier-neon/10 text-pier-neon hover:bg-pier-neon hover:text-black py-1 rounded transition-colors border border-pier-neon/30"
                                                    >
                                                        +1 Un (R$ {priceUn.toFixed(2)})
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            handleAddToQuote(product, 'BOX');
                                                            setProductSearchTerm('');
                                                            setShowProductSuggestions(false);
                                                        }}
                                                        className="flex-1 text-xs bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-black py-1 rounded transition-colors border border-green-400/30"
                                                    >
                                                        +1 Cx (R$ {priceCx.toFixed(2)})
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-3 text-sm text-slate-400 text-center">Nenhum produto encontrado.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin" onClick={() => setShowProductSuggestions(false)}>
                    {quoteItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p>O orçamento está vazio</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {quoteItems.map(item => {
                                const product = products.find(p => p.id === item.productId);
                                if (!product) return null;
                                return (
                                    <div key={item.id} className="flex flex-col gap-2 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-white text-sm block">{product.name}</span>
                                                <span className="text-xs text-slate-400">
                                                    {item.type === 'BOX' ? `Caixa c/ ${item.boxSize} un` : 'Unidade'} (R$ {item.price.toFixed(2)})
                                                </span>
                                            </div>
                                            <button onClick={() => handleRemoveFromQuote(item.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleUpdateQuoteQuantity(item.id, -1)}
                                                    className="w-8 h-8 rounded-lg bg-black/50 hover:bg-black border border-white/10 flex items-center justify-center text-white transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-white font-mono w-6 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleUpdateQuoteQuantity(item.id, 1)}
                                                    className="w-8 h-8 rounded-lg bg-black/50 hover:bg-black border border-white/10 flex items-center justify-center text-white transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="text-pier-neon font-mono font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20 shrink-0 space-y-4">
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-slate-400">Total</span>
                        <span className="text-2xl font-bold text-white font-mono">R$ {quoteTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2 relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-300">Cliente</span>
                        </div>
                        
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Buscar ou cadastrar nome..."
                                value={selectedCustomer ? selectedCustomer.name : searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedCustomer(null);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-pier-neon outline-none"
                            />
                            {showSuggestions && searchTerm && !selectedCustomer && (
                                <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 flex flex-col scrollbar-thin">
                                    {filteredCustomers.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedCustomer(c);
                                                setSearchTerm(c.name);
                                                setCustomerPhone(c.phone);
                                                setShowSuggestions(false);
                                            }}
                                            className="text-left px-3 py-2 text-sm text-white hover:bg-pier-neon hover:text-black transition-colors flex justify-between"
                                        >
                                            <span>{c.name}</span>
                                            <span className="opacity-70 text-xs">{c.phone}</span>
                                        </button>
                                    ))}
                                    {filteredCustomers.length === 0 && (
                                        <div className="px-3 py-2 text-xs text-slate-400 bg-slate-900/50">Nenhum cliente encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!selectedCustomer && (
                            <div className="flex gap-2">
                                <input 
                                    type="tel" 
                                    placeholder="WhatsApp (ex: 21999999999)"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-pier-neon outline-none"
                                />
                                <button 
                                    onClick={handleCreateCustomer}
                                    className="bg-pier-neon/20 hover:bg-pier-neon text-pier-neon hover:text-black px-3 rounded-lg border border-pier-neon/30 hover:border-pier-neon transition-colors flex items-center justify-center"
                                    title="Cadastrar Novo Cliente"
                                >
                                    <PlusCircle size={20} />
                                </button>
                            </div>
                        )}
                        {selectedCustomer && (
                             <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-white/5">
                                <span className="text-xs text-slate-400">WhatsApp: {selectedCustomer.phone}</span>
                                <button 
                                    onClick={() => {
                                        setSelectedCustomer(null);
                                        setSearchTerm('');
                                        setCustomerPhone('');
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 underline"
                                >
                                    Limpar
                                </button>
                             </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSendQuote}
                        disabled={quoteItems.length === 0}
                        className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        Enviar Orçamento
                    </button>
                </div>
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Box className="text-pier-neon" /> Novo Produto
                            </h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Nome do Produto</label>
                                <input 
                                    type="text" 
                                    value={newProductName}
                                    onChange={e => setNewProductName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pier-neon outline-none"
                                    placeholder="Ex: Cerveja Artesanal"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Custo (R$)</label>
                                    <input 
                                        type="text" 
                                        inputMode="decimal"
                                        value={newProductCost}
                                        onChange={e => setNewProductCost(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pier-neon outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Varejo (R$)</label>
                                    <input 
                                        type="text" 
                                        inputMode="decimal"
                                        value={newProductPrice}
                                        onChange={e => setNewProductPrice(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pier-neon outline-none"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Estoque Inicial</label>
                                    <input 
                                        type="number" 
                                        value={newProductStock}
                                        onChange={e => setNewProductStock(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pier-neon outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Qtd. por Caixa</label>
                                    <input 
                                        type="number" 
                                        value={newProductBoxSize}
                                        onChange={e => setNewProductBoxSize(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pier-neon outline-none"
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={() => setIsProductModalOpen(false)}
                                className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCreateProduct}
                                className="flex-1 py-3 bg-pier-neon hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors"
                            >
                                Salvar Produto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

