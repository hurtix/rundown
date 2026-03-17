# Self-Hosted Deployment Guide (Supabase Edition)

**Simple. Fast. No Database Server Needed.**

---

## Prerequisites

- **Server OS**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: v18+
- **Nginx**: Web server/reverse proxy
- **Git**: For cloning repository
- **Supabase Project**: With credentials ready
- **Domain**: (Optional but recommended for HTTPS)

---

## Step 1: Server Setup (10 mins)

### SSH into your server
```bash
ssh user@your-server-ip
```

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node -v && npm -v  # Verify
```

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

---

## Step 2: Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/yourusername/rundown.git
cd rundown
sudo chown -R $USER:$USER .
```

---

## Step 3: Setup Supabase (5 mins)

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from project settings:
   - Project URL (e.g. `https://xxxxx.supabase.co`)
   - Anon Key
   - Database connection string

**That's it.** Your database is now hosted and ready. You'll point your app to it next.

---

## Step 4: Configure Environment Variables

Create `.env.production` with your Supabase credentials:

```bash
cat > /var/www/rundown/.env.production << 'EOF'
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# App Settings
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
EOF
```

Copy to `.env.local`:
```bash
cp /var/www/rundown/.env.production /var/www/rundown/.env.local
```

---

## Step 5: Install & Build

```bash
cd /var/www/rundown

# Install dependencies
npm ci

# Run database migrations against Supabase
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Build the app
npm run build
```

Verify output has `✓ Compiled successfully`.

---

## Step 6: Start Application

```bash
cd /var/www/rundown
pm2 start npm --name "rundown" -- start
pm2 save
```

Check if it's running:
```bash
pm2 status  # Should show "online"
pm2 logs rundown  # View real-time logs
```

---

## Step 7: Configure Nginx Reverse Proxy

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/rundown
```

Paste this:
```nginx
upstream rundown_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/rundown /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

---

## Step 8: Setup SSL/HTTPS (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (automatically updates Nginx config)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

Your site is now **HTTPS-enabled** and auto-renews.

---

## Step 9: Verify Everything Works

1. **App running?**
   ```bash
   curl http://localhost:3000
   ```

2. **Nginx working?**
   ```bash
   sudo systemctl status nginx
   ```

3. **Visit in browser:**
   - `http://your-domain.com` (redirects to HTTPS after SSL)

4. **Test playback:**
   - Load a rundown
   - Click "Play"
   - Verify timer counts down
   - Check localStorage persists state

---

## Maintenance (5 mins/month)

### View logs
```bash
pm2 logs rundown       # App logs
sudo tail -f /var/log/nginx/error.log  # Nginx errors
```

### Restart app
```bash
pm2 restart rundown
```

### Update app
```bash
cd /var/www/rundown
git pull origin main
npm ci
npm run build
pm2 restart rundown
```

### Check Supabase
- Visit [supabase.com](https://supabase.com) dashboard
- Your data is safe, backed up, and automatically scaled

---

## Troubleshooting

### App won't start
```bash
pm2 logs rundown  # Check error messages
npm run build     # Try building locally first
```

### Can't reach app
```bash
# Is it running on port 3000?
lsof -i :3000

# Is Nginx misconfigured?
sudo nginx -t

# Is firewall blocking?
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
```

### Database connection error
```bash
# Check DATABASE_URL in .env.production
# Verify Supabase project is running (check dashboard)
# Make sure you're using "Connection Pooler" URL (not direct)
```

### Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart rundown
```

---

## What You Don't Need

- ❌ PostgreSQL server on your VPS
- ❌ Database maintenance scripts
- ❌ Manual backups (Supabase handles it)
- ❌ Database monitoring
- ❌ Replication setup
- ❌ Scaling database manually

**Supabase handles all of this automatically.**

---

## Cost Breakdown

| Component | Cost |
|---|---|
| **VPS** (1GB RAM, 1 CPU) | $3-5/month |
| **Nginx** | Free (included in Linux) |
| **Node.js** | Free |
| **Supabase** | Free tier (generous limits) or $25+/month for production |
| **Domain** | ~$12/year |
| **SSL (Let's Encrypt)** | Free |
| **Total** | From **$3-5/month** |

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Get connection credentials
3. ✅ Follow steps 1-9 above
4. ✅ Test in browser
5. 🚀 **You're live!**

Need help? Check Supabase docs at [supabase.com/docs](https://supabase.com/docs)
