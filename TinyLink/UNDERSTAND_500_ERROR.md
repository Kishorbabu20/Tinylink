# Understanding the 500 Error on `/api/links`

## What This Error Means

A **500 Internal Server Error** means something went wrong on the server when processing your request. The error is being caught and handled, but you need to see the actual error message to fix it.

## How to See the Actual Error Message

### Method 1: Browser DevTools (Easiest)

1. **Open your browser's Developer Tools**:
   - Press `F12` or `Right-click → Inspect`
   - Or press `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

2. **Go to the Network tab**

3. **Make the request** that's failing:
   - Refresh the page, or
   - Try to create/fetch a link

4. **Click on the failed request** (it will be red and show status 500)

5. **Check the Response tab** - You'll see something like:
   ```json
   {
     "error": "Internal server error",
     "message": "Database configuration not found...",
     "hint": "Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME..."
   }
   ```

   The `message` field tells you exactly what's wrong!

### Method 2: Check Server Logs

**For Vercel (Production):**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Deployments** → Click latest deployment
4. Click **Functions** tab
5. Click on `/api/links` function
6. Check the **Logs** tab

**For Local Development:**
- Look at your terminal where you ran `npm run dev`
- You'll see: `GET /api/links error: [error message]`

### Method 3: Use the Debug Endpoint

Visit `/api/debug` in your browser. This endpoint will show you:
- Which environment variables are set
- Whether database connection works
- The exact error message

**Example**: If your app is at `https://your-app.vercel.app`, visit:
```
https://your-app.vercel.app/api/debug
```

## Common Error Messages and Fixes

### Error: "Database configuration not found..."

**Fix**: Set environment variables

**For Vercel:**
1. Dashboard → Settings → Environment Variables
2. Add: `DATABASE_URL=mysql://user:password@host:port/database`
3. Make sure it's enabled for **Production**, **Preview**, and **Development**
4. **Redeploy** after adding

**For Local:**
1. Create `.env.local` in project root:
   ```
   DATABASE_URL=mysql://root:password@localhost:3306/tinylink
   ```
2. Restart dev server

---

### Error: "Table 'links' does not exist..."

**Fix**: Create the database table

Run this SQL in your database:
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

Or use the `schema.sql` file from your project.

---

### Error: "Failed to connect to database..."

**Possible causes:**
- Database server is not running
- Wrong credentials
- Database host is not accessible
- Firewall blocking connection

**Fix:**
- Verify database is running
- Check connection credentials
- For Vercel: Ensure database allows connections from Vercel IPs
- Test connection with a MySQL client

---

### Error: "Code already exists" (409, not 500)

This is expected - it means the custom code you're trying to use is already taken. Choose a different code.

## Quick Diagnostic Steps

1. ✅ **Check `/api/debug`** - Shows environment variables and connection status
2. ✅ **Check browser DevTools Network tab** - See the error message in response
3. ✅ **Check server logs** - See detailed error information
4. ✅ **Verify environment variables** - Make sure they're set correctly
5. ✅ **Test database connection** - Use a MySQL client with same credentials

## What I Fixed

I've improved the error handling so you get more helpful error messages:

- ✅ Error messages now include a `hint` field with specific fix instructions
- ✅ Database functions now have better error handling
- ✅ Exported `getConnection` function for debugging tools

## Next Steps

1. **Open browser DevTools** and check the Network tab response
2. **Or visit `/api/debug`** to see diagnostic information
3. **Apply the fix** based on the error message you see
4. **Test again** - the error should be resolved

The error message will tell you exactly what to fix!

