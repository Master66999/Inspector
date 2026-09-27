require('dotenv').config();
const bcrypt = require('bcrypt');
const { initializeDatabase, pool } = require('../db');

async function seed() {
  console.log('[DB Init] Running database initialization...');
  await initializeDatabase();

  // Seed default demo accounts with hashed passwords
  const demoAccounts = [
    { name: 'Consumer User', email: 'user@packcheck.in', password: 'scan123' },
    { name: 'Manufacturer User', email: 'mfg@packcheck.in', password: 'industry123' },
    { name: 'Inspector User', email: 'inspector@packcheck.in', password: 'industry123' }
  ];

  for (const acc of demoAccounts) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [acc.email]);
    if (existing.length === 0) {
      const hash = await bcrypt.hash(acc.password, 10);
      await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [acc.name, acc.email, hash]
      );
      console.log(`[DB Init] Seeded demo user: ${acc.email}`);
    } else {
      console.log(`[DB Init] Demo user already exists: ${acc.email}`);
    }
  }

  console.log('[DB Init] Database initialization complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('[DB Init Error]:', err.message);
  process.exit(1);
});
