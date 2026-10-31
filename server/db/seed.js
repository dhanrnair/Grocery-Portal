// Seed data. setup-db inserts with ON CONFLICT DO NOTHING, so editing a row
// here does NOT update a row that already exists in the database.
// [id, name, category, unit, price, stock, image, description]
const rows = [
  ['apple-gala', 'Gala Apples', 'Fruit', '1 kg', 3.99, 60, '🍎', 'Crisp, sweet and perfect for snacking.'],
  ['banana', 'Bananas', 'Fruit', '1 kg', 1.89, 80, '🍌', 'Ripe Cavendish bananas.'],
  ['orange', 'Navel Oranges', 'Fruit', '1 kg', 3.49, 50, '🍊', 'Juicy and seedless.'],
  ['strawberry', 'Strawberries', 'Fruit', '400 g', 4.49, 30, '🍓', 'Fresh, sweet berries.'],
  ['avocado', 'Hass Avocados', 'Fruit', '2 pack', 3.29, 40, '🥑', 'Creamy and ready to eat.'],
  ['tomato', 'Vine Tomatoes', 'Vegetables', '500 g', 2.79, 55, '🍅', 'Full flavoured salad tomatoes.'],
  ['carrot', 'Carrots', 'Vegetables', '1 kg', 1.49, 70, '🥕', 'Crunchy and naturally sweet.'],
  ['broccoli', 'Broccoli', 'Vegetables', 'each', 1.99, 35, '🥦', 'Fresh green florets.'],
  ['potato', 'Potatoes', 'Vegetables', '2 kg', 3.19, 90, '🥔', 'All-round white potatoes.'],
  ['onion', 'Yellow Onions', 'Vegetables', '1 kg', 1.59, 75, '🧅', 'Kitchen staple.'],
  ['milk', 'Whole Milk', 'Dairy & Eggs', '1 L', 1.29, 100, '🥛', 'Fresh full cream milk.'],
  ['eggs', 'Free-range Eggs', 'Dairy & Eggs', '12 pack', 4.29, 45, '🥚', 'Large free-range eggs.'],
  ['cheddar', 'Cheddar Cheese', 'Dairy & Eggs', '250 g', 3.89, 40, '🧀', 'Mature, tangy cheddar.'],
  ['butter', 'Salted Butter', 'Dairy & Eggs', '250 g', 3.49, 50, '🧈', 'Rich and creamy.'],
  ['yogurt', 'Greek Yogurt', 'Dairy & Eggs', '500 g', 2.99, 45, '🍶', 'Thick and creamy plain yogurt.'],
  ['bread', 'Sourdough Loaf', 'Bakery', 'each', 3.99, 25, '🍞', 'Baked fresh daily.'],
  ['croissant', 'Butter Croissants', 'Bakery', '4 pack', 3.79, 20, '🥐', 'Flaky and golden.'],
  ['bagel', 'Sesame Bagels', 'Bakery', '5 pack', 3.29, 22, '🥯', 'Chewy bagels, great toasted.'],
  ['chicken', 'Chicken Breast', 'Meat & Fish', '500 g', 5.99, 30, '🍗', 'Skinless, boneless breast fillets.'],
  ['beef-mince', 'Beef Mince', 'Meat & Fish', '500 g', 6.49, 28, '🥩', 'Lean beef mince, 5% fat.'],
  ['salmon', 'Salmon Fillets', 'Meat & Fish', '2 pack', 7.99, 20, '🐟', 'Skin-on Atlantic salmon.'],
  ['rice', 'Basmati Rice', 'Pantry', '1 kg', 3.99, 60, '🍚', 'Long grain aromatic rice.'],
  ['pasta', 'Spaghetti', 'Pantry', '500 g', 1.49, 90, '🍝', 'Durum wheat pasta.'],
  ['olive-oil', 'Olive Oil', 'Pantry', '500 ml', 6.99, 35, '🫒', 'Extra virgin olive oil.'],
  ['cereal', 'Oat Cereal', 'Pantry', '500 g', 3.49, 40, '🥣', 'Wholegrain oat hoops.'],
  ['juice', 'Orange Juice', 'Drinks', '1 L', 2.49, 60, '🧃', 'Not from concentrate.'],
  ['coffee', 'Ground Coffee', 'Drinks', '250 g', 5.49, 35, '☕', 'Medium roast.'],
  ['water', 'Sparkling Water', 'Drinks', '6 × 500 ml', 3.19, 50, '💧', 'Lightly carbonated spring water.'],
];

export const products = rows.map(([id, name, category, unit, price, stock, image, description]) => (
  { id, name, category, unit, price, stock, image, description }
));
