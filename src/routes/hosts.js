import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /hosts?name=...
router.get("/", async (req, res, next) => {
  try {
    const { name } = req.query;

    const hosts = await prisma.host.findMany({
      where: name ? { name: String(name) } : undefined,
      include: {
        properties: true,
      },
    });

    if (name && hosts.length === 0) {
      return res.status(404).json({ message: "Host not found" });
    }

    res.status(200).json(hosts);
  } catch (e) {
    next(e);
  }
});

// POST /hosts
router.post("/", auth, async (req, res, next) => {
  try {
    const { name } = req.body ?? {};

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }


  

    const created = await prisma.host.create({
      data: {
        id: uuidv4(),
        name: String(name),
      },
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// GET /hosts/:id
router.get("/:id", async (req, res, next) => {
  try {
    const host = await prisma.host.findUnique({
      where: { id: String(req.params.id) },
      include: { properties: true },
    });

    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }

    res.status(200).json(host);
  } catch (e) {
    next(e);
  }
});

// PUT /hosts/:id
router.put("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.host.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Host not found" });
    }

    const updated = await prisma.host.update({
      where: { id },
      data: {
        name: String(req.body?.name),
      },
    });

    res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
});

// DELETE /hosts/:id
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.host.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Host not found" });
    }

    await prisma.host.delete({
      where: { id },
    });

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;