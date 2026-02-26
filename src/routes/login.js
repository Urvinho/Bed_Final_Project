import { Router } from "express";
import prisma from "../prisma.js";
import jwt from "jsonwebtoken";

const loginRouter = Router();

loginRouter.post("/", async (req, res) => {
  const secretKey = process.env.AUTH_SECRET_KEY || "my-secret-key";

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(401).json({ message: "Invalid credentials!" });
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email) },
  });

  if (!user || user.password !== String(password)) {
    return res.status(401).json({ message: "Invalid credentials!" });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, {
    expiresIn: "2h",
  });

  res.status(200).json({ token });
});

export default loginRouter;
