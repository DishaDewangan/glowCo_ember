import dotenv from 'dotenv';
import { fakerEN_IN as faker } from '@faker-js/faker';
import { connectDB } from '../db.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Segment from '../models/Segment.js';
import Campaign from '../models/Campaign.js';
import Communication from '../models/Communication.js';

dotenv.config();

const CITIES = [
  { city: 'Mumbai', weight: 30 },
  { city: 'Bangalore', weight: 25 },
  { city: 'Delhi', weight: 20 },
  { city: 'Hyderabad', weight: 15 },
  { city: 'Chennai', weight: 10 },
];

const SKIN_TYPES = [
  { type: 'oily', weight: 35 },
  { type: 'combination', weight: 25 },
  { type: 'dry', weight: 20 },
  { type: 'sensitive', weight: 15 },
  { type: 'normal', weight: 5 },
];

const CHANNELS = [
  { channel: 'whatsapp', weight: 55 },
  { channel: 'email', weight: 25 },
  { channel: 'sms', weight: 15 },
  { channel: 'rcs', weight: 5 },
];

const PRODUCTS = [
  { name: 'GlowCo Daily Cleanser', category: 'cleanser', avgReorderDays: 45, price: 499 },
  { name: 'Hydra-Repair Serum', category: 'serum', avgReorderDays: 45, price: 899 },
  { name: 'Daily Moisturiser', category: 'moisturiser', avgReorderDays: 30, price: 649 },
  { name: 'SPF 50 Sun Shield', category: 'sunscreen', avgReorderDays: 60, price: 749 },
  { name: 'Clay Detox Mask', category: 'mask', avgReorderDays: 90, price: 549 },
  { name: 'Vitamin C Bright Serum', category: 'serum', avgReorderDays: 45, price: 999 },
  { name: 'Gentle Foam Cleanser', category: 'cleanser', avgReorderDays: 45, price: 449 },
  { name: 'Night Repair Moisturiser', category: 'moisturiser', avgReorderDays: 30, price: 799 },
];

function weightedPick(items, key = 'weight') {
  const total = items.reduce((sum, item) => sum + item[key], 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item[key];
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function randomPhone() {
  return `+91${faker.string.numeric(10)}`;
}

function cohortDateForCustomer() {
  const now = new Date();
  const roll = Math.random();
  const daysAgo =
    roll < 0.55
      ? faker.number.int({ min: 90, max: 365 })
      : roll < 0.8
        ? faker.number.int({ min: 30, max: 90 })
        : faker.number.int({ min: 365, max: 730 });
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function customerArchetype() {
  const roll = Math.random();
  if (roll < 0.15) return 'loyalist';
  if (roll < 0.5) return 'regular';
  if (roll < 0.8) return 'one_time';
  return 'churned';
}

function computeRoutineScore(categories) {
  const unique = new Set(categories);
  return Math.min(unique.size, 5);
}

async function clearCollections() {
  await Promise.all([
    Customer.deleteMany({}),
    Order.deleteMany({}),
    Product.deleteMany({}),
    Segment.deleteMany({}),
    Campaign.deleteMany({}),
    Communication.deleteMany({}),
  ]);
}

async function seedProducts() {
  return Product.insertMany(PRODUCTS);
}

async function seedCustomers(count = 2000) {
  const batchSize = 500;
  const allCustomers = [];

  for (let batch = 0; batch < count; batch += batchSize) {
    const customers = [];
    const limit = Math.min(batchSize, count - batch);
    for (let i = 0; i < limit; i++) {
      const city = weightedPick(CITIES).city;
      const skinType = weightedPick(SKIN_TYPES).type;
      const preferredChannel = weightedPick(CHANNELS).channel;
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;

      customers.push({
        name,
        phone: randomPhone(),
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        preferredChannel,
        city,
        skinType,
        cohortDate: cohortDateForCustomer(),
        totalOrders: 0,
        avgSpend: 0,
        productsPurchased: [],
        routineCompletenessScore: 0,
      });
    }
    const inserted = await Customer.insertMany(customers);
    allCustomers.push(...inserted);
  }
  return allCustomers;
}

function pickProductsForOrder(products, archetype) {
  const count =
    archetype === 'loyalist'
      ? faker.number.int({ min: 2, max: 4 })
      : archetype === 'regular'
        ? faker.number.int({ min: 1, max: 2 })
        : 1;

  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  return selected.map((p) => ({
    productId: p._id,
    name: p.name,
    category: p.category,
    qty: faker.number.int({ min: 1, max: 2 }),
  }));
}

function orderAmount(lineItems) {
  return lineItems.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.name === item.name);
    return sum + (product?.price || 500) * item.qty;
  }, 0);
}

async function seedOrders(customers, products) {
  const orders = [];
  const orderChannels = ['website', 'app', 'instagram'];
  const now = new Date();

  for (const customer of customers) {
    const archetype = customerArchetype();
    let orderCount;
    let lastOrderDaysAgo;

    switch (archetype) {
      case 'loyalist':
        orderCount = faker.number.int({ min: 6, max: 12 });
        lastOrderDaysAgo = faker.number.int({ min: 1, max: 30 });
        break;
      case 'regular':
        orderCount = faker.number.int({ min: 3, max: 5 });
        lastOrderDaysAgo = faker.number.int({ min: 5, max: 60 });
        break;
      case 'one_time':
        orderCount = faker.number.int({ min: 1, max: 2 });
        lastOrderDaysAgo = faker.number.int({ min: 10, max: 120 });
        break;
      case 'churned':
        orderCount = faker.number.int({ min: 1, max: 3 });
        lastOrderDaysAgo = faker.number.int({ min: 75, max: 180 });
        break;
      default:
        orderCount = 1;
        lastOrderDaysAgo = 30;
    }

    const orderDates = [];
    for (let i = 0; i < orderCount; i++) {
      const daysAgo = lastOrderDaysAgo + (orderCount - 1 - i) * faker.number.int({ min: 14, max: 45 });
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      orderDates.push(date);
    }

    for (const orderedAt of orderDates) {
      const lineItems = pickProductsForOrder(products, archetype);
      orders.push({
        customerId: customer._id,
        amount: orderAmount(lineItems),
        products: lineItems,
        channel: faker.helpers.arrayElement(orderChannels),
        orderedAt,
      });
    }
  }

  const batchSize = 500;
  for (let i = 0; i < orders.length; i += batchSize) {
    await Order.insertMany(orders.slice(i, i + batchSize));
  }

  return orders.length;
}

async function denormalizeCustomers() {
  const customers = await Customer.find();
  for (const customer of customers) {
    const orders = await Order.find({ customerId: customer._id }).sort({ orderedAt: -1 });
    const categories = orders.flatMap((o) => o.products.map((p) => p.category));
    const totalOrders = orders.length;
    const avgSpend = totalOrders
      ? orders.reduce((sum, o) => sum + o.amount, 0) / totalOrders
      : 0;
    const lastOrderDate = orders[0]?.orderedAt;
    const productsPurchased = [...new Set(categories)];

    await Customer.updateOne(
      { _id: customer._id },
      {
        $set: {
          totalOrders,
          avgSpend: Math.round(avgSpend),
          lastOrderDate,
          productsPurchased,
          routineCompletenessScore: computeRoutineScore(categories),
        },
      }
    );
  }
}

async function seedPredefinedSegments() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const segments = [
    {
      name: 'routine_completers',
      description: 'Customers who bought cleanser, moisturiser, and serum',
      filterCriteria: { products_purchased_includes: ['cleanser', 'moisturiser', 'serum'] },
      createdBy: 'human',
    },
    {
      name: 'lapsed_reorderers',
      description: 'Repeat buyers who have not ordered in 45-90 days',
      filterCriteria: {
        total_orders: { min: 2 },
        last_order_days: { min: 45, max: 90 },
      },
      createdBy: 'human',
    },
    {
      name: 'one_product_buyers',
      description: 'Customers with routine completeness score of 1 or less',
      filterCriteria: { routine_completeness_score: { max: 1 } },
      createdBy: 'human',
    },
    {
      name: 'new_customers',
      description: 'Customers who joined in the last 30 days',
      filterCriteria: { cohort_date: { after: thirtyDaysAgo.toISOString().split('T')[0] } },
      createdBy: 'human',
    },
    {
      name: 'high_value_loyalists',
      description: '5+ orders with avg spend above 900',
      filterCriteria: { total_orders: { min: 5 }, avg_spend: { min: 900 } },
      createdBy: 'human',
    },
    {
      name: 'dry_skin_no_serum',
      description: 'Dry skin customers who never bought serum',
      filterCriteria: { skin_type: 'dry', products_purchased_excludes: ['serum'] },
      createdBy: 'human',
    },
    {
      name: 'sunscreen_gap',
      description: 'Bought moisturiser but never sunscreen',
      filterCriteria: {
        products_purchased_includes: ['moisturiser'],
        products_purchased_excludes: ['sunscreen'],
      },
      createdBy: 'human',
    },
  ];

  const { runSegmentQuery } = await import('../services/segmentEngine.js');

  for (const seg of segments) {
    const { count } = await runSegmentQuery(seg.filterCriteria);
    await Segment.create({ ...seg, customerCount: count });
    console.log(`  Segment "${seg.name}": ${count} customers`);
  }
}

async function main() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  console.log('Clearing existing data...');
  await clearCollections();

  console.log('Seeding products...');
  const products = await seedProducts();
  console.log(`  ${products.length} products created`);

  console.log('Seeding 2,000 customers...');
  const customers = await seedCustomers(2000);
  console.log(`  ${customers.length} customers created`);

  console.log('Seeding orders...');
  const orderCount = await seedOrders(customers, products);
  console.log(`  ${orderCount} orders created`);

  console.log('Denormalizing customer stats...');
  await denormalizeCustomers();

  console.log('Creating predefined segments...');
  await seedPredefinedSegments();

  console.log('\nSeed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
