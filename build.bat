@echo off
echo Installing dependencies...
npm ci --legacy-peer-deps

echo Building application...
npx vite build

echo Build completed successfully!
