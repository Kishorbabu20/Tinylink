const mysql = require('mysql2/promise');

let pool = null;

async function getConnection() {
  // Check for DATABASE_URL or individual env vars
  const hasDatabaseConfig = process.env.DATABASE_URL || 
    (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
  
  if (!hasDatabaseConfig) {
    throw new Error('Database configuration not found. Please set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables.');
  }

  if (!pool) {
    try {
      // Parse DATABASE_URL or use individual env vars
      let connectionConfig;
      if (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('mysql://') || process.env.DATABASE_URL.startsWith('mysql2://'))) {
        connectionConfig = parseConnectionString(process.env.DATABASE_URL);
      } else {
        connectionConfig = {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'tinylink',
        };
      }

      console.log('Connecting to MySQL:', {
        host: connectionConfig.host,
        port: connectionConfig.port,
        database: connectionConfig.database,
        user: connectionConfig.user,
      });

      pool = mysql.createPool({
        ...connectionConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test the connection
      const testConnection = await pool.getConnection();
      await testConnection.ping();
      testConnection.release();
      console.log('MySQL connection successful');
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  }
  return pool;
}

function parseConnectionString(url) {
  try {
    // Handle mysql:// or mysql2:// protocol
    let cleanUrl = url.replace(/^mysql2?:\/\//, 'mysql://');
    
    // Parse mysql://user:password@host:port/database
    const urlPattern = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const match = cleanUrl.match(urlPattern);
    
    if (!match) {
      // Try without port (default 3306)
      const urlPatternNoPort = /^mysql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)$/;
      const matchNoPort = cleanUrl.match(urlPatternNoPort);
      if (matchNoPort) {
        return {
          user: decodeURIComponent(matchNoPort[1]),
          password: decodeURIComponent(matchNoPort[2]),
          host: matchNoPort[3],
          port: 3306,
          database: matchNoPort[4],
        };
      }
      throw new Error('Invalid DATABASE_URL format. Use: mysql://user:password@host:port/database');
    }
    
    return {
      user: decodeURIComponent(match[1]),
      password: decodeURIComponent(match[2]),
      host: match[3],
      port: parseInt(match[4]),
      database: match[5],
    };
  } catch (error) {
    throw new Error(`Failed to parse DATABASE_URL: ${error.message}`);
  }
}

async function createLink(code, url, title = null) {
  try {
    const db = await getConnection();
    const query = 'INSERT INTO links (code, url, title) VALUES (?, ?, ?)';
    const values = [code, url, title];
    const [result] = await db.execute(query, values);
    // Fetch the inserted record
    const [rows] = await db.execute('SELECT * FROM links WHERE id = ?', [result.insertId]);
    return rows[0];
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Table "links" does not exist. Please run schema.sql to create the table.');
    }
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Code already exists');
    }
    throw error;
  }
}

async function getAllLinks() {
  try {
    const db = await getConnection();
    const query = 'SELECT * FROM links ORDER BY createdAt DESC';
    const [rows] = await db.execute(query);
    return rows;
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Table "links" does not exist. Please run schema.sql to create the table.');
    }
    throw error;
  }
}

async function getLinkByCode(code) {
  try {
    const db = await getConnection();
    const query = 'SELECT * FROM links WHERE code = ?';
    const values = [code];
    const [rows] = await db.execute(query, values);
    return rows[0] || null;
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Table "links" does not exist. Please run schema.sql to create the table.');
    }
    throw error;
  }
}

async function updateLinkClicks(code) {
  try {
    const db = await getConnection();
    const query = 'UPDATE links SET clickCount = clickCount + 1, lastClicked = CURRENT_TIMESTAMP WHERE code = ?';
    const values = [code];
    await db.execute(query, values);
    // Fetch the updated record
    const [rows] = await db.execute('SELECT * FROM links WHERE code = ?', [code]);
    return rows[0] || null;
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Table "links" does not exist. Please run schema.sql to create the table.');
    }
    throw error;
  }
}

async function updateLinkTitle(code, title) {
  try {
    const db = await getConnection();
    const query = 'UPDATE links SET title = ? WHERE code = ?';
    const values = [title, code];
    await db.execute(query, values);
    // Fetch the updated record
    const [rows] = await db.execute('SELECT * FROM links WHERE code = ?', [code]);
    return rows[0] || null;
  } catch (error) {
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      throw new Error('Title column does not exist in the database. Please run: ALTER TABLE links ADD COLUMN title VARCHAR(500) NULL;');
    }
    console.error('Database error in updateLinkTitle:', error);
    throw error;
  }
}

async function deleteLinkByCode(code) {
  try {
    const db = await getConnection();
    // First get the record to return
    const link = await getLinkByCode(code);
    if (!link) {
      return null;
    }
    const query = 'DELETE FROM links WHERE code = ?';
    const values = [code];
    await db.execute(query, values);
    return link;
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Table "links" does not exist. Please run schema.sql to create the table.');
    }
    throw error;
  }
}

module.exports = {
  getConnection,
  createLink,
  getAllLinks,
  getLinkByCode,
  updateLinkClicks,
  updateLinkTitle,
  deleteLinkByCode,
};
