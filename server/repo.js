// All database queries live here. Cast numeric/decimal columns with ::float8
// so they arrive in JavaScript as numbers, not strings.
import { randomUUID } from 'node:crypto';
import { pool, withTransaction } from './db.js';
import { deliveryFor, roundMoney } from '../shared/rules.js';

export async function ping() {
  await pool.query('SELECT 1');
}

const PRODUCT_COLUMNS = 'id, name, category, unit, price::float8 AS price, stock, image, description';

export async function listProducts() {
  const { rows } = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY position, id`);
  return rows;
}

export async function getProduct(id) {
  const { rows } = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

class OrderError extends Error {
  status = 400;
}

const ORDER_SELECT = `
  SELECT o.id, o.status, o.created_at AS "createdAt",
         json_build_object('name', o.name, 'email', o.email, 'address', o.address,
                           'city', o.city, 'zip', o.zip) AS customer,
         o.subtotal::float8 AS subtotal, o.delivery::float8 AS delivery, o.total::float8 AS total,
         json_agg(json_build_object('id', i.product_id, 'name', i.name, 'unit', i.unit, 'image', i.image,
                                    'price', i.price::float8, 'qty', i.qty)
                  ORDER BY i.name) AS items
  FROM orders o
  JOIN order_items i ON i.order_id = o.id`;

// Read-only public lookup: order code AND the email used. Wrong code or wrong email look the same.
export async function findOrder(id, email) {
  const { rows } = await pool.query(
    `${ORDER_SELECT} WHERE o.id = $1 AND lower(o.email) = lower($2) GROUP BY o.id`, [id, email]);
  return rows[0] ?? null;
}

export async function listOrdersForUser(userId) {
  const { rows } = await pool.query(
    `${ORDER_SELECT} WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`, [userId]);
  return rows;
}

// items: [{ id, qty }] (already shape-checked); customer: validated and trimmed.
// Prices, totals and stock come from the database only.
export function createOrder(userId, items, customer) {
  const wanted = new Map();
  for (const { id, qty } of items) wanted.set(id, (wanted.get(id) ?? 0) + qty);
  const ids = [...wanted.keys()].sort();

  return withTransaction(async (db) => {
    // Lock rows in a fixed order (avoids deadlocks) so two orders can't both buy the last item.
    const { rows: products } = await db.query(
      `SELECT id, name, unit, image, price::float8 AS price, stock
       FROM products WHERE id = ANY($1) ORDER BY id FOR UPDATE`, [ids]);

    const lines = ids.map((id) => {
      const product = products.find((p) => p.id === id);
      if (!product) throw new OrderError(`Unknown product: ${id}`);
      const qty = wanted.get(id);
      if (qty > product.stock) {
        throw new OrderError(
          product.stock === 0 ? `${product.name} is out of stock`
            : `Only ${product.stock} of ${product.name} left in stock`);
      }
      return { id, name: product.name, unit: product.unit, image: product.image, price: product.price, qty };
    });

    const subtotal = roundMoney(lines.reduce((s, l) => s + l.price * l.qty, 0));
    const delivery = deliveryFor(subtotal);
    const total = roundMoney(subtotal + delivery);
    const id = 'GRO-' + randomUUID().slice(0, 8).toUpperCase();

    const { rows: [{ createdAt }] } = await db.query(
      `INSERT INTO orders (id, user_id, name, email, address, city, zip, subtotal, delivery, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING created_at AS "createdAt"`,
      [id, userId, customer.name, customer.email, customer.address, customer.city, customer.zip,
       subtotal, delivery, total]);

    for (const l of lines) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, name, unit, image, price, qty)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, l.id, l.name, l.unit, l.image, l.price, l.qty]);
      await db.query('UPDATE products SET stock = stock - $2 WHERE id = $1', [l.id, l.qty]);
    }
    return { id, status: 'placed', createdAt, items: lines, customer, subtotal, delivery, total };
  });
}

// Owner-scoped. A wrong owner gets the same 404 as an unknown code. Restocks the items.
export function cancelOrder(id, userId) {
  return withTransaction(async (db) => {
    const { rows: [order] } = await db.query(
      'SELECT id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE', [id, userId]);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
    if (order.status === 'cancelled') throw new OrderError('This order is already cancelled');

    const { rows: items } = await db.query(
      'SELECT product_id, qty FROM order_items WHERE order_id = $1 ORDER BY product_id', [id]);
    for (const i of items) {
      await db.query('UPDATE products SET stock = stock + $2 WHERE id = $1', [i.product_id, i.qty]);
    }
    await db.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [id]);
    return { id, status: 'cancelled' };
  });
}
