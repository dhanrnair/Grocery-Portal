// Rules used by BOTH the browser and the server so they always agree.
// Keep this file free of Node-only and browser-only APIs.
export const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const roundMoney = (n) => Math.round(n * 100) / 100;

// Returns { field: 'message' } for every invalid field; {} when valid.
export function validateContact(c = {}) {
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const e = {};
  if (!str(c.name)) e.name = 'Name is required';
  if (!/^\S+@\S+\.\S+$/.test(str(c.email))) e.email = 'Enter a valid email';
  return e;
}

export const FREE_DELIVERY_THRESHOLD = 35;
export const DELIVERY_FEE = 3.99;
export const MAX_QTY = 20; // per product per order

export const deliveryFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

export function validateCustomer(c = {}) {
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const e = validateContact(c);
  if (!str(c.address)) e.address = 'Address is required';
  if (!str(c.city)) e.city = 'City is required';
  if (!/^\w{3,10}$/.test(str(c.zip))) e.zip = 'Enter a valid postal code';
  return e;
}
