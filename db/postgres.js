const { neon } = require('@neondatabase/serverless');

// Database connection
let sql = null;
let useSQLite = false;

async function init() {
  if (sql || useSQLite) return;
  
  const DATABASE_URL = process.env.DATABASE_URL;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  
  // For local development without PostgreSQL, fall back to SQLite
  if (!DATABASE_URL && NODE_ENV === 'development') {
    console.warn('DATABASE_URL not found, falling back to SQLite for local development');
    const sqlite = require('./sqlite');
    await sqlite.init();
    useSQLite = true;
    // Export all SQLite functions
    const sqliteFunctions = require('./sqlite');
    Object.assign(exports, sqliteFunctions);
    return;
  }
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for production');
  }
  
  sql = neon(DATABASE_URL);
  
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT REFERENCES components(id) ON DELETE SET NULL,
      attributes TEXT NOT NULL,
      media TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `;
  
  // Create indexes for better performance
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_components_parent_id ON components(parent_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);`;
}

function toLowerEmail(email) {
  return String(email).toLowerCase();
}

async function countUsers() {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.countUsers();
  }
  const result = await sql`SELECT COUNT(*) as count FROM users`;
  return result[0]?.count || 0;
}

async function getUserByEmail(email) {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.getUserByEmail(email);
  }
  const result = await sql`SELECT * FROM users WHERE email = ${toLowerEmail(email)}`;
  return result[0] || null;
}

async function getUserById(id) {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.getUserById(id);
  }
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result[0] || null;
}

async function insertUser(u) {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.insertUser(u);
  }
  await sql`
    INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) 
    VALUES (${u.id}, ${toLowerEmail(u.email)}, ${u.name}, ${u.password_hash}, ${u.role}, ${u.created_at}, ${u.updated_at})
  `;
}

async function listUsers() {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.listUsers();
  }
  return await sql`SELECT * FROM users ORDER BY created_at DESC`;
}

async function updateUser(id, patch) {
  const updates = [];
  const values = [];
  
  if (patch.email) { updates.push('email = ?'); values.push(toLowerEmail(patch.email)); }
  if (patch.name) { updates.push('name = ?'); values.push(patch.name); }
  if (patch.role) { updates.push('role = ?'); values.push(patch.role); }
  if (patch.password_hash) { updates.push('password_hash = ?'); values.push(patch.password_hash); }
  if (patch.updated_at) { updates.push('updated_at = ?'); values.push(patch.updated_at); }
  
  if (updates.length === 0) return;
  
  values.push(id);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  await sql.query(query, values);
}

async function deleteUser(id) {
  await sql`DELETE FROM users WHERE id = ${id}`;
}

async function createPasswordReset(user_id, token, expires_at) {
  await sql`
    INSERT INTO password_resets (token, user_id, expires_at, created_at) 
    VALUES (${token}, ${user_id}, ${expires_at}, ${new Date().toISOString()})
  `;
}

async function getReset(token) {
  const result = await sql`SELECT * FROM password_resets WHERE token = ${token}`;
  return result[0] || null;
}

async function markResetUsed(token) {
  await sql`UPDATE password_resets SET used_at = ${new Date().toISOString()} WHERE token = ${token}`;
}

async function insertComponent(c) {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.insertComponent(c);
  }
  await sql`
    INSERT INTO components (id, name, parent_id, attributes, media, status, created_at, updated_at) 
    VALUES (${c.id}, ${c.name}, ${c.parent_id || null}, ${JSON.stringify(c.attributes || {})}, ${JSON.stringify(c.media || {})}, ${c.status || 'draft'}, ${c.created_at}, ${c.updated_at})
  `;
}

async function listComponents(parentId = null) {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.listComponents(parentId);
  }
  if (parentId) {
    return await sql`SELECT * FROM components WHERE parent_id = ${parentId} ORDER BY created_at DESC`;
  }
  return await sql`SELECT * FROM components WHERE parent_id IS NULL ORDER BY created_at DESC`;
}

async function countComponents() {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.countComponents();
  }
  const result = await sql`SELECT COUNT(*) as count FROM components`;
  return result[0]?.count || 0;
}

async function getComponentById(id) {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.getComponentById(id);
  }
  const result = await sql`SELECT * FROM components WHERE id = ${id}`;
  return result[0] || null;
}

async function listAllComponents() {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.listAllComponents();
  }
  return await sql`SELECT * FROM components`;
}

async function updateComponent(id, patch) {
  if (useSQLite) {
    const sqlite = require('./sqlite');
    return await sqlite.updateComponent(id, patch);
  }
  const updates = [];
  const values = [];
  
  if (patch.name !== undefined) { updates.push('name = ?'); values.push(patch.name); }
  if (patch.parent_id !== undefined) { updates.push('parent_id = ?'); values.push(patch.parent_id || null); }
  if (patch.attributes !== undefined) { updates.push('attributes = ?'); values.push(JSON.stringify(patch.attributes || {})); }
  if (patch.media !== undefined) { updates.push('media = ?'); values.push(JSON.stringify(patch.media || {})); }
  if (patch.status !== undefined) { updates.push('status = ?'); values.push(patch.status); }
  if (patch.updated_at !== undefined) { updates.push('updated_at = ?'); values.push(patch.updated_at); }
  
  if (updates.length === 0) return;
  
  values.push(id);
  const query = `UPDATE components SET ${updates.join(', ')} WHERE id = ?`;
  await sql.query(query, values);
}

module.exports = {
  init,
  countUsers,
  getUserByEmail,
  getUserById,
  insertUser,
  listUsers,
  updateUser,
  deleteUser,
  createPasswordReset,
  getReset,
  markResetUsed,
  insertComponent,
  listComponents,
  countComponents,
  getComponentById,
  updateComponent,
  listAllComponents
};
