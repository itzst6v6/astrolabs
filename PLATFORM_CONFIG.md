# AstroLab Vault - Platform Configuration

## Platform Configuration Options

You can manually configure which platform settings to use by setting the `DEPLOY_PLATFORM` environment variable.

### Available Platforms

| Platform | DEPLOY_PLATFORM value | File Limit | Storage | API Path |
|----------|---------------------|------------|---------|----------|
| **Local Development** | `local` | 50MB | Persistent JSON | `/api` |
| **Unknown Production** | `unknownHoster` | 4MB | Memory | `/api` |
| **Vercel** | `vercel` | 4MB | Memory | `/api` |
| **Netlify** | `netlify` | 9MB | Persistent JSON | `/.netlify/functions` |

### How to Set Platform

#### Option 1: Environment Variable
```bash
# Local development (default)
DEPLOY_PLATFORM=local npm start

# Production with conservative limits
DEPLOY_PLATFORM=unknownHoster npm start

# Vercel-optimized settings
DEPLOY_PLATFORM=vercel npm start

# Netlify-optimized settings
DEPLOY_PLATFORM=netlify npm start
```

#### Option 2: Netlify Dashboard
1. Go to your site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add: `DEPLOY_PLATFORM` = `netlify`

#### Option 3: Vercel Dashboard
1. Go to your project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add: `DEPLOY_PLATFORM` = `vercel`

### Auto-Detection (No Manual Override)

If `DEPLOY_PLATFORM` is not set, the system will auto-detect:

- **Vercel**: If `VERCEL` environment variable is present
- **Netlify**: If `NETLIFY` environment variable is present
- **Unknown Production**: If `NODE_ENV=production` but no platform detected
- **Local**: Default for development

### Platform Features

| Feature | Local | Unknown | Vercel | Netlify |
|---------|-------|---------|--------|---------|
| **Persistent Storage** | ✅ | ❌ | ❌ | ✅ |
| **Large Files** | ✅ | ❌ | ❌ | ✅ |
| **Custom Domains** | ❌ | ✅ | ✅ | ✅ |

### Check Current Configuration

Visit the debug endpoint to see your current configuration:
```
https://your-site.com/.netlify/functions/debug/platform
```

Or in development:
```
http://localhost:3000/api/v2/debug/platform
```

### Examples

#### Deploy to Netlify with 9MB limit:
```bash
DEPLOY_PLATFORM=netlify netlify deploy --prod
```

#### Deploy to Vercel with 4MB limit:
```bash
DEPLOY_PLATFORM=vercel vercel --prod
```

#### Local development with 50MB limit:
```bash
DEPLOY_PLATFORM=local npm start
```
