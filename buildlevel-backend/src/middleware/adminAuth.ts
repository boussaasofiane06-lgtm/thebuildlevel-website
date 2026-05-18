import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { scryptSync, timingSafeEqual, randomBytes } from "crypto";

const ADMIN_COOKIE = "bl_admin_token";
const JWT_SECRET = () => process.env.JWT_SECRET || "fallback-dev-secret-change-in-prod";

// Hardcoded password hash for: !@#$9379&*()
// Generated with: scryptSync(password, salt, 32).toString('hex')
// Salt: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
// To change password, update ADMIN_PASSWORD_HASH env var OR update the FALLBACK below
const FALLBACK_SALT = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
const FALLBACK_HASH = (() => {
  // Generate hash for !@#$9379&*() at startup using the fallback salt
  return scryptSync("!@#$9379&*()", FALLBACK_SALT, 32).toString("hex");
})();

export function verifyAdminPassword(password: string): boolean {
  // First try env var if set
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (stored && stored.includes(":")) {
    const colonIdx = stored.indexOf(":");
    const salt = stored.substring(0, colonIdx);
    const storedHash = stored.substring(colonIdx + 1);
    const keyLen = storedHash.length / 2;
    try {
      const derived = scryptSync(password, salt, keyLen);
      const derivedHex = derived.toString("hex");
      if (timingSafeEqual(Buffer.from(derivedHex), Buffer.from(storedHash))) {
        return true;
      }
    } catch {
      // fall through to hardcoded check
    }
  }

  // Fallback: check against hardcoded password !@#$9379&*()
  try {
    const derived = scryptSync(password, FALLBACK_SALT, 32);
    const derivedHex = derived.toString("hex");
    return timingSafeEqual(Buffer.from(derivedHex), Buffer.from(FALLBACK_HASH));
  } catch {
    return false;
  }
}

export function signAdminToken(): string {
  return jwt.sign({ admin: true }, JWT_SECRET(), { expiresIn: "7d" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Accept token from cookie OR Authorization header (for cross-origin frontends)
  let token = req.cookies?.[ADMIN_COOKIE];
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    jwt.verify(token, JWT_SECRET());
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export { ADMIN_COOKIE };
