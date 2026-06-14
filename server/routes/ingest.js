import { Router } from 'express';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

const router = Router();

router.post('/bulk', async (req, res) => {
  try {
    const { customers, orders } = req.body;

    if (!customers || !Array.isArray(customers)) {
      return res.status(400).json({ error: 'customers array required' });
    }

    const insertedCustomers = await Customer.insertMany(customers);

    let insertedOrders = [];
    if (orders && Array.isArray(orders) && orders.length > 0) {
      insertedOrders = await Order.insertMany(orders);

      for (const customer of insertedCustomers) {
        const customerOrders = insertedOrders.filter(
          (o) => o.customerId?.toString() === customer._id.toString()
        );
        if (customerOrders.length === 0) continue;

        const categories = customerOrders.flatMap((o) =>
          o.products.map((p) => p.category)
        );
        const totalOrders = customerOrders.length;
        const avgSpend =
          customerOrders.reduce((sum, o) => sum + o.amount, 0) / totalOrders;
        const lastOrderDate = customerOrders.sort(
          (a, b) => b.orderedAt - a.orderedAt
        )[0].orderedAt;

        await Customer.updateOne(
          { _id: customer._id },
          {
            $set: {
              totalOrders,
              avgSpend: Math.round(avgSpend),
              lastOrderDate,
              productsPurchased: [...new Set(categories)],
              routineCompletenessScore: Math.min(new Set(categories).size, 5),
            },
          }
        );
      }
    }

    res.status(201).json({
      customersInserted: insertedCustomers.length,
      ordersInserted: insertedOrders.length,
    });
  } catch (err) {
    console.error('Bulk ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const count = await Customer.countDocuments();
    const sample = await Customer.find().limit(10).lean();
    res.json({ total: count, sample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
