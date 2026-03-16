# Rundown Studio MVP

A simple, modular event rundown planning and execution tool built with Next.js 14 and Supabase.

## Features

- **Rundown Management**: Create, edit, and delete event rundowns
- **Cue Editor**: Add, edit, delete, and reorder cues with inline editing
- **Time Calculation**: Automatic total duration and cumulative time calculation
- **Live Mode**: Execute rundowns in real-time with active cue highlighting, timer, and navigation
- **Real-time Sync**: Changes sync instantly across all connected clients using Supabase Realtime
- **Responsive UI**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Database**: PostgreSQL (Supabase Cloud)
- **ORM**: Prisma
- **Real-time**: Supabase Realtime
- **State**: React Context

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase Cloud account

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd rundown
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   DATABASE_URL=postgresql://user:password@host/database
   ```

4. Set up database
   ```bash
   npx prisma migrate dev --name init
   npm run seed  # Optional: populate with sample data
   ```

5. Run development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
├── components/              # Reusable UI components
├── context/                 # React Context (state management)
├── hooks/                   # Custom hooks
├── lib/                     # Utilities and clients
├── modules/
│   ├── cues/               # Cue logic and components
│   └── rundown/            # Rundown logic and components
└── server/                 # Server Actions (CRUD)
```

## Usage

### Creating a Rundown

1. Navigate to "New Rundown"
2. Enter title, description, and event date
3. Click "Create"

### Editing Cues

1. From the rundown editor, click "Add Cue"
2. Click "Edit" on any cue row to inline edit
3. Drag rows to reorder
4. Click "Delete" to remove

### Live Execution

1. Click "Go Live" from the rundown editor
2. Click on any cue to activate it
3. Use Previous/Next buttons to navigate
4. Watch the timer count down

### Real-time Collaboration

- Open the same rundown in multiple tabs
- Changes in one tab appear instantly in others
- In Live mode, cue changes sync across all viewers

## Environment Setup (VPS Deployment)

### Prerequisites
- Ubuntu 22.04 or newer
- Node.js 18+
- PostgreSQL (or use Supabase Cloud)
- Nginx or similar reverse proxy

### Deployment Steps

1. **Clone and install**
   ```bash
   git clone <repo> /opt/rundown
   cd /opt/rundown
   npm ci --production
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env.production
   # Edit with production secrets
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Run with PM2**
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name rundown
   pm2 save
   pm2 startup
   ```

5. **Nginx configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Future Extensions

- **Teleprompter Mode**: Display script text for presenters
- **Custom Columns**: Add project-specific metadata
- **OBS Integration**: Control OBS scenes from rundown
- **ATEM Support**: Switcher integration
- **PDF Export**: Generate rundown documents
- **User Authentication**: Multi-user support with permissions

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
