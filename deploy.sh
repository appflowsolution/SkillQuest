#!/bin/bash
set -e

# ── Load NVM & Node environment ──
export NVM_DIR="${HOME}/.nvm"
if [ -s "${NVM_DIR}/nvm.sh" ]; then
    source "${NVM_DIR}/nvm.sh"
fi

# Ensure pnpm and firebase binaries are on PATH
export PATH="${HOME}/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:${PATH}"

echo "=========================================="
echo "  SkillQuest - Production Deployment"
echo "=========================================="
echo ""

# 1. Verify dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies with pnpm..."
    pnpm install
    echo ""
fi

# 2. Optional: Run E2E Test Suite if requested
if [ "$1" == "--with-tests" ] || [ "$1" == "-t" ]; then
    echo "🧪 Running Playwright E2E suite..."
    pnpm test
    echo ""
fi

# 3. Build for Production (TypeScript + Vite)
echo "⚙️  Building production bundle (Vite + TS)..."
pnpm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Production build failed!"
    exit 1
fi
echo "✅ Build completed successfully!"
echo ""

# 4. Deploy to Firebase Hosting (skill-quest site)
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo "❌ Error: Firebase deployment failed!"
    exit 1
fi

echo ""
echo "=========================================="
echo "  🎉 Deployment completed successfully!"
echo "  🔗 Live URL: https://skill-quest.web.app"
echo "=========================================="
echo ""
