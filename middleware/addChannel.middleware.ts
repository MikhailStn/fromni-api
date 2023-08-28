import jwt from "jsonwebtoken";
import config from "config";

export function addChannelMiddleware(req: any, res: any, next: any) {
  try {
    const token = req.body.token;
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