// Quick script to check if title column exists
import mysql from 'mysql2/promise';

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tinylink',
    });

    const [columns] = await connection.execute('DESCRIBE links');
    console.log('Links table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    const hasTitle = columns.some(col => col.Field === 'title');
    if (!hasTitle) {
      console.log('\n❌ Title column does not exist!');
      console.log('Run: mysql -u root -p tinylink < migration_add_title.sql');
    } else {
      console.log('\n✅ Title column exists!');
    }

    await connection.end();
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

checkSchema();

