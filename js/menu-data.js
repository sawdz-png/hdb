// ============================================================
// DATOS DEL MENÚ — usados para armar el formulario de pedidos
// ============================================================
// Si cambiás precios o productos en index.html, actualizá también
// acá para que el formulario de pedidos quede igual a la carta.

const MENU = {
  hamburguesas: [
    { id: "san-carlos-doble", name: "San Carlos", variant: "Doble", price: 13860 },
    { id: "san-carlos-triple", name: "San Carlos", variant: "Triple", price: 16380 },
    { id: "san-carlos-cuadruple", name: "San Carlos", variant: "Cuádruple", price: 18900 },

    { id: "barrio-obrero-doble", name: "Barrio Obrero", variant: "Doble", price: 13860 },
    { id: "barrio-obrero-triple", name: "Barrio Obrero", variant: "Triple", price: 16380 },
    { id: "barrio-obrero-cuadruple", name: "Barrio Obrero", variant: "Cuádruple", price: 18900 },

    { id: "villa-zula-doble", name: "Villa Zula", variant: "Doble", price: 13860 },
    { id: "villa-zula-triple", name: "Villa Zula", variant: "Triple", price: 16380 },
    { id: "villa-zula-cuadruple", name: "Villa Zula", variant: "Cuádruple", price: 18900 },

    { id: "veggie-simple", name: "Veggie", variant: "Simple", price: 12500 },
    { id: "veggie-doble", name: "Veggie", variant: "Doble", price: 14500 },

    { id: "juan-b-justo-doble", name: "Juan B. Justo", variant: "Doble", price: 15000 },
    { id: "juan-b-justo-triple", name: "Juan B. Justo", variant: "Triple", price: 17520 },
    { id: "juan-b-justo-cuadruple", name: "Juan B. Justo", variant: "Cuádruple", price: 20040 },

    { id: "barrio-nautico-doble", name: "Barrio Náutico", variant: "Doble", price: 15000 },
    { id: "barrio-nautico-triple", name: "Barrio Náutico", variant: "Triple", price: 17520 },
    { id: "barrio-nautico-cuadruple", name: "Barrio Náutico", variant: "Cuádruple", price: 20040 },

    { id: "villa-paula-doble", name: "Villa Paula", variant: "Doble", price: 15000 },
    { id: "villa-paula-triple", name: "Villa Paula", variant: "Triple", price: 17520 },
    { id: "villa-paula-cuadruple", name: "Villa Paula", variant: "Cuádruple", price: 20040 },

    { id: "nueva-york-doble", name: "Nueva York", variant: "Doble", price: 15000 },
    { id: "nueva-york-triple", name: "Nueva York", variant: "Triple", price: 17520 },
    { id: "nueva-york-cuadruple", name: "Nueva York", variant: "Cuádruple", price: 20040 },

    { id: "banco-provincia-doble", name: "Banco Provincia", variant: "Doble", price: 13600 },
    { id: "banco-provincia-triple", name: "Banco Provincia", variant: "Triple", price: 16250 },
    { id: "banco-provincia-cuadruple", name: "Banco Provincia", variant: "Cuádruple", price: 18500 },

    { id: "simple-simple", name: "Simple", variant: "Simple", price: 12600 },

    { id: "palo-blanco-quintuple", name: "Palo Blanco", variant: "Quíntuple", price: 21000 },
  ],

  papas: [
    { id: "papas-solas", name: "Caja de papas solas", variant: null, price: 8000 },
    { id: "papas-cheddar", name: "Caja de papas con cheddar", variant: null, price: 10000 },
    { id: "papas-cheddar-panceta", name: "Caja de papas con cheddar y panceta", variant: null, price: 12000 },
    { id: "papas-extra", name: "Extra papas", variant: null, price: 5000 },
  ],

  extras: [
    { id: "extra-papas-cheddar-combo", name: "Papas cheddar (a tu combo)", variant: null, price: 650 },
    { id: "extra-panceta", name: "Panceta", variant: null, price: 500 },
    { id: "extra-pepinillos", name: "Pepinillos", variant: null, price: 500 },
    { id: "extra-cheddar", name: "Extra cheddar", variant: null, price: 500 },
    { id: "extra-tomate", name: "Tomate", variant: null, price: 600 },
    { id: "extra-albahaca", name: "Albahaca", variant: null, price: 600 },
    { id: "extra-cebolla-caramelizada", name: "Cebolla caramelizada", variant: null, price: 600 },
    { id: "extra-huevo-frito", name: "Huevo frito", variant: null, price: 600 },
    { id: "extra-papas-pay", name: "Papas pay", variant: null, price: 500 },
  ],
};
