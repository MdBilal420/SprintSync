# Security Guidelines for SprintSync

## Environment Variables

### ⚠️ CRITICAL: Never Commit Secrets

**NEVER commit actual environment files with real credentials to git!**

The following files should NEVER be committed:
- `.env`
- `.env.local` 
- `.env.cloud`
- Any file containing real passwords, API keys, or secrets

### Environment File Structure

1. **Template Files** (committed to git):
   - `.env.example` - Template with placeholder values
   - `.env.development` - Development template
   - `.env.production` - Production template
   - `.env.cloud-dev` - Cloud development template

2. **Actual Files** (NEVER committed):
   - `.env` - Your local environment (copied from template)
   - `.env.cloud` - Your cloud development environment
   - `.env.production.local` - Production secrets

### Setting Up Your Environment

1. Copy the appropriate template:
   ```bash
   cp .env.example .env
   # OR for cloud development:
   cp .env.cloud-dev .env.cloud
   ```

2. Fill in your actual values:
   - Database passwords
   - API keys
   - JWT secrets
   - Cloud project IDs

### Cloud SQL Security

Current security measures:
- ✅ IP allowlisting for database access
- ✅ Strong passwords for database users
- ✅ Separate users for development vs production
- ✅ Environment-based configuration

### JWT Security

- Use strong, unique JWT secrets for each environment
- Rotate JWT secrets regularly
- Keep token expiration times reasonable (30 minutes for access tokens)

### Next Steps

**IMPORTANT**: The compromised database credentials should be rotated:

1. Change the Cloud SQL user password
2. Update IP allowlisting as needed
3. Rotate JWT secrets

## Git Security

The `.gitignore` has been updated to prevent future commits of sensitive files:

```
# Environment variables - NEVER COMMIT THESE!
.env
.env.*
server/.env
server/.env.*
```