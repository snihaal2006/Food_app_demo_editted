const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'mexitoes.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode=WAL;');

  initTables();
  seedMenuItems();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      loyalty_tier TEXT DEFAULT 'Standard',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      category TEXT NOT NULL,
      image_url TEXT,
      rating REAL DEFAULT 4.5,
      prep_time TEXT DEFAULT '15-20 min',
      is_spicy INTEGER DEFAULT 0,
      is_veg INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
      UNIQUE(user_id, menu_item_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'placed',
      items_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      menu_item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  saveDb();
}

function seedMenuItems() {
  const count = db.exec('SELECT COUNT(*) as c FROM menu_items')[0]?.values[0][0];
  if (count && count > 0) return;

  const items = [
    // Quick Bites
    ['Paneer Momos', 'Soft steamed dumplings stuffed with spiced paneer, served with red chutney', 80, null, 'Quick Bites', 'https://images.unsplash.com/photo-1704963925502-7c5c23791fb1?w=400&q=80', 4.5, '10-15 min', 0, 1],
    ['Paneer Tikka Momos', 'Smoky paneer tikka filling wrapped in a tender dumpling shell', 90, null, 'Quick Bites', 'https://images.unsplash.com/photo-1704963925502-7c5c23791fb1?w=400&q=80', 4.6, '10-15 min', 0, 1],
    ['Chicken Tikka Momos', 'Juicy chicken tikka stuffed dumplings with house-made chilli dip', 90, null, 'Quick Bites', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', 4.7, '10-15 min', 1, 0],
    ['Lobster Bites', 'Crispy golden lobster bites seasoned with spices, served with dip', 90, null, 'Quick Bites', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', 4.8, '15-20 min', 0, 0],
    ['Chicken Jumbo Burger', 'Big, juicy chicken patty with fresh veggies, cheese & special sauce', 120, null, 'Quick Bites', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', 4.6, '15-20 min', 0, 0],

    // Starters
    ['Chicken 555', 'Crispy fried chicken tossed in a tangy 555 masala glaze', 110, null, 'Starters', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80', 4.7, '15-20 min', 1, 0],
    ['Chicken 777', 'Triple-spiced chicken starter with aromatic herbs and peppers', 110, null, 'Starters', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80', 4.8, '15-20 min', 1, 0],
    ['Hot Pepper Chicken', 'Fiery chicken tossed with fresh green and red peppers', 100, null, 'Starters', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80', 4.6, '15-20 min', 1, 0],
    ['Kerala Chicken', 'Traditional Kerala-style fried chicken with coconut and curry leaves', 100, null, 'Starters', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80', 4.9, '20-25 min', 1, 0],
    ['Chicken Chukka', 'Dry-tossed chicken with onions, tomatoes and South Indian spices', 100, null, 'Starters', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80', 4.7, '20-25 min', 1, 0],
    ['Fruit Sandwich', 'Fresh seasonal fruits layered with cream between soft bread slices', 60, null, 'Starters', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80', 4.4, '5-10 min', 0, 1],

    // Masalas
    ['Paneer Masala', 'Cottage cheese cubes simmered in a rich, spiced tomato-onion gravy', 110, null, 'Masalas', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', 4.6, '20-25 min', 0, 1],
    ['Gobi Masala', 'Cauliflower florets cooked in a flavourful masala gravy', 90, null, 'Masalas', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', 4.4, '20-25 min', 0, 1],
    ['Mushroom Masala', 'Tender mushrooms in a creamy, spiced onion-tomato gravy', 90, null, 'Masalas', 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&q=80', 4.5, '20-25 min', 0, 1],
    ['Corn Masala', 'Sweet corn kernels tossed in a tangy, mildly spiced masala', 90, null, 'Masalas', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', 4.3, '15-20 min', 0, 1],
    ['Paneer Butter Masala', 'Classic paneer in a velvety, buttery tomato cream gravy', 120, null, 'Masalas', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', 4.8, '20-25 min', 0, 1],
    ['Dal Veg', 'Comforting lentil curry slow-cooked with aromatic spices', 90, null, 'Masalas', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80', 4.5, '20-25 min', 0, 1],

    // Pasta
    ['Cheese Sauce Pasta', 'Penne pasta tossed in a rich, creamy four-cheese sauce', 100, null, 'Pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', 4.5, '15-20 min', 0, 1],
    ['White Sauce Pasta', 'Pasta in a smooth, garlicky béchamel sauce with herbs', 100, null, 'Pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', 4.4, '15-20 min', 0, 1],
  ];

  const stmt = db.prepare(
    'INSERT INTO menu_items (name, description, price, original_price, category, image_url, rating, prep_time, is_spicy, is_veg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const item of items) {
    stmt.run(item);
  }
  stmt.free();
  saveDb();
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryRow(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

module.exports = { getDb, query, queryRow, run, saveDb };
