# TerraShield Vercel Migration Checklist

This checklist ensures a smooth migration from SQLite to Supabase and deployment to Vercel.

## ✅ Pre-Migration

- [ ] Backup existing SQLite databases (`lib/db/exif.db`, `lib/db/users.db`)
- [ ] Create Supabase account and project
- [ ] Get Supabase credentials (URL, anon key, service role key)
- [ ] Get Google Gemini API key
- [ ] Install dependencies: `npm install`

## ✅ Supabase Setup

- [ ] Run migration SQL in Supabase SQL Editor (`supabase/migrations/001_initial_schema.sql`)
- [ ] Verify tables created in Table Editor:
  - [ ] `exif_data`
  - [ ] `users_meta`
  - [ ] `points_history`
- [ ] Verify storage bucket created: `report-images`
- [ ] Verify RLS policies enabled on all tables
- [ ] Verify storage policies configured
- [ ] Test auth trigger (sign up a test user, check `users_meta` table)

## ✅ Environment Configuration

- [ ] Create `.env.local` with all required variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `GEMINI_API_KEY`
- [ ] Verify environment variables are correct (no typos)
- [ ] Test Supabase connection locally

## ✅ Data Migration (Optional - if you have existing data)

- [ ] Run migration script: `npm run migrate`
- [ ] Verify users migrated in Supabase `users_meta` table
- [ ] Verify EXIF records migrated in `exif_data` table
- [ ] Verify images uploaded to Supabase Storage
- [ ] Verify points history migrated
- [ ] Test a few migrated records in the app

## ✅ Local Testing

- [ ] Start dev server: `npm run dev`
- [ ] Test user sign up
- [ ] Test user sign in
- [ ] Test image upload with GPS data
- [ ] Test AI analysis
- [ ] Verify image appears in Supabase Storage
- [ ] Verify data in Supabase tables
- [ ] Test statistics page
- [ ] Test profile page
- [ ] Test PDF report generation
- [ ] Check browser console for errors
- [ ] Check terminal for API errors

## ✅ Code Review

- [ ] All imports updated from `@/lib/db/exif` to `@/lib/db/supabase-exif`
- [ ] All imports updated from `@/lib/db/users` to `@/lib/db/supabase-users`
- [ ] No references to `better-sqlite3` in API routes
- [ ] No references to `image_data` BLOB (replaced with `image_storage_path`)
- [ ] All database operations are async/await
- [ ] Error handling added for Supabase operations
- [ ] Service role key never exposed to client

## ✅ Vercel Deployment

- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] Connect repository to Vercel
- [ ] Configure environment variables in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `GEMINI_API_KEY`
- [ ] Deploy to Vercel
- [ ] Wait for build to complete
- [ ] Note deployment URL

## ✅ Post-Deployment Configuration

- [ ] Update Supabase Auth redirect URLs:
  - [ ] Add Vercel URL to Site URL
  - [ ] Add `https://your-app.vercel.app/auth/callback` to Redirect URLs
- [ ] Test production deployment:
  - [ ] Sign up new user
  - [ ] Upload image
  - [ ] Trigger AI analysis
  - [ ] View statistics
  - [ ] Generate PDF report

## ✅ Production Verification

- [ ] Test all major features in production
- [ ] Check Vercel function logs for errors
- [ ] Check Supabase logs for errors
- [ ] Verify images uploading to storage
- [ ] Verify database writes working
- [ ] Test on mobile device
- [ ] Test on different browsers
- [ ] Check page load times
- [ ] Verify SSL certificate

## ✅ Cleanup (Optional)

- [ ] Remove SQLite database files if migration successful
- [ ] Remove `better-sqlite3` from dependencies if not needed
- [ ] Remove old SQLite-related scripts
- [ ] Update documentation
- [ ] Archive old code in a branch

## ✅ Monitoring & Maintenance

- [ ] Set up Vercel Analytics
- [ ] Monitor Supabase database size
- [ ] Monitor Supabase storage usage
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure alerts for API failures
- [ ] Schedule regular backups
- [ ] Monitor Gemini API usage and costs

## 🚨 Rollback Plan

If something goes wrong:

1. **Immediate**: Revert Vercel deployment to previous version
2. **Database**: Restore from Supabase backup (automatic daily backups)
3. **Code**: Revert to previous Git commit
4. **Local**: Keep SQLite files until production is stable

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Deployment Guide**: See `VERCEL_DEPLOYMENT.md`

## ✅ Final Sign-Off

- [ ] All tests passing
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Migration complete! 🎉
