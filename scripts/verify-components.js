#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '../db.sqlite3');

async function verifyComponents() {
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
    
    // Get total count
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM components');
    const countResult = countStmt.getAsObject([]);
    countStmt.free();
    
    console.log(`📊 Total components in database: ${countResult.count}`);
    
    // Show root components
    const rootStmt = db.prepare('SELECT id, name, status FROM components WHERE parent_id IS NULL ORDER BY name');
    const rootComponents = [];
    while (rootStmt.step()) {
      rootComponents.push(rootStmt.getAsObject());
    }
    rootStmt.free();
    
    console.log('\n🌳 Root Components:');
    rootComponents.forEach(comp => {
      console.log(`  • ${comp.name} (${comp.id}) - ${comp.status}`);
      
      // Show children
      const childStmt = db.prepare('SELECT id, name, status FROM components WHERE parent_id = ? ORDER BY name');
      childStmt.bind([comp.id]);
      const children = [];
      while (childStmt.step()) {
        children.push(childStmt.getAsObject());
      }
      childStmt.free();
      
      children.forEach(child => {
        console.log(`    └─ ${child.name} (${child.id}) - ${child.status}`);
        
        // Show grandchildren
        const grandchildStmt = db.prepare('SELECT id, name, status FROM components WHERE parent_id = ? ORDER BY name');
        grandchildStmt.bind([child.id]);
        const grandchildren = [];
        while (grandchildStmt.step()) {
          grandchildren.push(grandchildStmt.getAsObject());
        }
        grandchildStmt.free();
        
        grandchildren.forEach(grandchild => {
          console.log(`       └─ ${grandchild.name} (${grandchild.id}) - ${grandchild.status}`);
        });
      });
    });
    
    // Show sample attributes
    console.log('\n📋 Sample Component Attributes:');
    const sampleStmt = db.prepare('SELECT name, attributes FROM components LIMIT 2');
    const samples = [];
    while (sampleStmt.step()) {
      samples.push(sampleStmt.getAsObject());
    }
    sampleStmt.free();
    
    samples.forEach(sample => {
      const attrs = JSON.parse(sample.attributes);
      console.log(`\n${sample.name}:`);
      Object.entries(attrs).slice(0, 3).forEach(([key, value]) => {
        console.log(`  • ${key}: ${value}`);
      });
      if (Object.keys(attrs).length > 3) {
        console.log(`  ... and ${Object.keys(attrs).length - 3} more attributes`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error verifying components:', error);
    process.exit(1);
  } finally {
    if (db) db.close();
  }
}

verifyComponents();
