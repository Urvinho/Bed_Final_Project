import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";

const router = Router();

//
// GET /users (no password)
//
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
  res.json(users);
});

//
// POST /users
//
router.post("/", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const created = await prisma.user.create({
      data: {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        email,
        password, // ← IMPORTANT
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    res.status(201).json(created);
  } catch {
    res.status(400).json({ message: "Could not create user" });
  }
});

//
// GET /users/:id
//
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: String(req.params.id) },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

//
// PUT /users/:id (protected)
//
router.put("/:id", auth, async (req, res) => {
  const id = String(req.params.id);
  const { email, password, name } = req.body ?? {};

  const data = {};
  if (email !== undefined) data.email = email;
  if (name !== undefined) data.name = name;
  if (password !== undefined) data.password = password;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    res.json(updated);
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

//
// DELETE /users/:id (protected)
//
router.delete("/:id", auth, async (req, res) => {
  const id = String(req.params.id);

  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: "User not found" });
  }
});

export default router;
