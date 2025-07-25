// Temporary compatibility server for development
// This allows the existing .replit workflow to continue working
// while we transition to Next.js

import { spawn } from 'child_process';

console.log('🚀 Starting Next.js development server...');

const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Next.js server...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Next.js server...');
  nextProcess.kill('SIGTERM');
});