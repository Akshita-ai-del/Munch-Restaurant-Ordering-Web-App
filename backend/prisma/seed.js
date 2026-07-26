const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'milkshakes' },
      update: {},
      create: { name: 'Milkshakes', slug: 'milkshakes', emoji: '🥤', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'sundaes' },
      update: {},
      create: { name: 'Sundaes', slug: 'sundaes', emoji: '🍨', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'cookie-dough' },
      update: {},
      create: { name: 'Cookie Dough', slug: 'cookie-dough', emoji: '🍪', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'ice-cream' },
      update: {},
      create: { name: 'Ice Cream', slug: 'ice-cream', emoji: '🍦', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'craft-coffee' },
      update: {},
      create: { name: 'Craft Coffee', slug: 'craft-coffee', emoji: '☕', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: 'seasonal' },
      update: {},
      create: { name: 'Seasonal', slug: 'seasonal', emoji: '⭐', sortOrder: 6 },
    }),
  ]);

  const [milkshakes, sundaes, cookieDough, iceCream, coffee, seasonal] = categories;

  // ── Menu Items ───────────────────────────────────────────────────────────────
  const menuItems = [
    // Milkshakes
    {
      name: 'The O.G. Yard Shake',
      description: 'Our signature over-the-top milkshake loaded with whipped cream, sprinkles, and a candy crown. Served in our iconic mason jar.',
      price: 14.99,
      categoryId: milkshakes.id,
      isFeatured: true,
      isPopular: true,
      calories: 890,
      prepTime: 8,
      tags: '["popular","signature"]',
      imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&q=80',
    },
    {
      name: 'Pink Lemonade Dream',
      description: 'A gorgeous pink lemonade shake swirled with cotton candy ice cream and topped with a lemon candy rim and rainbow sprinkles.',
      price: 13.99,
      categoryId: milkshakes.id,
      isFeatured: true,
      isPopular: true,
      calories: 760,
      prepTime: 7,
      tags: '["popular","pink","fruity"]',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    },
    {
      name: 'Cookies & Cream Royale',
      description: 'Oreo milkshake blended to perfection, topped with whipped cream, crushed Oreos, and a full cookie crown.',
      price: 13.49,
      categoryId: milkshakes.id,
      isPopular: true,
      calories: 920,
      prepTime: 7,
      tags: '["popular","cookies","classic"]',
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
    },
    {
      name: 'Strawberry Fields Forever',
      description: 'Fresh strawberry shake with strawberry compote swirl, whipped cream, and a chocolate-dipped strawberry on top.',
      price: 13.99,
      categoryId: milkshakes.id,
      calories: 720,
      prepTime: 8,
      tags: '["fruity","fresh"]',
      imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a90bb0ae?w=400&q=80',
    },
    {
      name: 'Chocolate Lava Overload',
      description: 'Triple chocolate shake with hot fudge drizzle, chocolate brownie chunks, and a chocolate lava topping.',
      price: 14.49,
      categoryId: milkshakes.id,
      calories: 1050,
      prepTime: 9,
      tags: '["chocolate","indulgent"]',
      imageUrl: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80',
    },
    {
      name: 'Caramel Swirl Bliss',
      description: 'Salted caramel shake topped with caramel drizzle, caramel popcorn, and a salted caramel pretzel.',
      price: 13.99,
      categoryId: milkshakes.id,
      calories: 870,
      prepTime: 7,
      tags: '["caramel","sweet-salty"]',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
    },

    // Sundaes
    {
      name: 'Rainbow Explosion Sundae',
      description: 'Vanilla ice cream smothered in rainbow candy toppings, rainbow sprinkles, whipped cream, and a cherry on top.',
      price: 11.99,
      categoryId: sundaes.id,
      isFeatured: true,
      isPopular: true,
      calories: 680,
      prepTime: 5,
      tags: '["popular","colorful","fun"]',
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
    },
    {
      name: 'Brownie Bliss Sundae',
      description: 'Warm fudge brownie topped with 2 scoops of vanilla ice cream, hot fudge, whipped cream, and nuts.',
      price: 12.49,
      categoryId: sundaes.id,
      isPopular: true,
      calories: 820,
      prepTime: 6,
      tags: '["warm","brownie","classic"]',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
    },
    {
      name: 'S\'mores Supreme',
      description: 'Toasted marshmallow ice cream, graham cracker crumble, chocolate fudge, toasted mini marshmallows.',
      price: 12.99,
      categoryId: sundaes.id,
      calories: 750,
      prepTime: 7,
      tags: '["smores","toasted"]',
      imageUrl: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80',
    },

    // Cookie Dough
    {
      name: 'Classic Cookie Dough Bowl',
      description: 'Our safe-to-eat edible cookie dough in a bowl with your choice of mix-ins. The original that started it all.',
      price: 9.99,
      categoryId: cookieDough.id,
      isFeatured: true,
      isPopular: true,
      calories: 540,
      prepTime: 3,
      tags: '["popular","edible","classic"]',
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
    },
    {
      name: 'Cookie Dough Sundae',
      description: 'Edible cookie dough topped with 2 scoops of vanilla ice cream, hot fudge, sprinkles, and a cherry.',
      price: 12.99,
      categoryId: cookieDough.id,
      isPopular: true,
      calories: 780,
      prepTime: 5,
      tags: '["popular","combo"]',
      imageUrl: 'https://images.unsplash.com/photo-1506459225024-1428097a7e18?w=400&q=80',
    },
    {
      name: 'Birthday Cake Dough',
      description: 'Birthday cake flavored edible dough loaded with rainbow sprinkles and birthday cake Oreos.',
      price: 10.99,
      categoryId: cookieDough.id,
      calories: 590,
      prepTime: 3,
      tags: '["birthday","celebration","colorful"]',
      imageUrl: 'https://images.unsplash.com/photo-1558636508-e0969431e9b4?w=400&q=80',
    },

    // Ice Cream
    {
      name: 'Single Scoop Cone',
      description: 'One generous scoop of your choice of ice cream in a waffle or sugar cone.',
      price: 4.99,
      categoryId: iceCream.id,
      calories: 280,
      prepTime: 2,
      tags: '["classic","simple"]',
      imageUrl: 'https://images.unsplash.com/photo-1567206563114-c179706b3d29?w=400&q=80',
    },
    {
      name: 'Double Scoop Cone',
      description: 'Two generous scoops of your choice of ice cream. Mix and match flavors!',
      price: 7.99,
      categoryId: iceCream.id,
      isPopular: true,
      calories: 520,
      prepTime: 2,
      tags: '["popular","classic"]',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    },
    {
      name: 'Ice Cream Float',
      description: 'Your choice of soda topped with a big scoop of vanilla ice cream. Fizzy, creamy, delicious.',
      price: 8.99,
      categoryId: iceCream.id,
      calories: 420,
      prepTime: 3,
      tags: '["float","refreshing"]',
      imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80',
    },

    // Craft Coffee
    {
      name: 'Pink Latte',
      description: 'Our signature pink latte made with oat milk, rose syrup, and a dusting of pink sugar. Instagram gold.',
      price: 6.99,
      categoryId: coffee.id,
      isFeatured: true,
      calories: 210,
      prepTime: 4,
      tags: '["coffee","pink","instagram"]',
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    },
    {
      name: 'Yard Cold Brew',
      description: 'Smooth, slow-steeped cold brew coffee over ice. Strong, clean, and refreshing.',
      price: 5.99,
      categoryId: coffee.id,
      calories: 5,
      prepTime: 2,
      tags: '["coffee","cold","strong"]',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    },
    {
      name: 'Affogato',
      description: 'A double espresso shot poured over a scoop of vanilla bean ice cream. Hot meets cold.',
      price: 7.99,
      categoryId: coffee.id,
      isPopular: true,
      calories: 180,
      prepTime: 3,
      tags: '["coffee","espresso","ice cream"]',
      imageUrl: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400&q=80',
    },

    // Seasonal
    {
      name: 'July Fourth Firework Shake',
      description: 'Red, white, and blue layered shake with popping candy, star sprinkles, and a sparkler cookie. Limited time!',
      price: 15.99,
      categoryId: seasonal.id,
      isFeatured: true,
      isPopular: true,
      calories: 980,
      prepTime: 10,
      tags: '["limited","seasonal","july"]',
      imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
    },
    {
      name: 'Mango Passion Colada',
      description: 'Summer special: tropical mango and coconut shake with passion fruit sauce, toasted coconut, and a pineapple wedge.',
      price: 14.49,
      categoryId: seasonal.id,
      isPopular: true,
      calories: 830,
      prepTime: 8,
      tags: '["seasonal","tropical","summer"]',
      imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.name.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: { ...item, id: item.name.replace(/\s+/g, '-').toLowerCase() },
    });
  }

  // ── Addons ───────────────────────────────────────────────────────────────────
  const ogShake = await prisma.menuItem.findFirst({ where: { name: 'The O.G. Yard Shake' } });
  if (ogShake) {
    await prisma.addon.upsert({
      where: { id: 'og-shake-size' },
      update: {},
      create: {
        id: 'og-shake-size',
        menuItemId: ogShake.id,
        name: 'Size',
        options: JSON.stringify([
          { label: 'Regular (16oz)', price: 0 },
          { label: 'Large (24oz)', price: 3.0 },
        ]),
        required: true,
        maxSelect: 1,
      },
    });
    await prisma.addon.upsert({
      where: { id: 'og-shake-milk' },
      update: {},
      create: {
        id: 'og-shake-milk',
        menuItemId: ogShake.id,
        name: 'Milk Type',
        options: JSON.stringify([
          { label: 'Whole Milk', price: 0 },
          { label: 'Oat Milk', price: 1.0 },
          { label: 'Almond Milk', price: 1.0 },
          { label: 'Skim Milk', price: 0 },
        ]),
        required: false,
        maxSelect: 1,
      },
    });
    await prisma.addon.upsert({
      where: { id: 'og-shake-toppings' },
      update: {},
      create: {
        id: 'og-shake-toppings',
        menuItemId: ogShake.id,
        name: 'Extra Toppings',
        options: JSON.stringify([
          { label: 'Extra Whipped Cream', price: 0.5 },
          { label: 'Rainbow Sprinkles', price: 0.5 },
          { label: 'Hot Fudge Drizzle', price: 0.75 },
          { label: 'Caramel Drizzle', price: 0.75 },
          { label: 'Crushed Oreos', price: 1.0 },
        ]),
        required: false,
        maxSelect: 3,
      },
    });
  }

  // ── Demo Users ───────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'customer@demo.com' },
    update: {},
    create: {
      email: 'customer@demo.com',
      name: 'Alex Demo',
      phone: '+1-555-0100',
      passwordHash: hash,
      role: 'customer',
      wallet: { create: { balance: 25.00 } },
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@demo.com' },
    update: {},
    create: {
      email: 'staff@demo.com',
      name: 'Jordan Staff',
      passwordHash: hash,
      role: 'staff',
    },
  });

  await prisma.user.upsert({
    where: { email: 'rider@demo.com' },
    update: {},
    create: {
      email: 'rider@demo.com',
      name: 'Sam Rider',
      passwordHash: hash,
      role: 'rider',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      passwordHash: hash,
      role: 'admin',
    },
  });

  // ── Promo Codes ──────────────────────────────────────────────────────────────
  await prisma.promoCode.upsert({
    where: { code: 'MUNCH10' },
    update: {},
    create: {
      code: 'MUNCH10',
      discountType: 'percent',
      discountValue: 10,
      minOrderAmount: 15,
      maxUses: 1000,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'YARD5' },
    update: {},
    create: {
      code: 'YARD5',
      discountType: 'fixed',
      discountValue: 5,
      minOrderAmount: 20,
      isActive: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('   Demo users: customer@demo.com / staff@demo.com / rider@demo.com / admin@demo.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
