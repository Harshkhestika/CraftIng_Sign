# Debugging Login Issues

## Step 1: Check if Admin User Exists

Run this command to check if admin user exists:
```bash
cd backend
npm run create-admin
```

This will:
- Create the admin user if it doesn't exist
- Reset the password if it exists
- Verify the password works

## Step 2: Check Backend Logs

When you try to login, check your backend server console. You should see logs like:
```
Login attempt for: admin@craftingsign.com
User found: admin@craftingsign.com, Active: true, IsAdmin: true
Password match: true/false
Login successful/failed...
```

## Step 3: Test Admin User Exists via API

You can check if admin exists by calling:
```
GET http://your-backend-url/api/auth/check-admin
```

This will return:
```json
{
  "exists": true,
  "email": "admin@craftingsign.com",
  "isAdmin": true,
  "active": true,
  "name": "Admin User"
}
```

## Step 4: Verify Environment Variables

Make sure your `.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/crafting-sign
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
```

## Step 5: Check MongoDB Connection

Make sure MongoDB is running and accessible:
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017/crafting-sign

# In MongoDB shell, check users:
use crafting-sign
db.users.find({ email: "admin@craftingsign.com" })
```

## Step 6: Common Issues

1. **User doesn't exist**: Run `npm run create-admin`
2. **Password mismatch**: The script verifies password, so if it passes, login should work
3. **Database connection**: Check MongoDB is running and MONGODB_URI is correct
4. **JWT_SECRET missing**: Add it to your .env file
5. **Email case sensitivity**: Emails are automatically lowercased, so `Admin@CraftingSign.com` becomes `admin@craftingsign.com`

## Step 7: Test Login Directly

You can test login with curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@craftingsign.com","password":"admin123"}'
```

Expected response:
```json
{
  "_id": "...",
  "email": "admin@craftingsign.com",
  "name": "Admin User",
  "isAdmin": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Still Having Issues?

1. Check browser console for detailed error messages
2. Check backend console for login attempt logs
3. Verify MongoDB connection
4. Make sure you're using the correct API URL (check frontend console for "API Base URL")
5. Try clearing browser localStorage and cookies

