# Environment Variables Setup

## Create .env File

Create a `.env` file in the `backend/` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection String (DigitalOcean Managed Database)
# Using mongodb+srv protocol for cloud database
MONGODB_URI=mongodb+srv://doadmin:7v4i0V9BqJl31o25@craftingsign-13e53534.mongo.ondigitalocean.com/crafting-sign?authSource=admin&tls=true

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Stripe Payment Gateway (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
```

## Quick Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create the `.env` file:
   ```bash
   # On Windows (PowerShell)
   New-Item -Path .env -ItemType File
   
   # On Windows (CMD)
   type nul > .env
   
   # On Linux/Mac
   touch .env
   ```

3. Copy the content above into the `.env` file

4. Test the connection:
   ```bash
   npm run create-admin
   ```

## Connection String Breakdown

Your MongoDB connection string:
```
mongodb+srv://doadmin:7v4i0V9BqJl31o25@craftingsign-13e53534.mongo.ondigitalocean.com/crafting-sign?authSource=admin&tls=true
```

- **Protocol**: `mongodb+srv://` (for cloud databases)
- **Username**: `doadmin`
- **Password**: `7v4i0V9BqJl31o25`
- **Host**: `craftingsign-13e53534.mongo.ondigitalocean.com`
- **Database**: `crafting-sign` (application database)
- **AuthSource**: `admin` (authentication database)
- **TLS**: `true` (required for secure connection)

## Important Notes

1. **Database Name**: The connection string uses `crafting-sign` as the database name. MongoDB will create this database automatically if it doesn't exist.

2. **AuthSource**: Always use `authSource=admin` for DigitalOcean managed databases.

3. **TLS**: The `tls=true` parameter is required for secure connections to DigitalOcean databases.

4. **Security**: Never commit the `.env` file to git (it's already in `.gitignore`).

## Testing

After creating the `.env` file, test the connection:

```bash
npm run create-admin
```

Expected output:
```
🔌 Connecting to MongoDB...
   URI: mongodb+srv://doadmin:****@craftingsign-13e53534.mongo.ondigitalocean.com/crafting-sign?authSource=admin&tls=true
✅ Connected to MongoDB
✅ Admin user created/updated
   Email: admin@craftingsign.com
   Password: admin123
   Password verification: ✅ PASS
✅ Admin user ready
```

