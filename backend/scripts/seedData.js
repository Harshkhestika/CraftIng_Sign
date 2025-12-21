import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crafting-sign');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Product.deleteMany({});
    // await Category.deleteMany({});

    // Seed Categories
    const categories = [
      { id: 'welcome', name: 'Welcome Sign', order: 1 },
      { id: 'seating', name: 'Seating Chart', order: 2 },
      { id: 'bar', name: 'Bar Sign', order: 3 },
      { id: 'menucards', name: 'Menu Cards', order: 4 },
      { id: 'placecards', name: 'Place Cards', order: 5 },
      { id: 'thankyou', name: 'Thank You Cards', order: 6 },
      { id: 'tabledecor', name: 'Table Decor', order: 7 },
      { id: 'tablenumbers', name: 'Table Numbers', order: 8 }
    ];

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { id: cat.id },
        cat,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Categories seeded');

    // Seed Products
    const products = [
      {
        name: "Frosted Acrylic Welcome Sign",
        category: "welcome",
        price: 89.99,
        originalPrice: 119.99,
        image: "https://artoframa.com/wp-content/uploads/2021/11/WhatsApp-Image-2021-11-09-at-3.33.53-PM.jpeg",
        isBestseller: true,
        isNew: true,
        description: "A stunning frosted acrylic welcome sign with 3D white acrylic lettering. Perfect for modern weddings.",
        features: [
          { size: '18x24', color: 'Frosted', price: 89.99 },
          { size: '24x36', color: 'Frosted', price: 129.99 }
        ],
        featureType: 'size'
      },
      {
        name: "Arch Seating Chart Display",
        category: "seating",
        price: 159.99,
        image: "https://artoframa.com/wp-content/uploads/2021/12/WhatsApp-Image-2021-12-08-at-2.04.46-PM.jpeg",
        isNew: true,
        description: "Elegant arch-shaped seating chart to guide your guests in style. Available in various colors.",
        features: [{ size: '24x36', color: 'White', price: 159.99 }],
        featureType: 'size'
      },
      {
        name: "Signature Drinks Menu",
        category: "bar",
        price: 69.99,
        image: "https://artoframa.com/wp-content/uploads/2024/10/cocktail-menu-01.jpg",
        isBestseller: true,
        isNew: true,
        description: "Showcase your signature cocktails with this chic acrylic bar menu featuring custom illustrations.",
        features: [{ size: '8x10', color: 'Clear', price: 69.99 }],
        featureType: 'size'
      },
      {
        name: "Arched Dinner Menu",
        category: "menucards",
        price: 6.50,
        image: "https://artoframa.com/wp-content/uploads/2022/02/WhatsApp-Image-2022-02-22-at-4.58.34-PM-1.jpeg",
        isNew: true,
        description: "Individual arch-shaped dinner menus for each place setting. Adds a sophisticated touch to your tables.",
        features: [{ size: '4x9', color: 'Black', price: 6.50 }],
        featureType: 'size'
      },
      {
        name: "Hexagon Place Card",
        category: "placecards",
        price: 3.99,
        image: "https://artoframa.com/wp-content/uploads/2021/11/WhatsApp-Image-2021-11-09-at-3.33.54-PM.jpeg",
        isBestseller: true,
        isNew: true,
        description: "Geometric hexagon place cards with vinyl lettering. A modern keepsake for your guests.",
        features: [{ size: '3x3', color: 'Gold Mirror', price: 3.99 }],
        featureType: 'size'
      },
      {
        name: "Acrylic Thank You Card",
        category: "thankyou",
        price: 4.99,
        image: "https://artoframa.com/wp-content/uploads/2022/02/WhatsApp-Image-2022-02-22-at-4.58.35-PM.jpeg",
        isNew: true,
        description: "Express your gratitude with these unique acrylic thank you cards.",
        features: [{ size: 'A6', color: 'Clear', price: 4.99 }],
        featureType: 'size'
      },
      {
        name: "Cards & Gifts Sign",
        category: "tabledecor",
        price: 45.00,
        image: "https://artoframa.com/wp-content/uploads/2021/11/WhatsApp-Image-2021-11-09-at-3.33.52-PM.jpeg",
        isBestseller: true,
        isNew: true,
        description: "Minimalist sign to designate your gift table area.",
        features: [{ size: '8x10', color: 'White', price: 45.00 }],
        featureType: 'size'
      },
      {
        name: "Frosted Arch Table Number",
        category: "tablenumbers",
        price: 12.99,
        image: "https://artoframa.com/wp-content/uploads/2021/11/WhatsApp-Image-2021-11-09-at-3.33.55-PM.jpeg",
        isNew: true,
        description: "Frosted acrylic arch table numbers with a wooden stand for a rustic-modern look.",
        features: [{ size: '5x7', color: 'Frosted', price: 12.99 }],
        featureType: 'size'
      }
    ];

    for (const product of products) {
      await Product.findOneAndUpdate(
        { name: product.name },
        product,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Products seeded');

    // Create default admin user (if not exists)
    const adminExists = await User.findOne({ email: 'admin@craftingsign.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@craftingsign.com',
        password: 'admin123',
        name: 'Admin User',
        isAdmin: true
      });
      console.log('✅ Default admin user created (email: admin@craftingsign.com, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();

