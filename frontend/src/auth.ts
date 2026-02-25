import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "DY8ekgjV7C0wBN9HrrFybzC052kWD01F", // Fallback secret for development
    database: {
        provider: "sqlite",
        url: process.env.DATABASE_URL?.replace("file:", "") || "./db.sqlite",
    },
    plugins: [
        jwt({
            jwt: {
                expirationTime: "1h",
                issuer: "todo-app",
            },
        }),
    ],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
});
