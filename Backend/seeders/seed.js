const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Menu = require("../models/Menu");
const Order = require("../models/Order");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for seeding");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      nama: "Admin User",
      email: "admin@coffee.com",
      password: await bcrypt.hash("password123", 10),
      role: "admin",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      isActive: true,
    },
    {
      nama: "Sarah Johnson",
      email: "cashier1@coffee.com",
      password: await bcrypt.hash("password123", 10),
      role: "cashier",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      isActive: true,
    },
    {
      nama: "Mike Wilson",
      email: "cashier2@coffee.com",
      password: await bcrypt.hash("password123", 10),
      role: "cashier",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      isActive: true,
    },
  ];

  await User.deleteMany({});
  await User.insertMany(users);
  console.log("✅ Users seeded successfully");

  return await User.find({});
};

const seedMenu = async () => {
  const menuItems = [
    {
      name: "Espresso",
      description: "Rich and bold espresso shot made from premium coffee beans",
      price: 25000, // IDR
      category: "Coffee",
      image:
        "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 50,
      isAvailable: true,
    },
    {
      name: "Cappuccino",
      description: "Classic Italian coffee with steamed milk and foam",
      price: 35000, // IDR
      category: "Coffee",
      image:
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 45,
      isAvailable: true,
    },
    {
      name: "Latte",
      description: "Smooth espresso with steamed milk and light foam",
      price: 40000, // IDR
      category: "Coffee",
      image:
        "https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 40,
      isAvailable: true,
    },
    {
      name: "Green Tea",
      description: "Fresh organic green tea with antioxidants",
      price: 20000, // IDR
      category: "Tea",
      image:
        "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 30,
      isAvailable: true,
    },
    {
      name: "Croissant",
      description: "Buttery, flaky French pastry perfect with coffee",
      price: 30000, // IDR
      category: "Food",
      image:
        "https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 25,
      isAvailable: true,
    },
    {
      name: "Chocolate Cake",
      description: "Rich, moist chocolate cake with dark chocolate frosting",
      price: 45000, // IDR
      category: "Dessert",
      image:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 15,
      isAvailable: true,
    },
    {
      name: "Iced Americano",
      description: "Refreshing iced coffee with bold espresso flavor",
      price: 32000, // IDR
      category: "Beverage",
      image:
        "https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 35,
      isAvailable: true,
    },
    {
      name: "Fruit Smoothie",
      description: "Fresh mixed fruit smoothie with yogurt and honey",
      price: 38000, // IDR
      category: "Beverage",
      image:
        "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 20,
      isAvailable: true,
    },
    {
      name: "Nasi Goreng",
      description: "Indonesian fried rice with chicken and vegetables",
      price: 55000, // IDR
      category: "Food",
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 20,
      isAvailable: true,
    },
    {
      name: "Mie Ayam",
      description: "Indonesian chicken noodle soup with vegetables",
      price: 45000, // IDR
      category: "Food",
      image:
        "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
      stock: 18,
      isAvailable: true,
    },
  ];

  await Menu.deleteMany({});
  await Menu.insertMany(menuItems);
  console.log("✅ Menu items seeded successfully");

  return await Menu.find({});
};

const seedOrders = async (users, menuItems) => {
  const orders = [
    {
      cashierId: users[1]._id, // Sarah Johnson
      items: [
        {
          menuItemId: menuItems[0]._id, // Espresso
          quantity: 2,
          price: menuItems[0].price,
          subtotal: menuItems[0].price * 2,
        },
        {
          menuItemId: menuItems[1]._id, // Cappuccino
          quantity: 1,
          price: menuItems[1].price,
          subtotal: menuItems[1].price * 1,
        },
      ],
      total: menuItems[0].price * 2 + menuItems[1].price * 1,
      paymentMethod: "cash",
      status: "completed",
      customerName: "John Doe",
      customerPhone: "+6281234567890",
      notes: "Regular customer",
    },
    {
      cashierId: users[2]._id, // Mike Wilson
      items: [
        {
          menuItemId: menuItems[2]._id, // Latte
          quantity: 1,
          price: menuItems[2].price,
          subtotal: menuItems[2].price * 1,
        },
        {
          menuItemId: menuItems[4]._id, // Croissant
          quantity: 2,
          price: menuItems[4].price,
          subtotal: menuItems[4].price * 2,
        },
      ],
      total: menuItems[2].price * 1 + menuItems[4].price * 2,
      paymentMethod: "midtrans",
      status: "completed",
      customerName: "Jane Smith",
      customerPhone: "+6281234567891",
      notes: "To go order",
    },
    {
      cashierId: users[1]._id,
      items: [
        {
          menuItemId: menuItems[5]._id, // Chocolate Cake
          quantity: 1,
          price: menuItems[5].price,
          subtotal: menuItems[5].price * 1,
        },
        {
          menuItemId: menuItems[1]._id, // Cappuccino
          quantity: 2,
          price: menuItems[1].price,
          subtotal: menuItems[1].price * 2,
        },
      ],
      total: menuItems[5].price * 1 + menuItems[1].price * 2,
      paymentMethod: "cash",
      status: "processing",
      customerName: "Bob Johnson",
      customerPhone: "+6281234567892",
    },
    {
      cashierId: users[2]._id,
      items: [
        {
          menuItemId: menuItems[8]._id, // Nasi Goreng
          quantity: 2,
          price: menuItems[8].price,
          subtotal: menuItems[8].price * 2,
        },
        {
          menuItemId: menuItems[3]._id, // Green Tea
          quantity: 2,
          price: menuItems[3].price,
          subtotal: menuItems[3].price * 2,
        },
      ],
      total: menuItems[8].price * 2 + menuItems[3].price * 2,
      paymentMethod: "cash",
      status: "completed",
      customerName: "Alice Brown",
      customerPhone: "+6281234567893",
      notes: "Lunch order for office",
    },
    {
      cashierId: users[1]._id,
      items: [
        {
          menuItemId: menuItems[9]._id, // Mie Ayam
          quantity: 1,
          price: menuItems[9].price,
          subtotal: menuItems[9].price * 1,
        },
        {
          menuItemId: menuItems[6]._id, // Iced Americano
          quantity: 1,
          price: menuItems[6].price,
          subtotal: menuItems[6].price * 1,
        },
      ],
      total: menuItems[9].price * 1 + menuItems[6].price * 1,
      paymentMethod: "midtrans",
      status: "completed",
      customerName: "David Wilson",
      customerPhone: "+6281234567894",
      notes: "Dine in",
    },
  ];

  await Order.deleteMany({});
  await Order.insertMany(orders);
  console.log("✅ Orders seeded successfully");
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting database seeding...");

    const users = await seedUsers();
    const menuItems = await seedMenu();
    await seedOrders(users, menuItems);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Seeded Data Summary:");
    console.log(`👥 Users: ${users.length}`);
    console.log(`🍽️  Menu Items: ${menuItems.length}`);
    console.log(`📋 Orders: 5`);
    console.log(`💰 Currency: IDR (Indonesian Rupiah)`);

    console.log("\n🔐 Demo Login Credentials:");
    console.log("Admin: admin@coffee.com / password123");
    console.log("Cashier 1: cashier1@coffee.com / password123");
    console.log("Cashier 2: cashier2@coffee.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();