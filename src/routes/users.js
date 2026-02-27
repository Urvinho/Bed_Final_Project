import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /users (public) + filters: ?username=... or ?email=...
router.get("/", async (req, res, next) => {
  try {
    const { username, email } = req.query;

    const where = username
      ? { username: String(username) }
      : email
      ? { email: String(email) }
      : undefined;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
      },
    });

    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
});

// POST /users (protected)
router.post("/", auth, async (req, res) => {
  try {
    const body = req.body ?? {};

    const usernameRaw = body.username;
    const emailRaw = body.email;
    const password = body.password;

    if (!usernameRaw || !emailRaw || !password) {
      return res.status(400).json({
        message: "username, email and password are required",
      });
    }

    let username = String(usernameRaw);
    let email = String(emailRaw);

  
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: { id: true },
    });

    if (existing) {
      const suffix = Date.now().toString(36);
      const at = email.indexOf("@");
      if (at > 0) {
        email = `${email.slice(0, at)}+${suffix}${email.slice(at)}`;
      } else {
        email = `${email}+${suffix}`;
      }
      username = `${username}_${suffix}`;
    }

    const created = await prisma.user.create({
      data: {
        id: body.id ? String(body.id) : uuidv4(),
        username,
        email,
        password: String(password),
        name: body.name ?? null,
        image: body.image ?? body.pictureUrl ?? null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return res.status(201).json(created);
  } catch (e) {
    return res.status(400).json({
      message: "Could not create user",
      error: String(e),
    });
  }
});

// GET /users/:id (public)
router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (e) {
    next(e);
  }
});

// PUT /users/:id (protected)
router.put("/:id", auth, async (req, res) => {
  const id = String(req.params.id);
  const body = req.body ?? {};

  const data = {};
  if (body.username !== undefined) data.username = String(body.username);
  if (body.email !== undefined) data.email = String(body.email);
  if (body.password !== undefined) data.password = String(body.password);
  if (body.name !== undefined) data.name = body.name ?? null;
  if (body.image !== undefined || body.pictureUrl !== undefined) {
    data.image = body.image ?? body.pictureUrl ?? null;
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
      },
    });

    res.status(200).json(updated);
  } catch (e) {
    res.status(404).json({ message: "User not found", error: String(e) });
  }
});

// DELETE /users/:id (protected)
router.delete("/:id", auth, async (req, res) => {
  const id = String(req.params.id);

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    res.status(404).json({ message: "User not found", error: String(e) });
  }
});

export default router;
