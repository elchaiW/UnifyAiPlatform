#!/usr/bin/env node

// Environment variable checker for GitHub Codespaces
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';

console.log('🔍 Checking environment setup...\n');

// Load .env file
if (existsSync('.env')) {
  dotenv.config();
  console.log('✅ .env file found and loaded');
} else {
  console.log('❌ .env file not found');
  console.log('💡 Create a .env file based on .env.example');
}

// Check required API keys
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY', 
  'GEMINI_API_KEY',
  'XAI_API_KEY',
  'DATABASE_URL'
];

console.log('\n📋 Checking required environment variables:');

let allPresent = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value.length > 0) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Missing or empty`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('\n🎉 All environment variables are configured!');
  console.log('✅ Ready to run: npm run build && npm start');
} else {
  console.log('\n⚠️  Some environment variables are missing.');
  console.log('📖 Please check your .env file and add missing API keys.');
}

console.log('\n🔗 Get API keys from:');
console.log('• OpenAI: https://platform.openai.com/api-keys');
console.log('• Anthropic: https://console.anthropic.com/');
console.log('• Google Gemini: https://aistudio.google.com/app/apikey');
console.log('• xAI (Grok): https://console.x.ai/');