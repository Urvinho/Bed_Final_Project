import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const secretKey = process.env.AUTH_SECRET_KEY || "my-secret-key";
  const authHeader = req.headers.authorization || "";


  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res
      .status(401)
      .json({ message: "You cannot access this operation without a token!" });
  }

  try {
    req.user = jwt.verify(token, secretKey);
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token provided!" });
  }
};

export default authMiddleware;