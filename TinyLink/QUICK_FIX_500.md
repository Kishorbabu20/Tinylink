# Quick Fix for 500 Error on `/api/links`

## Immediate Steps to Diagnose

### 1. Check Your Debug Endpoint
Visit `/api/debug` in your browser. This will show you:
- Which environment variables are set
- Whether the database connection works
- The exact error message

**Example**: If your app is at `https://your-app.vercel.app`, visit:
```
https://your-app.vercel.app/api/debug
```

### 2. Check Server Logs

**For Vercel:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click latest deployment → **Functions** tab
3. Click on `/api/links` → **Logs** tab
4. Look for error messages starting with `GET /api/links error:` or `POST /api/links error:`

**For Local Development:**
- Check your terminal where `npm run dev` is running
- Look for error messages in the console

### 3. Most Common Fixes

#### Fix #1: Missing Environment Variables (90% of cases)

**For Vercel:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add one of these options:

   **Option A - Single URL (Recommended):**
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   ```

   **Option B - Individual Variables:**
   ```
   DB_HOST=your-host
   DB_PORT=3306
   DB_USER=your-user
   DB_PASSWORD=your-password
   DB_NAME=your-database
   ```

3. **IMPORTANT**: Make sure to select **Production**, **Preview**, AND **Development** environments
4. Click **Save**
5. **Redeploy** your project (Deployments → ⋯ → Redeploy)

**For Local Development:**
1. Create `.env.local` in your project root:
   ```
   DATABASE_URL=mysql://root:password@localhost:3306/tinylink
   ```
2. Restart your dev server (`npm run dev`)

#### Fix #2: Database Table Doesn't Exist

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

#### Fix #3: Database Not Accessible

- **For Vercel**: Ensure your database provider allows connections from Vercel
  - PlanetScale: Enable "Allow connections from Vercel" in settings
  - Railway: Check firewall/network settings
  - Other providers: Whitelist Vercel's IP addresses

- **For Local**: Ensure MySQL is running:
  ```bash
  # Windows
  net start MySQL80
  
  # Mac/Linux
  sudo systemctl start mysql
  ```

## Understanding the Error Response

When you get a 500 error, the response body contains:
```json
{
  "error": "Internal server error",
  "message": "[actual error message here]"
}
```

To see this:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Make a request to `/api/links`
4. Click on the failed request
5. Check the **Response** tab

The `message` field will tell you exactly what's wrong.

## Test Your Fix

After applying fixes:
1. Visit `/api/debug` - should show `"status": "connected"`
2. Visit `/api/links` - should return `[]` (empty array) or a list of links
3. Check browser console - no 500 errors

## Still Not Working?

1. **Check `/api/debug`** - This will show you exactly what's wrong
2. **Check Vercel Function Logs** - Look for the actual error message
3. **Verify Database Connection** - Test with a MySQL client using the same credentials
4. **Check Database Schema** - Run `DESCRIBE links;` to verify table structure

For more detailed information, see [DEBUG_500_ERROR.md](./DEBUG_500_ERROR.md)

