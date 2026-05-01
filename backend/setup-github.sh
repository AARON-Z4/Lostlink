#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# LostLink — GitHub Repository Setup Script
# Run this ONCE from inside the LostLink/backend directory
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "🔗 Setting up LostLink GitHub repository..."

# 1. Create GitHub repo (requires GitHub CLI: https://cli.github.com)
if command -v gh &>/dev/null; then
  echo "📦 Creating GitHub repo via GitHub CLI..."
  gh repo create LostLink --public --description "Lost & Found platform backend — Node.js + Supabase" --confirm 2>/dev/null || true
  REMOTE_URL=$(gh repo view LostLink --json sshUrl -q .sshUrl 2>/dev/null || gh repo view LostLink --json url -q .url)
else
  echo "⚠️  GitHub CLI not found. Create the repo manually at https://github.com/new"
  echo "   Name: LostLink"
  echo "   Then set REMOTE_URL below and re-run from step 2."
  REMOTE_URL="https://github.com/YOUR_USERNAME/LostLink.git"
fi

# 2. Initialise git
cd "$(dirname "$0")"
git init
git add .
git commit -m "feat: initial LostLink backend — Node.js + Express + Supabase

- Auth (register/login/JWT via Supabase Auth)
- Items CRUD with Supabase Storage image uploads
- Rule-based + Jaccard text similarity matching engine
- Claim lifecycle (pending → accepted/rejected → resolved)
- QR code generation per item (stored in Supabase Storage)
- Email notifications via Nodemailer
- Realtime via Socket.io
- Admin dashboard (users, items, claims, stats)
- RLS policies on all tables
- 27 unit + integration tests

Supabase project: biljsanhifmkrmskobxr (ap-south-1)"

# 3. Push
git branch -M main
git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"
git push -u origin main

echo ""
echo "✅ Done! Repository pushed to: $REMOTE_URL"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env"
echo "  2. Fill in SUPABASE_SERVICE_ROLE_KEY and SUPABASE_JWT_SECRET from:"
echo "     https://supabase.com/dashboard/project/biljsanhifmkrmskobxr/settings/api"
echo "  3. npm install && npm run dev"
