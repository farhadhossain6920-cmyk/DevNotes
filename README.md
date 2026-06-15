# DevNotes

A private code-snippet vault and showcase platform for developers.

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the `supabase/schema.sql` file from this repository.
4. Copy its contents, paste it into the SQL Editor, and run it. This will create all necessary tables, triggers, storage buckets, and RLS policies.

### 2. Environment Variables
1. Copy the `.env.example` file to `.env` (or set them in your Vercel deployment settings).
2. Fill in the required Supabase variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public API key.
   - `VITE_SUPER_ADMIN_EMAIL`: The email address you will use for the main super-admin account.

### 3. Running Locally
Run the following commands:
```bash
npm install
npm run dev
```

### 4. Deployment (Vercel)
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In the Vercel deployment configuration, add the environment variables listed in step 2.
4. Deploy!
