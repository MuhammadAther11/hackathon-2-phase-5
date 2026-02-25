# Research: User Authentication & Security

## Decision: Symmetric JWT with Shared Secret

The project will use the **Better Auth JWT Plugin** with a symmetric signing approach. Both the Next.js frontend and the FastAPI backend will share the same `BETTER_AUTH_SECRET`.

### Rationale:
- **Simplicity**: Symmetric signing is easier to implement and verify across languages (TypeScript/Python) during initial setup.
- **Performance**: The backend can verify tokens locally using `python-jose` without making additional network calls to the auth service.
- **Consistency**: Matches the user's specific requirement to use `BETTER_AUTH_SECRET` as a shared environment variable.

### Alternatives Considered:
- **Asymmetric JWKS**: More secure as the backend only needs public keys, but introduces complexity related to JWKS fetching and caching.
- **Session-based Proxy**: Backend would verify session via a proxy or internal API call to Next.js. Rejected due to high latency and coupling.

## Implementation Details

### Configuration (Next.js)
```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [
        jwt({
            jwt: {
                expirationTime: "1h",
                issuer: "todo-app",
            },
        }),
    ],
});
```

### Verification (FastAPI)
Using `python-jose` for verification in a middleware layer.
```python
from jose import jwt
import os

def verify_token(token: str):
    secret = os.getenv("BETTER_AUTH_SECRET")
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    return payload
```

## Security Posture
- Tokens will have a 1-hour expiration.
- All tokens MUST include the `sub` claim (User ID).
- Middleware will reject any requests failing verification with a `401 Unauthorized` status.
