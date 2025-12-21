# Admin User Setup

## Quick Setup

If you're getting "Invalid credentials" error, the admin user might not exist in the database. Run this command to create/reset the admin user:

```bash
cd backend
npm run create-admin
```

This will create an admin user with:
- **Email**: `admin@craftingsign.com`
- **Password**: `admin123`

## Alternative: Run Seed Script

You can also run the full seed script which creates products, categories, and admin user:

```bash
cd backend
npm run seed
```

## Troubleshooting

1. **Make sure MongoDB is running** and connected
2. **Check your `.env` file** has the correct `MONGODB_URI`
3. **Try logging in** with:
   - Email: `admin@craftingsign.com`
   - Password: `admin123`

## Manual Database Check

If you have MongoDB shell access, you can check if the user exists:

```javascript
use crafting-sign
db.users.find({ email: "admin@craftingsign.com" })
```

If the user doesn't exist, run `npm run create-admin` to create it.

