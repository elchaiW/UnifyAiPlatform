# 🔧 AWS App Runner Console Configuration Fix

## The Problem
The `apprunner.yaml` approach keeps failing. Let's configure directly in the AWS Console for better control.

## ✅ **Solution: Delete YAML and Use Console**

### **Step 1: Remove Configuration File**
Delete the `apprunner.yaml` file so AWS uses console configuration instead.

### **Step 2: Configure in AWS Console**

Go to your App Runner service → **Actions** → **Edit configuration**

#### **Source Configuration:**
- **Repository**: `https://github.com/Elchaigroup/UnifyAiPlatform`
- **Branch**: `replit-agent`
- **Source directory**: (leave blank)

#### **Build Configuration:**
```bash
Build command: npm install && npm run build
Start command: npm start
```

#### **Runtime Configuration:**
- **Runtime**: Node.js 18
- **Port**: 5000

#### **Environment Variables:**
Add these in the console:
```bash
NODE_ENV=production
PORT=5000
ANTHROPIC_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here  
GEMINI_API_KEY=your-key-here
XAI_API_KEY=your-key-here
DATABASE_URL=your-database-url
```

### **Why This Works Better:**
1. **npm install** installs ALL dependencies (dev + prod)
2. Console configuration often works when YAML fails
3. Direct control over build commands
4. Better error reporting in console

### **Deploy Process:**
1. Delete `apprunner.yaml`
2. Commit and push to `replit-agent` branch
3. Configure in AWS Console as shown above
4. Click **Deploy**

This should finally resolve the build issues!