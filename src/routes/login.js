import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const loginRouter = Router();

loginRouter.post("/", async (req, res) => {
  const secretKey = process.env.AUTH_SECRET_KEY || "my-secret-key";
  const { username, email, password } = req.body ?? {};

  if ((!username && !email) || !password) {
    return res
      .status(400)
      .json({ message: "username/email and password are required" });
  }

  const user = await prisma.user.findFirst({
    where: {
      password: String(password),
      OR: [
        username ? { username: String(username) } : undefined,
        email ? { email: String(email) } : undefined,
      ].filter(Boolean),
    },
    select: { id: true },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials!" });
  }

  const token = jwt.sign({ userId: user.id }, secretKey);
  return res.status(200).json({ token });
});

export default loginRouter;