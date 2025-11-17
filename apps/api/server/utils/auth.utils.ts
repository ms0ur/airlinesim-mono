import { jwtVerify, SignJWT } from "jose";
import { UserRepo } from "../repo/userRepo";

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret && process.env.NODE_ENV === "production") {
    throw new Error("ENV JWT_SECRET is not set");
}

const secret = new TextEncoder().encode(rawSecret ?? "dev-secret");

export type AccessTokenPayload = {
    sub: string;
    role: "user" | "admin";
    type: "access";
    iat: number;
    exp: number;
};

type AccessTokenClaims = {
    sub: string;
    role: "user" | "admin";
};

export async function signAccessToken(payload: AccessTokenClaims): Promise<string> {
    return await new SignJWT({ ...payload, type: "access" as const })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("12h")
        .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
    });

    if (payload.type !== "access") {
        throw new Error("Invalid token type");
    }

    if (typeof payload.sub !== "string") {
        throw new Error("Invalid token subject");
    }

    if (payload.role !== "user" && payload.role !== "admin") {
        throw new Error("Invalid token role");
    }

    return payload as AccessTokenPayload;
}

async function validatePass(userId: string, password: string): Promise<boolean> {
    const user = await UserRepo.getHashedPassword(userId);

    if (!user || !user.password) {
        return false;
    }

    return await Bun.password.verify(password, user.password);
}

export async function validateAuth(token: string): Promise<AccessTokenPayload | null> {
    try {
        const payload = await verifyAccessToken(token);
        return payload;
    } catch {
        return null;
    }
}


export async function loginUserByPassword(
    userId: string,
    password: string,
): Promise<string | null> {
    const isValid = await validatePass(userId, password);
    if (!isValid) {
        return null;
    }

    return await signAccessToken({ sub: userId, role: "user" });
}
