const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const {
  init: initDB,
  countUsers,
  getUserByEmail,
  getUserById,
  insertUser,
  listUsers,
  updateUser: updateUserRow,
  deleteUser: deleteUserRow,
  createPasswordReset,
  getReset,
  markResetUsed,
  countComponents,
  insertComponent,
  listComponents,
  getComponentById,
  updateComponent,
  listAllComponents
} = require('./db/postgres');
const can_access = require('./api/middleware/can_access');
const multer = require('multer');
const fs = require('fs');

const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const baseSchema = require('./shared/schema/user.schema.json');
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(baseSchema);
const validateUserInsert = ajv.getSchema(baseSchema.$id + '#/$defs/UserInsert');
const validateUserUpdate = ajv.getSchema(baseSchema.$id + '#/$defs/UserUpdate');
const validateResetRequest = ajv.getSchema(baseSchema.$id + '#/$defs/PasswordResetRequest');
const validateResetConfirm = ajv.getSchema(baseSchema.$id + '#/$defs/PasswordResetConfirm');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const NODE_ENV = process.env.NODE_ENV || 'development';

function genId() {
  return uuidv4();
}

function sanitizeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

const app = express();

const alwaysAllowed = ["https://advik-client.vercel.app"];

// CORS configuration
const corsOrigins = [...alwaysAllowed , 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];

// Configure CORS with JSON headers
app.use(cors({
  origin: "*", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

let ready = initDB();

app.get('/', (req, res) => {
  res.json({ service: 'basic-user-management-api', ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/db/health', async (req, res) => {
  try {
    await ready;
    const users = await listUsers();
    const components = await countComponents();
    res.json({ ok: true, users: users.length, components });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message ? e.message : e) });
  }
});

app.post('/api/auth/register', async (req, res) => {
  await ready;
  const { email, name, password } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const dataInsert = { email, name, password };
  if (!validateUserInsert(dataInsert)) {
    return res.status(400).json({ error: ajv.errorsText(validateUserInsert.errors) });
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const password_hash = bcrypt.hashSync(password, 10);
  const isFirst = (await countUsers()) === 0;
  const user = {
    id: genId(),
    email,
    name,
    role: isFirst ? 'admin' : 'user',
    password_hash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await insertUser(user);
  const token = issueToken(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  await ready;
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = issueToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/me', authMiddleware, async (req, res) => {
  await ready;
  const me = await getUserById(req.user.sub);
  if (!me) return res.status(404).json({ error: 'User not found' });
  res.json({ user: sanitizeUser(me) });
});

// Admin-only user management
app.get('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
  await ready;
  const users = await listUsers();
  res.json({ users: users.map(sanitizeUser) });
});

app.post('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
  await ready;
  const { email, name, password, role } = req.body || {};
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const dataInsert = { email, name, password, role };
  if (!validateUserInsert(dataInsert)) {
    return res.status(400).json({ error: ajv.errorsText(validateUserInsert.errors) });
  }
  const exists = await getUserByEmail(email);
  if (exists) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  const user = {
    id: genId(),
    email,
    name,
    role: role === 'admin' ? 'admin' : 'user',
    password_hash: bcrypt.hashSync(password, 10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  insertUser(user);
  res.status(201).json({ user: sanitizeUser(user) });
});

app.patch('/api/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  await ready;
  const id = req.params.id;
  const { email, name, role, password } = req.body || {};
  const existing = getUserById(id);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  const dataUpdate = {};
  if (email !== undefined) dataUpdate.email = email;
  if (name !== undefined) dataUpdate.name = name;
  if (role !== undefined) dataUpdate.role = role;
  if (password !== undefined) dataUpdate.password = password;
  if (!validateUserUpdate(dataUpdate)) {
    return res.status(400).json({ error: ajv.errorsText(validateUserUpdate.errors) });
  }
  if (email) {
    const dup = await getUserByEmail(email);
    if (dup && dup.id !== id) {
      return res.status(409).json({ error: 'Email already exists' });
    }
  }
  const patch = {};
  if (email) patch.email = email;
  if (name) patch.name = name;
  if (role) patch.role = role === 'admin' ? 'admin' : 'user';
  if (password) patch.password_hash = bcrypt.hashSync(password, 10);
  patch.updated_at = new Date().toISOString();
  await updateUserRow(id, patch);
  const updated = await getUserById(id);
  res.json({ user: sanitizeUser(updated) });
});

app.delete('/api/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  await ready;
  const id = req.params.id;
  const existing = getUserById(id);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  await deleteUserRow(id);
  res.json({ user: sanitizeUser(existing) });
});

app.post('/api/auth/password/reset-request', async (req, res) => {
  await ready;
  const { email } = req.body || {};
  const data = { email };
  if (!validateResetRequest(data)) {
    return res.status(400).json({ error: ajv.errorsText(validateResetRequest.errors) });
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.json({ ok: true });
  }
  const token = require('crypto').randomBytes(24).toString('hex');
  const expires_at = new Date(Date.now() + 1000 * 60 * 15).toISOString();
  await createPasswordReset(user.id, token, expires_at);
  res.json({ ok: true, token });
});

app.post('/api/auth/password/reset-confirm', async (req, res) => {
  await ready;
  const { token, password } = req.body || {};
  const data = { token, password };
  if (!validateResetConfirm(data)) {
    return res.status(400).json({ error: ajv.errorsText(validateResetConfirm.errors) });
  }
  const rec = await getReset(token);
  if (!rec) return res.status(400).json({ error: 'Invalid token' });
  if (rec.used_at) return res.status(400).json({ error: 'Token already used' });
  if (new Date(rec.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'Token expired' });
  const hash = bcrypt.hashSync(password, 10);
  await updateUserRow(rec.user_id, { password_hash: hash, updated_at: new Date().toISOString() });
  await markResetUsed(token);
  res.json({ ok: true });
});

// Multer storage for media uploads
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, unique + '-' + safeName);
  }
});
const upload = multer({ storage });

app.get('/api/components', authMiddleware, can_access('user'), async (req, res) => {
  await ready;
  const parent = req.query.parent_id || null;
  const includeChildren = req.query.include_children === 'true';

  let rows;
  if (includeChildren && !parent) {
    // Get all components for tree view
    rows = await listAllComponents();
  } else {
    // Original behavior - get only root level or specific parent
    rows = await listComponents(parent || null);
  }

  const items = rows.map(r => ({
    id: r.id,
    name: r.name,
    parent_id: r.parent_id || null,
    attributes: JSON.parse(r.attributes || '{}'),
    media: JSON.parse(r.media || '{}'),
    status: r.status || 'draft',
    created_at: r.created_at,
    updated_at: r.updated_at
  }));
  const statusFilter = req.query.status;
  const filtered = statusFilter ? items.filter(it => it.status === statusFilter) : items;
  res.json({ items: filtered });
});

app.post(
  '/api/components',
  authMiddleware,
  can_access('manager'),
  upload.fields([{ name: 'photos', maxCount: 10 }, { name: 'videos', maxCount: 10 }, { name: 'docs', maxCount: 10 }]),
  async (req, res) => {
    await ready;
    const { name, parent_id, status } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    let attributes = {};
    try {
      attributes = req.body.attributes ? JSON.parse(req.body.attributes) : {};
    } catch {
      return res.status(400).json({ error: 'attributes must be JSON' });
    }
    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    const files = req.files || {};
    const media = {
      photos: (files.photos || []).map(f => '/uploads/' + f.filename),
      videos: (files.videos || []).map(f => '/uploads/' + f.filename),
      docs: (files.docs || []).map(f => '/uploads/' + f.filename)
    };
    // circular dependency prevention
    if (parent_id) {
      const seen = new Set();
      let cur = parent_id;
      while (cur) {
        if (seen.has(cur)) break;
        seen.add(cur);
        if (cur === req.params?.id) return res.status(400).json({ error: 'Circular dependency' });
        const p = getComponentById(cur);
        cur = p ? p.parent_id : null;
      }
    }
    const id = genId();
    const now = new Date().toISOString();
    insertComponent({
      id,
      name,
      parent_id: parent_id || null,
      attributes,
      media,
      status: status || 'draft',
      created_at: now,
      updated_at: now
    });
    res.status(201).json({ item: { id, name, parent_id: parent_id || null, attributes, media, status: status || 'draft', created_at: now, updated_at: now } });
  }
);

app.get('/api/components/attribute-keys', authMiddleware, can_access('user'), async (req, res) => {
  await ready;
  const rows = await listComponents(null);
  const keys = new Set();
  rows.forEach(r => {
    try {
      const attrs = JSON.parse(r.attributes || '{}');
      Object.keys(attrs || {}).forEach(k => keys.add(k));
    } catch { }
  });
  res.json({ keys: Array.from(keys).sort() });
});

app.put(
  '/api/components/:id',
  authMiddleware,
  can_access('manager'),
  upload.fields([{ name: 'photos', maxCount: 10 }, { name: 'videos', maxCount: 10 }, { name: 'docs', maxCount: 10 }]),
  async (req, res) => {
    await ready;
    const id = req.params.id;
    const existing = await getComponentById(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const { name, parent_id, status } = req.body || {};
    let attributes = undefined;
    if (req.body && 'attributes' in req.body) {
      try {
        attributes = req.body.attributes ? JSON.parse(req.body.attributes) : {};
      } catch {
        return res.status(400).json({ error: 'attributes must be JSON' });
      }
    }
    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    if (parent_id !== undefined) {
      if (id === parent_id) return res.status(400).json({ error: 'Circular dependency' });
      const seen = new Set([id]);
      let cur = parent_id;
      while (cur) {
        if (seen.has(cur)) return res.status(400).json({ error: 'Circular dependency' });
        seen.add(cur);
        const p = await getComponentById(cur);
        cur = p ? p.parent_id : null;
      }
    }
    const files = req.files || {};
    let media = undefined;
    if (files && (files.photos || files.videos || files.docs)) {
      media = {
        photos: (files.photos || []).map(f => '/uploads/' + f.filename).concat(JSON.parse(existing.media || '{}').photos || []),
        videos: (files.videos || []).map(f => '/uploads/' + f.filename).concat(JSON.parse(existing.media || '{}').videos || []),
        docs: (files.docs || []).map(f => '/uploads/' + f.filename).concat(JSON.parse(existing.media || '{}').docs || [])
      };
    }
    const patch = {
      name,
      parent_id,
      attributes,
      media,
      status,
      updated_at: new Date().toISOString()
    };
    Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k]);
    await updateComponent(id, patch);
    const updated = await getComponentById(id);
    res.json({
      item: {
        id: updated.id,
        name: updated.name,
        parent_id: updated.parent_id || null,
        attributes: JSON.parse(updated.attributes || '{}'),
        media: JSON.parse(updated.media || '{}'),
        status: updated.status || 'draft',
        created_at: updated.created_at,
        updated_at: updated.updated_at
      }
    });
  }
);

app.post('/api/components/:id/clone', authMiddleware, can_access('manager'), async (req, res) => {
  await ready;
  const id = req.params.id;
  const existing = await getComponentById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  const newId = genId();
  await insertComponent({
    id: newId,
    name: existing.name + ' Copy',
    parent_id: existing.parent_id || null,
    attributes: JSON.parse(existing.attributes || '{}'),
    media: JSON.parse(existing.media || '{}'),
    status: existing.status || 'draft',
    created_at: now,
    updated_at: now
  });
  res.status(201).json({ item: { id: newId } });
});

app.get('/api/components/:id/tree', authMiddleware, can_access('user'), async (req, res) => {
  await ready;
  const id = req.params.id;
  const rows = await listAllComponents();
  const byId = new Map(rows.map(r => [r.id, r]));
  const root = byId.get(id);
  if (!root) return res.status(404).json({ error: 'Not found' });
  const childrenMap = new Map();
  rows.forEach(r => {
    const p = r.parent_id || null;
    if (!childrenMap.has(p)) childrenMap.set(p, []);
    childrenMap.get(p).push(r);
  });
  function toItem(r) {
    return {
      id: r.id,
      name: r.name,
      parent_id: r.parent_id || null,
      attributes: JSON.parse(r.attributes || '{}'),
      media: JSON.parse(r.media || '{}'),
      status: r.status || 'draft',
      created_at: r.created_at,
      updated_at: r.updated_at
    };
  }
  function build(nodeId) {
    const r = byId.get(nodeId);
    const kids = (childrenMap.get(nodeId) || []).map(ch => build(ch.id));
    return { ...toItem(r), children: kids };
  }
  const ancestors = [];
  let cur = root.parent_id;
  const seen = new Set([id]);
  while (cur) {
    if (seen.has(cur)) break;
    seen.add(cur);
    const p = byId.get(cur);
    if (!p) break;
    ancestors.push(toItem(p));
    cur = p.parent_id || null;
  }
  res.json({ item: build(id), ancestors });
});
async function seedComponentsIfEmpty() {
  await ready;
  const needSeed = (await countComponents()) < 3;
  if (!needSeed) return;
  const now = new Date().toISOString();
  const base = [
    {
      id: 'CMP-001',
      name: 'Industrial Centrifugal Pump',
      parent_id: null,
      media: {
        photos: ['https://placehold.co/400x300?text=Pump+Main'],
        videos: ['/uploads/pump_demo.mp4'],
        form_links: ['https://forms.gle/pump-inspection']
      },
      attributes: {
        'Flow Rate': '500 m³/h',
        'Max Pressure': '15 Bar',
        'Power Source': 'Electric',
        'Operating Temp': '-10°C to 120°C',
        'Material': 'Stainless Steel 316'
      }
    },
    {
      id: 'SUB-101',
      name: 'Heavy Duty Impeller',
      parent_id: 'CMP-001',
      media: {
        photos: ['https://placehold.co/400x300?text=Impeller'],
        videos: [],
        form_links: []
      },
      attributes: {
        'Diameter': '250mm',
        'Vane Count': '6',
        'Balancing Grade': 'G2.5',
        'Coating': 'Ceramic'
      }
    },
    {
      id: 'CMP-002',
      name: 'High-Pressure Diesel Generator',
      parent_id: null,
      media: {
        photos: ['https://placehold.co/400x300?text=Generator'],
        videos: ['/uploads/gen_startup.mp4'],
        form_links: []
      },
      attributes: {
        'Power Output': '250 kVA',
        'Fuel Consumption': '45 L/h',
        'Max Pressure': '10 Bar',
        'Noise Level': '75 dB',
        'Cooling System': 'Water Cooled'
      }
    },
    {
      id: 'SUB-102',
      name: 'Fuel Injection Nozzle',
      parent_id: 'CMP-002',
      media: {
        photos: ['https://placehold.co/400x300?text=Nozzle'],
        videos: [],
        form_links: []
      },
      attributes: {
        'Spray Angle': '120°',
        'Opening Pressure': '250 Bar',
        'Material': 'Tungsten Carbide'
      }
    }
  ];
  let inserted = 0;
  for (const c of base) {
    const exists = await getComponentById(c.id);
    if (!exists) {
      await insertComponent({
        id: c.id,
        name: c.name,
        parent_id: c.parent_id,
        attributes: c.attributes,
        media: c.media,
        created_at: now,
        updated_at: now
      });
      inserted++;
    }
  }
  if (inserted) console.log(`Seeded ${inserted} demo components`);
}

ready.then(async () => {
  await seedComponentsIfEmpty();

  // For Vercel serverless deployment
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    module.exports = app;
  } else {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      if (JWT_SECRET === 'dev-secret-change-me') {
        console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in production.');
      }
    });
  }
});
