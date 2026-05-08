const { Client } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

async function getClient() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  return client
}

const MENU_ITEMS = [
  { name: 'Chicken Shawarma', description: 'Juicy grilled chicken, fresh veggies, garlic sauce wrapped in warm bread', price: 350000, category: 'shawarma', imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600', cloudinaryPublicId: 'junktion/placeholder-shawarma', displayOrder: 1 },
  { name: 'Beef Shawarma', description: 'Tender seasoned beef, caramelised onions, tangy mayo in toasted wrap', price: 400000, category: 'shawarma', imageUrl: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=600', cloudinaryPublicId: 'junktion/placeholder-beef-shawarma', displayOrder: 2 },
  { name: 'Mixed Shawarma', description: 'The best of both — chicken and beef together, double sauce', price: 450000, category: 'shawarma', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', cloudinaryPublicId: 'junktion/placeholder-mixed-shawarma', displayOrder: 3 },
  { name: 'Club Sandwich', description: 'Triple-decker toasted sandwich, chicken, egg, tomato, crispy lettuce', price: 320000, category: 'sandwich', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600', cloudinaryPublicId: 'junktion/placeholder-club', displayOrder: 4 },
  { name: 'Chicken Burger', description: 'Crispy fried chicken fillet, coleslaw, pickles on a toasted brioche bun', price: 380000, category: 'sandwich', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', cloudinaryPublicId: 'junktion/placeholder-burger', displayOrder: 5 },
  { name: 'Jollof Pasta', description: 'Jollof-spiced penne, rich tomato base, smoky undertones — purely Nigerian', price: 280000, category: 'pasta', imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600', cloudinaryPublicId: 'junktion/placeholder-jollof-pasta', displayOrder: 6 },
  { name: 'Chicken Pasta', description: 'Creamy grilled chicken pasta, peppers, onions, house seasoning blend', price: 350000, category: 'pasta', imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600', cloudinaryPublicId: 'junktion/placeholder-chicken-pasta', displayOrder: 7 },
  { name: 'Fried Rice', description: 'Nigerian fried rice, mixed vegetables, seasoned chicken, served hot', price: 250000, category: 'rice', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600', cloudinaryPublicId: 'junktion/placeholder-fried-rice', displayOrder: 8 },
  { name: 'Jollof Rice + Chicken', description: 'Party-style smoky jollof rice with perfectly seasoned grilled chicken', price: 280000, category: 'rice', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600', cloudinaryPublicId: 'junktion/placeholder-jollof', displayOrder: 9 },
  { name: 'Coconut Rice', description: 'Fragrant coconut-infused rice, served with spiced grilled chicken', price: 300000, category: 'rice', imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600', cloudinaryPublicId: 'junktion/placeholder-coconut', displayOrder: 10 },
  { name: 'Spring Rolls (6pcs)', description: 'Crispy golden rolls filled with spiced minced chicken and vegetables', price: 180000, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', cloudinaryPublicId: 'junktion/placeholder-spring-rolls', displayOrder: 11 },
  { name: 'Puff Puff (8pcs)', description: 'Classic Nigerian deep-fried dough balls, perfectly fluffy inside', price: 100000, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1556040220-4096d522378d?w=600', cloudinaryPublicId: 'junktion/placeholder-puff-puff', displayOrder: 12 },
  { name: 'Coleslaw', description: 'Creamy house-made coleslaw, crunchy cabbage, carrots, light dressing', price: 80000, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600', cloudinaryPublicId: 'junktion/placeholder-coleslaw', displayOrder: 13 },
  { name: 'Plantain', description: 'Sweet fried ripe plantain — the perfect side to everything', price: 100000, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=600', cloudinaryPublicId: 'junktion/placeholder-plantain', displayOrder: 14 },
  { name: 'Chapman', description: 'Nigerian classic party drink — Fanta, Sprite, grenadine, cucumber, bitters', price: 120000, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600', cloudinaryPublicId: 'junktion/placeholder-chapman', displayOrder: 15 },
  { name: 'Zobo', description: 'Chilled hibiscus drink, ginger-infused, lightly sweetened — cold pressed', price: 80000, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', cloudinaryPublicId: 'junktion/placeholder-zobo', displayOrder: 16 },
  { name: 'Kunu', description: 'Traditional millet drink, lightly spiced with ginger and cloves', price: 70000, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600', cloudinaryPublicId: 'junktion/placeholder-kunu', displayOrder: 17 },
  { name: 'Bottled Water', description: 'Ice cold 75cl table water', price: 30000, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600', cloudinaryPublicId: 'junktion/placeholder-water', displayOrder: 18 },
]

const REQUIRED_TABLES = [
  'users',
  'menu_items',
  'payment_accounts',
  'orders',
  'login_attempts',
  'rate_limit_log',
]

async function checkTables(client) {
  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
  `)
  const existing = rows.map((r) => r.table_name)
  const missing  = REQUIRED_TABLES.filter((t) => !existing.includes(t))
  if (missing.length > 0) {
    console.error('\n❌ Missing tables:', missing.join(', '))
    console.error('   Run: npx drizzle-kit push  — then try again.\n')
    process.exit(1)
  }
  console.log('✓ All tables present:', REQUIRED_TABLES.join(', '))
}

async function seed() {
  const client = await getClient()

  try {
    await checkTables(client)

    const hash = await bcrypt.hash('JunktionAdmin2025!', 12)

    await client.query(
      `INSERT INTO users (email, password_hash, name, role, must_change_password)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@junktion.ng', hash, 'Junktion Admin', 'owner', true]
    )
    console.log('✓ Owner account seeded.')

    await client.query(
      `INSERT INTO payment_accounts (account_name, account_number, bank_name, is_primary)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      ['Junktion LTD', '5119991680', 'Moniepoint', true]
    )
    console.log('✓ Payment account seeded.')

    const { rows: existing } = await client.query('SELECT COUNT(*) FROM menu_items')
    if (parseInt(existing[0].count, 10) > 0) {
      console.log(`✓ Menu items already seeded (${existing[0].count} items) — skipping.`)
    } else {
      for (const item of MENU_ITEMS) {
        await client.query(
          `INSERT INTO menu_items (name, description, price, category, image_url, cloudinary_public_id, is_available, is_featured, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [item.name, item.description, item.price, item.category,
           item.imageUrl, item.cloudinaryPublicId, true,
           item.displayOrder <= 3, item.displayOrder]
        )
      }
      console.log('✓ Menu items seeded (18 items).')
    }
    console.log('\nDone. Login: admin@junktion.ng / JunktionAdmin2025!')
    console.log('IMPORTANT: Change this password after first login!')
  } finally {
    await client.end()
  }
}

seed().catch(console.error)
