import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const secretKey = process.env.AUTH_SECRET_KEY || "my-secret-key";
  const authHeader = req.headers.authorization || "";

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;