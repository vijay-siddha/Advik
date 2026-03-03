#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '../db.sqlite3');

async function seedComponents() {
  let db = null;
  
  try {
    // Initialize database
    const SQL = await initSqlJs({
      locateFile: (file) => require.resolve('sql.js/dist/' + file)
    });
    
    let buffer = null;
    try {
      buffer = fs.readFileSync(DB_FILE);
    } catch {}
    
    db = new SQL.Database(buffer);
    
    // Create tables if they don't exist
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
    
    // Read component data
    const componentDataPath = path.join(__dirname, '../docs/component_data.json');
    const componentData = JSON.parse(fs.readFileSync(componentDataPath, 'utf8'));
    
    console.log(`📦 Loading ${componentData.length} components into database...`);
    
    // Clear existing components (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing components...');
    db.run('DELETE FROM components');
    
    // Insert each component
    let insertedCount = 0;
    for (const component of componentData) {
      const now = new Date().toISOString();
      
      // Execute the insert
      db.run(`
        INSERT OR REPLACE INTO components (
          id, name, parent_id, attributes, media, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        component.id,
        component.name,
        component.parent_id,
        JSON.stringify(component.attributes),
        JSON.stringify(component.media || { photos: [], videos: [], docs: [] }),
        component.status || 'published',
        now,
        now
      ]);
      
      insertedCount++;
      
      console.log(`✅ Inserted: ${component.name} (${component.id})`);
    }
    
    // Persist changes
    const dbData = db.export();
    const dbBuffer = Buffer.from(dbData);
    fs.writeFileSync(DB_FILE, dbBuffer);
    
    console.log(`\n🎉 Successfully seeded ${insertedCount} components into the database!`);
    console.log(`📊 Total components in database: ${getComponentCount(db)}`);
    
  } catch (error) {
    console.error('❌ Error seeding components:', error);
    process.exit(1);
  } finally {
    if (db) db.close();
  }
}

function getComponentCount(db) {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM components');
    const result = stmt.get();
    stmt.free();
    return result ? result.count : 0;
  } catch (error) {
    console.warn('⚠️  Could not get component count:', error.message);
    return 0;
  }
}

// Run the seed function
seedComponents();
