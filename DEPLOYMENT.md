# Self-Hosted Deployment Guide

## Prerequisites

- **Server OS**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: v18+ (install via nvm or apt)
- **PostgreSQL**: 12+ (included or separate server)
- **Nginx**: Web server/reverse proxy
- **Git**: For cloning repository
- **Domain**: (Optional but recommended for HTTPS)

## Step 1: Server Setup

### SSH into your server
```bash
ssh user@your-server-ip
```

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (using nvm - recommended)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node -v  # Verify
npm -v   # Verify
```

### Install PostgreSQL (Optional - Skip if using Supabase)
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**OR use Supabase (Recommended - No local DB needed)**
- Go to [supabase.com](https://supabase.com) and create a project
- Copy your PostgreSQL connection string from project settings
- No local installation needed

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2 (process manager)
```bash
npm install -g pm2
pm2 startup
pm2 save
```

## Step 2: Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/yourusername/rundown.git
cd rundown
sudo chown -R $USER:$USER .
```

## Step 3: Database Setup

### Option A: Supabase (Recommended - Simplest)

1. **Create Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Copy your credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `DATABASE_URL` (from project settings → Database)

2. **Run migrations**:
   ```bash
   cd /var/www/rundown
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **That's it!** Skip to Step 4. Supabase handles everything.

---

### Option B: Local PostgreSQL

1. **Create PostgreSQL user and database**:
   ```bash
   sudo -u postgres psql
   ```

   Inside psql:
   ```sql
   CREATE USER rundown_user WITH PASSWORD 'secure_password_here';
   CREATE DATABASE rundown_db OWNER rundown_user;
   GRANT ALL PRIVILEGES ON DATABASE rundown_db TO rundown_user;
   \q
   ```

2. **Run migrations**:
   ```bash
   cd /var/www/rundown
   npx prisma migrate deploy
   npx prisma generate
   ```

## Step 4: Environment Configuration

### For Supabase (Recommended)

Create `.env.production`:
```bash
cat > /var/www/rundown/.env.production << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
EOF
```

### For Local PostgreSQL

Create `.env.production`:
```bash
cat > /var/www/rundown/.env.production << 'EOF'
# Local Database
DATABASE_URL="postgresql://rundown_user:secure_password_here@localhost:5432/rundown_db"

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
EOF
```

### Copy to .env.local
```bash
cp /var/www/rundown/.env.production /var/www/rundown/.env.local
```

## Step 5: Install Dependencies & Build

```bash
cd /var/www/rundown
npm ci  # Use ci instead of install for production
npm run build
```

Verify build output:
```
✓ Compiled successfully
✓ Generating static pages
```

## Step 6: Start Application with PM2

### Start the app
```bash
cd /var/www/rundown
pm2 start npm --name "rundown" -- start
pm2 save
```

### Monitor
```bash
pm2 logs rundown
pm2 status
```

### Restart on reboot
```bash
pm2 startup systemd -u $USER --hp /home/$USER
```

## Step 7: Configure Nginx Reverse Proxy

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/rundown
```

Add this configuration:
```nginx
upstream rundown_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (if using SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://rundown_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable site
```bash
sudo ln -s /etc/nginx/sites-available/rundown /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

## Step 8: SSL/HTTPS Setup (Recommended)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

This automatically updates your Nginx config with HTTPS.

### Auto-renew certificates
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Step 9: Verification

1. **Check if app is running**:
   ```bash
   curl http://localhost:3000
   ```

2. **Check Nginx**:
   ```bash
   sudo systemctl status nginx
   ```

3. **Test in browser**:
   - HTTP: `http://your-domain.com`
   - HTTPS: `https://your-domain.com` (after SSL setup)

## Maintenance

### View logs
```bash
pm2 logs rundown
```

### Restart app
```bash
pm2 restart rundown
```

### Update application
```bash
cd /var/www/rundown
git pull origin main
npm ci
npm run build
pm2 restart rundown
```

### Database backup
```bash
sudo -u postgres pg_dump rundown_db > /backup/rundown_db_$(date +%Y%m%d).sql
```

### Monitor resources
```bash
pm2 monit
```

## Troubleshooting

**App not accessible?**
```bash
# Check if Node app is running
pm2 status

# Check Nginx is routing correctly
sudo nginx -t
sudo systemctl reload nginx

# Check logs
pm2 logs rundown
sudo tail -f /var/log/nginx/error.log
```

**Database connection error (Supabase)?**
```bash
# Verify credentials in .env.production
# Check Supabase project is running and accessible
# Make sure DATABASE_URL is the "Connection Pooler" URL (not direct)
```

**Database connection error (PostgreSQL)?**
```bash
# Test PostgreSQL connection
psql -U rundown_user -d rundown_db -h localhost
```

**Port already in use?**
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

## Production Checklist

**Database Choice:**
- [ ] Using Supabase (recommended - no local DB needed) OR
- [ ] Using Local PostgreSQL

**Server Setup:**
- [ ] Server firewall configured (allow 80, 443)
- [ ] Node.js v18+ installed
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed (HTTPS)
- [ ] PM2 process manager running

**Application:**
- [ ] Environment variables set (Supabase or PostgreSQL credentials)
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Build successful: `npm run build`
- [ ] App running: `pm2 status`

**Maintenance:**
- [ ] Automated backups scheduled (if local PostgreSQL)
- [ ] Monitoring/alerting in place
- [ ] DNS pointing to server IP

## Next Steps

1. Push your code with v1.0.0 tag: `git push origin main v1.0.0`
2. Clone on server: `git clone ... --branch v1.0.0`
3. Follow steps 3-9 above
4. Test thoroughly before going live
