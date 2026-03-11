import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /users?username=... OR /users?email=...
router.get("/", async (req, res, next) => {
  try {
    const { username, email } = req.query;

    const where =
      username ? { username: String(username) } :
      email ? { email: String(email) } :
      undefined;

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

    if ((username || email) && users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
});

// POST /users
router.post("/", auth, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "username, email and password are required",
      });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: String(username) },
          { email: String(email) },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({ message: "Username exists" });
    }

    const created = await prisma.user.create({
      data: {
        id: body.id ? String(body.id) : uuidv4(),
        username: String(username),
        email: String(email),
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

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// GET /users/:id
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (e) {
    next(e);
  }
});

// PUT /users/:id
router.put("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const body = req.body ?? {};
    const data = {};

    if (body.username !== undefined) data.username = String(body.username);
    if (body.email !== undefined) data.email = String(body.email);
    if (body.password !== undefined) data.password = String(body.password);
    if (body.name !== undefined) data.name = body.name ?? null;
    if (body.image !== undefined || body.pictureUrl !== undefined) {
      data.image = body.image ?? body.pictureUrl ?? null;
    }

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
    next(e);
  }
});

// DELETE /users/:id
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;