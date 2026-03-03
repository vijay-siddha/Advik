const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'db.sqlite3');
let SQL = null;
let db = null;

async function init() {
  if (db) return;
  SQL = await initSqlJs({
    locateFile: (file) => require.resolve('sql.js/dist/' + file)
  });
  let buffer = null;
  try {
    buffer = fs.readFileSync(DB_FILE);
  } catch {}
  db = new SQL.Database(buffer);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );
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
  `);
  // Attempt to migrate existing DBs lacking 'status' column
  try { db.run(`ALTER TABLE components ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'`); } catch {}
  persist();
}

function persist() {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  persist();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function toLowerEmail(email) {
  return String(email).toLowerCase();
}

function countUsers() {
  const r = get('SELECT COUNT(*) AS c FROM users');
  return r ? r.c : 0;
}

function getUserByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [toLowerEmail(email)]);
}

function getUserById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}

function insertUser(u) {
  run(
    'INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [u.id, toLowerEmail(u.email), u.name, u.password_hash, u.role, u.created_at, u.updated_at]
  );
}

function listUsers() {
  return all('SELECT * FROM users ORDER BY created_at DESC');
}

function updateUser(id, patch) {
  const fields = [];
  const params = [];
  if (patch.email) { fields.push('email = ?'); params.push(toLowerEmail(patch.email)); }
  if (patch.name) { fields.push('name = ?'); params.push(patch.name); }
  if (patch.role) { fields.push('role = ?'); params.push(patch.role); }
  if (patch.password_hash) { fields.push('password_hash = ?'); params.push(patch.password_hash); }
  if (patch.updated_at) { fields.push('updated_at = ?'); params.push(patch.updated_at); }
  if (!fields.length) return;
  params.push(id);
  run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
}

function deleteUser(id) {
  run('DELETE FROM users WHERE id = ?', [id]);
}

function createPasswordReset(user_id, token, expires_at) {
  run('INSERT INTO password_resets (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)', [
    token, user_id, expires_at, new Date().toISOString()
  ]);
}

function getReset(token) {
  return get('SELECT * FROM password_resets WHERE token = ?', [token]);
}

function markResetUsed(token) {
  run('UPDATE password_resets SET used_at = ? WHERE token = ?', [new Date().toISOString(), token]);
}

function insertComponent(c) {
  run(
    'INSERT INTO components (id, name, parent_id, attributes, media, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [c.id, c.name, c.parent_id || null, JSON.stringify(c.attributes || {}), JSON.stringify(c.media || {}), c.status || 'draft', c.created_at, c.updated_at]
  );
}

function listComponents(parentId = null) {
  if (parentId) {
    return all('SELECT * FROM components WHERE parent_id = ? ORDER BY created_at DESC', [parentId]);
  }
  return all('SELECT * FROM components WHERE parent_id IS NULL ORDER BY created_at DESC');
}

function countComponents() {
  const r = get('SELECT COUNT(*) AS c FROM components');
  return r ? r.c : 0;
}

function getComponentById(id) {
  return get('SELECT * FROM components WHERE id = ?', [id]);
}

function listAllComponents() {
  return all('SELECT * FROM components');
}

function updateComponent(id, patch) {
  const fields = [];
  const params = [];
  if (patch.name !== undefined) { fields.push('name = ?'); params.push(patch.name); }
  if (patch.parent_id !== undefined) { fields.push('parent_id = ?'); params.push(patch.parent_id || null); }
  if (patch.attributes !== undefined) { fields.push('attributes = ?'); params.push(JSON.stringify(patch.attributes || {})); }
  if (patch.media !== undefined) { fields.push('media = ?'); params.push(JSON.stringify(patch.media || {})); }
  if (patch.status !== undefined) { fields.push('status = ?'); params.push(patch.status); }
  if (patch.updated_at !== undefined) { fields.push('updated_at = ?'); params.push(patch.updated_at); }
  if (!fields.length) return;
  params.push(id);
  run(`UPDATE components SET ${fields.join(', ')} WHERE id = ?`, params);
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
