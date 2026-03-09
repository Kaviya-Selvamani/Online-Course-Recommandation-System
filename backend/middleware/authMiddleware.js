import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  if (!req.headers.authorization?.startsWith("Bearer")) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Not authorized as an admin" });
  }
  return next();
}
