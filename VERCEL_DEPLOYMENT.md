# Vercel Deployment Guide for TerraShield

This guide walks you through deploying TerraShield to Vercel with Supabase as the backend.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
3. **Google Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (2-3 minutes)
3. Note down your project URL and keys from Settings → API

### 1.2 Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and click **Run**
5. Verify tables were created in **Table Editor**

### 1.3 Create Storage Bucket

The migration should have created the `report-images` bucket automatically. Verify:

1. Go to **Storage** in Supabase dashboard
2. Confirm `report-images` bucket exists
3. If not, create it manually:
   - Click **New bucket**
   - Name: `report-images`
   - Public: `false` (private)
   - Click **Create bucket**

### 1.4 Configure Storage Policies

The migration includes storage policies. Verify they exist:

1. Go to **Storage** → `report-images` → **Policies**
2. You should see policies for:
   - Users can upload their own images
   - Users can view their own images
   - Public can view analysed report images

## Step 2: Configure Environment Variables

### 2.1 Get Supabase Credentials

From your Supabase project Settings → API:

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon (public) key**: `eyJhbGc...` (starts with eyJ)
- **Service role key**: `eyJhbGc...` (different from anon key, has more permissions)

⚠️ **Important**: Keep the service role key secret! Never expose it in client-side code.

### 2.2 Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key (starts with `AIza...`)

### 2.3 Create Local .env.local File

Create `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...
```

Replace the values with your actual credentials.

## Step 3: Test Locally

Before deploying, test that everything works:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:7001` and test:

1. Sign up / Sign in
2. Upload an image with GPS data
3. Trigger AI analysis
4. Check that the image appears in Supabase Storage
5. Verify data in Supabase Table Editor

## Step 4: Deploy to Vercel

### 4.1 Connect Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect Next.js

### 4.2 Configure Environment Variables in Vercel

1. In the Vercel import screen, expand **Environment Variables**
2. Add each variable from your `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
   GEMINI_API_KEY = AIzaSy...
   ```

3. Make sure to add them for **Production**, **Preview**, and **Development** environments

### 4.3 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for the build to complete
3. Vercel will provide a URL like `https://terrashield.vercel.app`

## Step 5: Configure Supabase Auth Redirect

After deployment, update Supabase auth settings:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://terrashield.vercel.app`
3. Add to **Redirect URLs**:
   - `https://terrashield.vercel.app/auth/callback`
   - `http://localhost:7001/auth/callback` (for local dev)

## Step 6: Verify Deployment

Test your production deployment:

1. Visit your Vercel URL
2. Sign up with a new account
3. Upload a test image
4. Verify in Supabase:
   - Check `users_meta` table for new user
   - Check `exif_data` table for uploaded report
   - Check Storage for uploaded image

## Troubleshooting

### "Unauthorized" errors

- Check that environment variables are set correctly in Vercel
- Verify Supabase URL and keys are correct
- Check Supabase RLS policies are enabled

### Images not uploading

- Verify `report-images` bucket exists in Supabase Storage
- Check storage policies are configured
- Look at Vercel function logs for errors

### AI analysis failing

- Verify `GEMINI_API_KEY` is set in Vercel
- Check Gemini API quota in Google Cloud Console
- Review Vercel function logs for specific errors

### Database errors

- Verify migration ran successfully in Supabase SQL Editor
- Check table names match exactly (case-sensitive)
- Ensure RLS policies are enabled

## Performance Optimization

### Enable Vercel Edge Caching

Add to `next.config.mjs`:

```javascript
export default {
  experimental: {
    serverActions: true,
  },
  // Cache static assets
  async headers() {
    return [
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Optimize Supabase Queries

- Use indexes (already created in migration)
- Enable PostGIS for spatial queries
- Use connection pooling for high traffic

### Monitor Performance

- Use Vercel Analytics
- Monitor Supabase database performance
- Set up error tracking (Sentry, LogRocket)

## Scaling Considerations

### Database

- Supabase free tier: 500MB database, 1GB storage
- Upgrade to Pro for production: $25/month
- Consider read replicas for high traffic

### Storage

- Supabase free tier: 1GB storage
- Images are compressed but can add up quickly
- Consider image optimization before upload

### Serverless Functions

- Vercel free tier: 100GB-hours/month
- AI analysis is compute-intensive
- Monitor function execution time and costs

## Security Checklist

- ✅ Service role key is never exposed to client
- ✅ RLS policies are enabled on all tables
- ✅ Storage policies restrict access appropriately
- ✅ CORS is configured correctly
- ✅ Rate limiting is implemented (consider Vercel Edge Config)
- ✅ Input validation on all API routes
- ✅ Gemini API key is server-side only

## Support

For issues:

1. Check Vercel deployment logs
2. Check Supabase logs in Dashboard → Logs
3. Review this guide's troubleshooting section
4. Open an issue on GitHub

## Next Steps

- Set up custom domain in Vercel
- Configure email templates in Supabase Auth
- Add monitoring and alerting
- Implement rate limiting
- Set up CI/CD pipeline
- Add end-to-end tests
