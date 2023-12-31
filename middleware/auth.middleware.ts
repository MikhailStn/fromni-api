import jwt from "jsonwebtoken";
import config from "config";

export function authMiddleware(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Auth error" });
    }
    const decoded = jwt.verify(token, config.get("secretKey"));
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: `${e}` });
  }
}
