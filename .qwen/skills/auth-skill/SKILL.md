---
name: auth-core
description: Implement secure authentication systems including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Authentication Core Skill

## Instructions

1. **User signup**
   - Validate input data
   - Hash passwords before storing
   - Prevent duplicate accounts
   - Store minimal required user data

2. **User signin**
   - Verify credentials securely
   - Compare hashed passwords
   - Handle invalid login attempts
   - Return access and refresh tokens

3. **Password security**
   - Use bcrypt or argon2 for hashing
   - Apply proper salt rounds
   - Never store plain text passwords
   - Support password update flow

4. **JWT authentication**
   - Generate access tokens
   - Set expiration times
   - Use refresh tokens for session renewal
   - Protect private routes with middleware

5. **Better Auth integration**
   - Configure Better Auth secret keys
   - Use Better Auth APIs for session handling
   - Sync tokens with backend auth flow
   - Handle logout and token revocation

## Best Practices
- Keep auth logic separate from business logic
- Store secrets in environment variables
- Use HTTPS only
- Rotate JWT secrets periodically
- Log auth errors without exposing sensitive data

## Example Flow
```text
User Signup → Password Hashing → Database Save
User Signin → Credential Check → JWT Issued
JWT → Middleware Verification → Protected Route Access
