import { Category, Product, Table, User } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Administrativo', role: 'ADMIN', pin: '1111', commissionBalance: 0 },
  { id: 'u2', name: 'Garçom', role: 'WAITER', pin: '2222', commissionBalance: 0 },
  { id: 'u3', name: 'Caixa', role: 'CASHIER', pin: '3333', commissionBalance: 0 },
];

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Cervejas', icon: '🍺' },
  { id: 'c6', name: 'Na Brasa', icon: '🍗' },
  { id: 'c3', name: 'Petiscos', icon: '🍤' },
  { id: 'c2', name: 'Drinks', icon: '🍹' },
  { id: 'c5', name: 'Doses', icon: '🥃' },
  { id: 'c4', name: 'Sem Álcool', icon: '🥤' },
];


export const INITIAL_PRODUCTS: Product[] = [
  // --- CERVEJAS 600ML ---
  { id: 'beer-01', name: 'Heineken 600ml', categoryId: 'c1', price: 15.00, cost: 9.00, stock: 100 },
  { id: 'beer-02', name: 'Brahma 600ml', categoryId: 'c1', price: 11.00, cost: 6.50, stock: 100 },
  { id: 'beer-03', name: 'Antarctica 600ml', categoryId: 'c1', price: 11.00, cost: 6.50, stock: 100 },
  { id: 'beer-04', name: 'Amstel 600ml', categoryId: 'c1', price: 11.00, cost: 6.50, stock: 100 },
  { id: 'beer-05', name: 'Original 600ml', categoryId: 'c1', price: 13.00, cost: 7.50, stock: 100 },
  { id: 'beer-06', name: 'Corona 600ml', categoryId: 'c1', price: 18.00, cost: 10.00, stock: 100 },
  { id: 'beer-07', name: 'Petra 600ml', categoryId: 'c1', price: 10.00, cost: 5.50, stock: 100 },
  { id: 'beer-08', name: 'Stella 600ml', categoryId: 'c1', price: 14.00, cost: 8.00, stock: 100 },
  { id: 'beer-09', name: 'Império 600ml', categoryId: 'c1', price: 11.00, cost: 6.00, stock: 100 },
  { id: 'beer-10', name: 'Eisenbahn 600ml', categoryId: 'c1', price: 11.00, cost: 6.00, stock: 100 },
  { id: 'beer-11', name: 'Budweiser 600ml', categoryId: 'c1', price: 14.00, cost: 8.00, stock: 100 },
  { id: 'beer-12', name: 'Brahma Duplo Malte 600ml', categoryId: 'c1', price: 12.00, cost: 7.00, stock: 100 },
  { id: 'beer-13', name: 'Itaipava 600ml', categoryId: 'c1', price: 9.00, cost: 5.00, stock: 100 },
  { id: 'beer-14', name: 'Lokal 600ml', categoryId: 'c1', price: 7.00, cost: 3.50, stock: 100 },

  // --- LATÃO ---
  { id: 'latao-01', name: 'Latão Heineken', categoryId: 'c1', price: 10.00, cost: 6.00, stock: 100 },
  { id: 'latao-02', name: 'Latão Brahma', categoryId: 'c1', price: 8.00, cost: 4.50, stock: 100 },
  { id: 'latao-03', name: 'Latão Antarctica', categoryId: 'c1', price: 8.00, cost: 4.50, stock: 100 },
  { id: 'latao-04', name: 'Latão Amstel', categoryId: 'c1', price: 8.00, cost: 4.50, stock: 100 },
  { id: 'latao-05', name: 'Latão Original', categoryId: 'c1', price: 10.00, cost: 6.00, stock: 100 },
  { id: 'latao-06', name: 'Latão Corona', categoryId: 'c1', price: 12.00, cost: 7.00, stock: 100 },
  { id: 'latao-07', name: 'Latão Petra', categoryId: 'c1', price: 7.00, cost: 4.00, stock: 100 },
  { id: 'latao-08', name: 'Latão Stella', categoryId: 'c1', price: 10.00, cost: 6.00, stock: 100 },
  { id: 'latao-09', name: 'Latão Império', categoryId: 'c1', price: 8.00, cost: 4.50, stock: 100 },
  { id: 'latao-10', name: 'Latão Eisenbahn', categoryId: 'c1', price: 9.00, cost: 5.00, stock: 100 },
  { id: 'latao-11', name: 'Latão Budweiser', categoryId: 'c1', price: 10.00, cost: 6.00, stock: 100 },
  { id: 'latao-12', name: 'Latão Brahma Duplo 350ml', categoryId: 'c1', price: 7.00, cost: 4.00, stock: 100 },
  { id: 'latao-13', name: 'Latão Brahma Duplo', categoryId: 'c1', price: 9.00, cost: 5.00, stock: 100 },
  { id: 'latao-14', name: 'Latão Itaipava', categoryId: 'c1', price: 6.00, cost: 3.50, stock: 100 },
  { id: 'latao-15', name: 'Latão Lokal', categoryId: 'c1', price: 5.00, cost: 2.50, stock: 100 },

  // --- LONG NECK ---
  { id: 'ln-01', name: 'Long Neck Heineken', categoryId: 'c1', price: 10.00, cost: 5.50, stock: 100 },
  { id: 'ln-02', name: 'Long Neck Heineken Zero', categoryId: 'c1', price: 10.00, cost: 5.50, stock: 100 },
  { id: 'ln-03', name: 'Long Neck Corona', categoryId: 'c1', price: 12.00, cost: 7.00, stock: 100 },
  { id: 'ln-04', name: 'Long Neck Stella', categoryId: 'c1', price: 11.00, cost: 6.00, stock: 100 },
  { id: 'ln-05', name: 'Long Neck Eisenbahn', categoryId: 'c1', price: 10.00, cost: 5.50, stock: 100 },
  { id: 'ln-06', name: 'Long Neck Budweiser', categoryId: 'c1', price: 11.00, cost: 6.00, stock: 100 },
  { id: 'ln-07', name: 'Long Neck Stella Gold', categoryId: 'c1', price: 11.00, cost: 6.00, stock: 100 },
  { id: 'ln-08', name: 'Long Neck Império Gold', categoryId: 'c1', price: 7.00, cost: 4.00, stock: 100 },

  // --- SEM ÁLCOOL ---
  { id: 'na-01', name: 'Refrigerante Lata', categoryId: 'c4', price: 6.00, cost: 2.50, stock: 100 },
  { id: 'na-02', name: 'Refrigerante 2 Litros', categoryId: 'c4', price: 15.00, cost: 8.00, stock: 50 },
  { id: 'na-03', name: 'Matte', categoryId: 'c4', price: 5.00, cost: 2.00, stock: 100 },
  { id: 'na-04', name: 'Guaravita', categoryId: 'c4', price: 3.00, cost: 1.00, stock: 100 },
  { id: 'na-05', name: 'Água 510ml', categoryId: 'c4', price: 3.00, cost: 1.00, stock: 200 },
  { id: 'na-06', name: 'Água 1,5L', categoryId: 'c4', price: 6.00, cost: 2.50, stock: 100 },
  { id: 'na-07', name: 'Água com Gás 510ml', categoryId: 'c4', price: 5.00, cost: 2.00, stock: 100 },
  { id: 'na-08', name: 'Água com Gás 1,5L', categoryId: 'c4', price: 9.00, cost: 4.00, stock: 50 },
  { id: 'na-09', name: 'Gatorade', categoryId: 'c4', price: 10.00, cost: 5.00, stock: 50 },
  { id: 'na-10', name: 'Red Bull', categoryId: 'c4', price: 15.00, cost: 8.00, stock: 100 },
  { id: 'na-11', name: 'H2O', categoryId: 'c4', price: 8.00, cost: 4.00, stock: 100 },
  { id: 'na-12', name: 'Suco 300ml', categoryId: 'c4', price: 3.00, cost: 1.50, stock: 100 },
  { id: 'na-13', name: 'Suco 500ml', categoryId: 'c4', price: 5.00, cost: 2.50, stock: 100 },
  { id: 'na-14', name: 'Gelo de Sabor', categoryId: 'c4', price: 8.00, cost: 2.00, stock: 100 },
  { id: 'na-15', name: 'Caldo de Cana 300ml', categoryId: 'c4', price: 5.00, cost: 1.50, stock: 50 },
  { id: 'na-16', name: 'Caldo de Cana 500ml', categoryId: 'c4', price: 7.00, cost: 2.50, stock: 50 },

  // --- DOSES / DESTILADOS ---
  { id: 'ds-01', name: 'Dose Praianinha', categoryId: 'c5', price: 3.00, cost: 0.50, stock: 100 },
  { id: 'ds-02', name: 'Dose Velho Barreiro', categoryId: 'c5', price: 3.00, cost: 0.50, stock: 100 },
  { id: 'ds-03', name: 'Dose Mineira', categoryId: 'c5', price: 3.00, cost: 0.50, stock: 100 },
  { id: 'ds-04', name: 'Dose Ypioca', categoryId: 'c5', price: 4.00, cost: 1.00, stock: 100 },
  { id: 'ds-05', name: 'Dose Cachaça Ouro 51', categoryId: 'c5', price: 5.00, cost: 1.50, stock: 100 },
  { id: 'ds-06', name: 'Dose Genebra', categoryId: 'c5', price: 5.00, cost: 1.50, stock: 100 },
  { id: 'ds-07', name: 'Dose Smirnoff', categoryId: 'c5', price: 6.00, cost: 2.00, stock: 100 },
  { id: 'ds-08', name: 'Dose Bacardy', categoryId: 'c5', price: 6.00, cost: 2.00, stock: 100 },
  { id: 'ds-09', name: 'Dose Fogo Paulista', categoryId: 'c5', price: 5.00, cost: 1.50, stock: 100 },
  { id: 'ds-10', name: 'Dose Domecq', categoryId: 'c5', price: 5.00, cost: 1.50, stock: 100 },
  { id: 'ds-11', name: 'Dose Gin Gordons', categoryId: 'c5', price: 9.00, cost: 3.00, stock: 100 },
  { id: 'ds-12', name: 'Dose Campari', categoryId: 'c5', price: 8.00, cost: 2.50, stock: 100 },
  { id: 'ds-13', name: 'Vinho Caneca', categoryId: 'c5', price: 15.00, cost: 5.00, stock: 100 },
  { id: 'ds-14', name: 'Dose Tequila El Loco', categoryId: 'c5', price: 8.00, cost: 2.50, stock: 100 },
  
  // --- WHISKY (Doses presumed) ---
  { id: 'wh-01', name: 'Dose Honey ou Jack', categoryId: 'c5', price: 20.00, cost: 8.00, stock: 100 },
  { id: 'wh-02', name: 'Dose Buchanas', categoryId: 'c5', price: 25.00, cost: 10.00, stock: 100 },
  { id: 'wh-03', name: 'Dose Red Label', categoryId: 'c5', price: 12.00, cost: 5.00, stock: 100 },
  { id: 'wh-04', name: 'Dose Ballantines', categoryId: 'c5', price: 12.00, cost: 5.00, stock: 100 },
  { id: 'wh-05', name: 'Dose White Horse', categoryId: 'c5', price: 10.00, cost: 4.00, stock: 100 },
  { id: 'wh-06', name: 'Dose Old Eight', categoryId: 'c5', price: 6.00, cost: 2.00, stock: 100 },
  { id: 'wh-07', name: 'Dose Drurys', categoryId: 'c5', price: 6.00, cost: 2.00, stock: 100 },

  // --- DRINKS & VINHOS ---
  { id: 'dr-01', name: 'Gin Tônica (Skol GT)', categoryId: 'c2', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'dr-02', name: 'Gin Tônica (Senses)', categoryId: 'c2', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'dr-03', name: 'Chopp de Vinho', categoryId: 'c2', price: 16.00, cost: 8.00, stock: 100 }, // Assuming highest price
  { id: 'dr-04', name: 'Ice 51 Sabores', categoryId: 'c2', price: 10.00, cost: 5.00, stock: 100 },
  { id: 'dr-05', name: 'Smirnoff Ice', categoryId: 'c2', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'dr-06', name: 'Pink Moon', categoryId: 'c2', price: 8.00, cost: 4.00, stock: 100 },
  { id: 'dr-07', name: 'Copão 500ml (Vodka/Energético)', categoryId: 'c2', price: 20.00, cost: 8.00, stock: 100 },
  { id: 'dr-08', name: 'Copão c/ Whisky', categoryId: 'c2', price: 25.00, cost: 10.00, stock: 100 },
  { id: 'dr-09', name: 'Espumante Casa Perini', categoryId: 'c2', price: 90.00, cost: 50.00, stock: 20 },

  // --- NA BRASA / REFEIÇÕES ---
  { id: 'br-01', name: 'Frango Assado', categoryId: 'c6', price: 49.90, cost: 25.00, stock: 50 },
  { id: 'br-02', name: 'Costela no Bafo', categoryId: 'c6', price: 69.90, cost: 35.00, stock: 50 },
  { id: 'br-03', name: 'Peito Recheado c/ Calabresa', categoryId: 'c6', price: 69.90, cost: 35.00, stock: 50 },
  { id: 'br-04', name: 'Cupim no Bafo', categoryId: 'c6', price: 69.90, cost: 35.00, stock: 50 },
  { id: 'br-05', name: 'Linguiça (Unidade)', categoryId: 'c6', price: 4.00, cost: 2.00, stock: 100 },
  { id: 'br-06', name: 'Misto Costela e Cupim', categoryId: 'c6', price: 75.00, cost: 40.00, stock: 50 },
  { id: 'br-07', name: 'Churrasco Carne', categoryId: 'c6', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'br-08', name: 'Churrasco Frango', categoryId: 'c6', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'br-09', name: 'Churrasco Linguiça', categoryId: 'c6', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'br-10', name: 'Churrasco Misto', categoryId: 'c6', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'br-11', name: 'Churrasco Coração', categoryId: 'c6', price: 12.00, cost: 6.00, stock: 100 },
  { id: 'br-12', name: 'Churrasco Salsichão', categoryId: 'c6', price: 10.00, cost: 5.00, stock: 100 },
  { id: 'br-13', name: 'Churrasco Medalhão', categoryId: 'c6', price: 14.00, cost: 7.00, stock: 100 },
  { id: 'br-14', name: 'Especial do Pier', categoryId: 'c6', price: 15.00, cost: 7.00, stock: 100 },
  
  // Acompanhamentos e Porções "Na Brasa"
  { id: 'br-15', name: 'Tropeiro', categoryId: 'c6', price: 18.00, cost: 8.00, stock: 100 },
  { id: 'br-16', name: 'Salpicão', categoryId: 'c6', price: 18.00, cost: 8.00, stock: 100 },
  { id: 'br-17', name: 'Torresmo', categoryId: 'c6', price: 20.00, cost: 8.00, stock: 100 },
  { id: 'br-18', name: 'Arroz', categoryId: 'c6', price: 14.00, cost: 4.00, stock: 100 },
  { id: 'br-19', name: 'Farofa', categoryId: 'c6', price: 8.00, cost: 2.00, stock: 100 },
  { id: 'br-20', name: 'Salada', categoryId: 'c6', price: 8.00, cost: 3.00, stock: 100 },
  { id: 'br-21', name: 'Vinagrete', categoryId: 'c6', price: 8.00, cost: 3.00, stock: 100 },
  { id: 'br-22', name: 'Aipim 200g', categoryId: 'c6', price: 10.00, cost: 4.00, stock: 100 },
  { id: 'br-23', name: 'Batata Frita 200g', categoryId: 'c6', price: 10.00, cost: 4.00, stock: 100 },

  // Caldos
  { id: 'cd-01', name: 'Caldo Mocotó', categoryId: 'c6', price: 22.00, cost: 8.00, stock: 50 },
  { id: 'cd-02', name: 'Caldo Dobradinha', categoryId: 'c6', price: 22.00, cost: 8.00, stock: 50 },
  { id: 'cd-03', name: 'Sopa de Ervilha', categoryId: 'c6', price: 22.00, cost: 8.00, stock: 50 },
  { id: 'cd-04', name: 'Caldo Verde', categoryId: 'c6', price: 22.00, cost: 8.00, stock: 50 },
  { id: 'cd-05', name: 'Costela com Batata', categoryId: 'c6', price: 22.00, cost: 8.00, stock: 50 },

  // --- PETISCOS ---
  { id: 'pt-01', name: 'Salaminho', categoryId: 'c3', price: 19.00, cost: 10.00, stock: 50 },
  { id: 'pt-02', name: 'Mini Pastel c/ 10', categoryId: 'c3', price: 25.00, cost: 8.00, stock: 100 },
  { id: 'pt-03', name: 'Porção Batata Frita', categoryId: 'c3', price: 25.00, cost: 8.00, stock: 100 },
  { id: 'pt-04', name: 'Porção Aipim', categoryId: 'c3', price: 28.00, cost: 10.00, stock: 100 },
  { id: 'pt-05', name: 'Batata Frita c/ Cheddar/Bacon', categoryId: 'c3', price: 32.00, cost: 12.00, stock: 100 },
  { id: 'pt-06', name: 'Bolinho de Bacalhau', categoryId: 'c3', price: 34.00, cost: 15.00, stock: 100 },
  { id: 'pt-07', name: 'Linguiça Mineira Acebolada', categoryId: 'c3', price: 40.00, cost: 18.00, stock: 100 },
  { id: 'pt-08', name: 'Frios', categoryId: 'c3', price: 40.00, cost: 20.00, stock: 50 },
  { id: 'pt-09', name: 'Frango a Passarinho', categoryId: 'c3', price: 45.00, cost: 20.00, stock: 50 },
  { id: 'pt-10', name: 'Calabresa Acebolada', categoryId: 'c3', price: 45.00, cost: 18.00, stock: 100 },
  { id: 'pt-11', name: 'Isca de Frango', categoryId: 'c3', price: 55.00, cost: 25.00, stock: 50 },
  { id: 'pt-12', name: 'Tulipa de Frango Especial', categoryId: 'c3', price: 60.00, cost: 30.00, stock: 50 },
  { id: 'pt-13', name: 'Contra Filé', categoryId: 'c3', price: 95.00, cost: 50.00, stock: 30 },

  // Salgados Unitários
  { id: 'sg-01', name: 'Coxinha', categoryId: 'c3', price: 8.00, cost: 3.00, stock: 100 },
  { id: 'sg-02', name: 'Enroladinho Salsicha', categoryId: 'c3', price: 8.00, cost: 3.00, stock: 100 },
  { id: 'sg-03', name: 'Kibe', categoryId: 'c3', price: 8.00, cost: 3.00, stock: 100 },
  { id: 'sg-04', name: 'Risole Calabresa', categoryId: 'c3', price: 8.00, cost: 3.00, stock: 100 },
  { id: 'sg-05', name: 'Travesseiro de Carne', categoryId: 'c3', price: 8.00, cost: 3.00, stock: 100 },

  // Pastéis Comuns
  { id: 'pas-01', name: 'Pastel Carne', categoryId: 'c3', price: 12.00, cost: 5.00, stock: 100 },
  { id: 'pas-02', name: 'Pastel Frango', categoryId: 'c3', price: 12.00, cost: 5.00, stock: 100 },
  { id: 'pas-03', name: 'Pastel Calabresa', categoryId: 'c3', price: 12.00, cost: 5.00, stock: 100 },
  { id: 'pas-04', name: 'Pastel Queijo', categoryId: 'c3', price: 12.00, cost: 5.00, stock: 100 },
  { id: 'pas-05', name: 'Pastel Napolitano', categoryId: 'c3', price: 12.00, cost: 5.00, stock: 100 },

  // Pastéis Premium
  { id: 'pas-06', name: 'Pastel Carne Seca', categoryId: 'c3', price: 16.00, cost: 7.00, stock: 100 },
  { id: 'pas-07', name: 'Pastel Costela', categoryId: 'c3', price: 16.00, cost: 7.00, stock: 100 },
  { id: 'pas-08', name: 'Pastel Camarão', categoryId: 'c3', price: 16.00, cost: 7.00, stock: 100 },
  { id: 'pas-09', name: 'Pastel Bacalhau', categoryId: 'c3', price: 16.00, cost: 7.00, stock: 100 },

];

export const INITIAL_TABLES: Table[] = [
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `t${i + 1}`,
    number: i + 1,
    status: 'AVAILABLE' as 'AVAILABLE',
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `b${i + 1}`,
    number: 100 + i + 1,
    status: 'AVAILABLE' as 'AVAILABLE',
    customName: `Balcão ${i + 1}`
  }))
];