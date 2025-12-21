// src/mockData.js
// Minimal mock data: one product per category pulled/referenced from ArtOfRama product pages.
// (Images and short descriptions reference ArtOfRama product pages as of 2025.)

export const INITIAL_PRODUCTS = [
  {
    id: 'P-WELCOME-1',
    name: "Acrylic Photo Wedding Welcome Sign",
    category: "welcome",
    price: 92.49,
    originalPrice: 119.99,
    image: "https://artoframa.com/wp-content/uploads/2024/11/welcome-sign-sample.jpg", // art of rama category asset (representative)
    isBestseller: true,
    description: "Custom clear acrylic welcome sign with photo-print and gold headings — perfect to greet guests in a modern wedding setup. Sizes and finishes available; personalized with names and date."
  },
  {
    id: 'P-SEATING-1',
    name: "Clear Acrylic Seating Chart",
    category: "seating",
    price: 129.99,
    originalPrice: 149.99,
    image: "https://i.pinimg.com/1200x/32/ba/e6/32bae68b677e8508097a752a07970aa9.jpg",
    description: "Elegant clear acrylic seating chart with minimalist gold headings. Designed for large receptions; mount or easel-ready with clean typography."
  },
  {
    id: 'P-BAR-1',
    name: "Arched Acrylic Open Bar Sign",
    category: "bar",
    price: 87.49,
    originalPrice: 109.99,
    image: "https://artoframa.com/wp-content/uploads/2024/11/open-bar-arched-sample.jpg",
    description: "Custom arched acrylic 'Open Bar' sign with mirror-gold finish — lists signature cocktails and beverage options. UV-printed lettering for durability."
  },
  {
    id: 'P-MENUCARDS-1',
    name: "Custom Acrylic Menu Cards (Single)",
    category: "menucards",
    price: 5.99,
    originalPrice: 8.99,
    image: "https://i.pinimg.com/736x/bd/f1/d5/bdf1d5b82fabaa1b3fbedc467edff091.jpg",
    description: "Individual acrylic menu card, UV-printed. Available in multiple sizes and finishes for place settings or buffet displays."
  },
  {
    id: 'P-PLACE-1',
    name: "Rustic Acrylic Place Cards",
    category: "placecards",
    price: 169.99,
    originalPrice: null,
    image: "https://i.pinimg.com/1200x/e6/b9/1e/e6b91e3517275c2e0e78ed1d35edb847.jpg",
    description: "Wood-effect acrylic place cards with vintage typography — set of cards that work beautifully for rustic or boho tablescapes."
  },
  {
    id: 'P-THANKYOU-1',
    name: "Acrylic Thank You Card Set",
    category: "thankyou",
    price: 39.99,
    originalPrice: 49.99,
    image: "https://i.pinimg.com/1200x/e6/b9/1e/e6b91e3517275c2e0e78ed1d35edb847.jpg",
    description: "Small acrylic 'Thank You' cards for guest favors — polished edges and elegant typography for a premium finish."
  },
  {
    id: 'P-TABLEDECOR-1',
    name: "Romantic Quote Acrylic Sign",
    category: "tabledecor",
    price: 59.99,
    originalPrice: 79.99,
    image: "https://i.pinimg.com/1200x/8a/b6/4e/8ab64e81d9940e025e04326f5a2594ed.jpg",
    description: "Decorative acrylic sign with romantic quote — ideal as table or shelf decor for receptions and personal photoshoots."
  },
  {
    id: 'P-TABLENUM-1',
    name: "Set of Acrylic Table Numbers",
    category: "tablenumbers",
    price: 149.99,
    originalPrice: null,
    image: "https://i.pinimg.com/1200x/62/62/72/626272b3711cba16d7a2c69d87238cc0.jpg",
    description: "Set of 15 acrylic table numbers with modern rounded type — easy-to-read, durable, and fits formal and casual setups."
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-001',
    customerName: "Demo Customer",
    email: "demo@example.com",
    phone: "+91 9000000000",
    location: "Jaipur, IN",
    totalOrders: 1,
    totalSpent: 149.99,
    status: "Active",
    lastOrderDate: "2025-01-01",
    paymentStatus: "Complete"
  }
];

export const CATEGORIES = [
  { id: 'welcome', name: 'Welcome Sign' },
  { id: 'seating', name: 'Seating Chart' },
  { id: 'bar', name: 'Bar Sign' },
  { id: 'menucards', name: 'Menu Cards' },
  { id: 'placecards', name: 'Place Cards' },
  { id: 'thankyou', name: 'Thank You Cards' },
  { id: 'tabledecor', name: 'Table Decor' },
  { id: 'tablenumbers', name: 'Table Numbers' }
];
