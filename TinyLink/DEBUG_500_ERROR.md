# Understanding the 500 Error on `/api/links`

## What is a 500 Error?

A **500 Internal Server Error** means something went wrong on the server side when processing your request. The error is being caught in the try-catch block of your API route, but the actual error details are logged to the server console, not visible in the browser.

## Common Causes

Based on your code, here are the most likely causes of the 500 error on `/api/links`:

### 1. **Missing Database Configuration** (Most Common)

**Error Message**: `"Database configuration not found. Please set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables."`

**What's happening**: The `getConnection()` function in `lib/db.js` checks for database environment variables. If they're missing, it throws an error.

**How to fix**:
- **For local development**: Create a `.env.local` file in your project root:
  ```
  DATABASE_URL=mysql://username:password@localhost:3306/tinylink
  ```
  OR use individual variables:
  ```
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=yourpassword
  DB_NAME=tinylink
  ```

- **For Vercel deployment**: 
  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  2. Add `DATABASE_URL` or the individual DB variables
  3. Make sure they're set for **Production**, **Preview**, and **Development**
  4. **Redeploy** after adding variables

### 2. **Database Connection Failure**

**Error Message**: `"Failed to connect to database: [error details]"`

**What's happening**: The code can't establish a connection to your MySQL database.

**Possible reasons**:
- Database server is not running (for local development)
- Incorrect connection credentials
- Database host is not accessible (firewall, network issues)
- Database server is down
- Wrong port number

**How to fix**:
- Verify your database is running
- Double-check your connection string/credentials
- Test the connection using a MySQL client
- For Vercel: Ensure your database provider allows connections from Vercel's IP addresses

### 3. **Missing Database Table**

**Error Message**: `"Table 'links' does not exist. Please run schema.sql to create the table."`

**What's happening**: The database exists, but the `links` table hasn't been created yet.

**How to fix**:
1. Connect to your MySQL database
2. Run the SQL from `schema.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS links (
     id INT AUTO_INCREMENT PRIMARY KEY,
     code VARCHAR(255) UNIQUE NOT NULL,
     url TEXT NOT NULL,
     title VARCHAR(500) NULL,
     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     clickCount INT DEFAULT 0,
     lastClicked TIMESTAMP NULL
   );
   ```

### 4. **Invalid DATABASE_URL Format**

**Error Message**: `"Invalid DATABASE_URL format. Use: mysql://user:password@host:port/database"`

**What's happening**: The connection string parser can't parse your `DATABASE_URL`.

**How to fix**:
- Ensure your `DATABASE_URL` follows this exact format:
  ```
  mysql://username:password@host:port/database
  ```
- Special characters in password should be URL-encoded
- Example: If your password is `p@ssw0rd`, it should be `p%40ssw0rd` in the URL

### 5. **Database Query Error**

**Error Message**: Various database-specific errors (e.g., `ER_DUP_ENTRY`, `ER_BAD_FIELD_ERROR`)

**What's happening**: The query itself is failing, possibly due to:
- Missing columns in the table
- Constraint violations
- Database permissions issues

## How to Debug the Error

### Step 1: Check Server Logs

The actual error message is logged to the console. Check:

**For local development**:
- Look at your terminal where you ran `npm run dev`
- You should see: `GET /api/links error: [error message]` or `POST /api/links error: [error message]`

**For Vercel**:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click the **"Functions"** tab
4. Click on `/api/links` function
5. Check the **"Logs"** tab for error messages

### Step 2: Test Database Connection

Create a test endpoint to check your database connection:

```javascript
// app/api/test-db/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // Test connection using your env vars
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tinylink',
    });
    
    await connection.ping();
    await connection.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      hasEnvVars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DB_HOST: !!process.env.DB_HOST,
        DB_USER: !!process.env.DB_USER,
        DB_NAME: !!process.env.DB_NAME,
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      hasEnvVars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DB_HOST: !!process.env.DB_HOST,
        DB_USER: !!process.env.DB_USER,
        DB_NAME: !!process.env.DB_NAME,
      }
    }, { status: 500 });
  }
}
```

Visit `/api/test-db` to see if your database connection works.

### Step 3: Check Environment Variables

**For local development**:
- Verify `.env.local` exists and has correct values
- Restart your dev server after changing `.env.local`

**For Vercel**:
- Go to Settings → Environment Variables
- Verify all required variables are set
- Make sure they're enabled for the correct environment (Production/Preview/Development)
- **Important**: Redeploy after adding/changing environment variables

### Step 4: Verify Database Schema

Run this query in your database to check if the table exists:

```sql
SHOW TABLES LIKE 'links';
DESCRIBE links;
```

If the table doesn't exist or is missing columns, run `schema.sql`.

## Quick Fix Checklist

- [ ] Environment variables are set (`.env.local` for local, Vercel dashboard for production)
- [ ] Database server is running and accessible
- [ ] Database connection credentials are correct
- [ ] `links` table exists in the database
- [ ] Table has all required columns (id, code, url, title, createdAt, clickCount, lastClicked)
- [ ] For Vercel: Environment variables are set for Production environment
- [ ] For Vercel: Redeployed after adding environment variables
- [ ] Checked server logs for the actual error message

## Getting More Detailed Error Information

The current error handling in `app/api/links/route.js` returns:
```json
{
  "error": "Internal server error",
  "message": "[error message]"
}
```

To see the error message in the browser:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make the request to `/api/links`
4. Click on the failed request
5. Check the Response tab - it should show the error message

## Next Steps

1. **Check your server logs** (terminal for local, Vercel Functions logs for production)
2. **Verify environment variables** are set correctly
3. **Test database connection** using the test endpoint above
4. **Check database schema** - ensure the `links` table exists
5. **Review the specific error message** from the logs to identify the exact issue

Once you identify the specific error from the logs, you can apply the appropriate fix from the list above.

