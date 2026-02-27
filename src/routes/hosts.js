import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /hosts?name=...
router.get("/", async (req, res) => {
  const { name } = req.query;

  const hosts = await prisma.host.findMany({
    where: name ? { name: String(name) } : undefined,
  });

  res.status(200).json(hosts);
});

// POST /hosts (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name) return res.status(400).json({ message: "name is required" });

    const created = await prisma.host.create({
      data: { id: uuidv4(), name: String(name) },
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: "An error occurred on the server, please double-check your request!" });
  }
});

// GET /hosts/:id
router.get("/:id", async (req, res) => {
  const host = await prisma.host.findUnique({
    where: { id: String(req.params.id) },
  });

  if (!host) return res.status(404).json({ message: "Host not found" });
  res.status(200).json(host);
});

// PUT /hosts/:id (protected)
router.put("/:id", auth, async (req, res) => {
  try {
    const { name } = req.body ?? {};
    const updated = await prisma.host.update({
      where: { id: String(req.params.id) },
      data: { name: String(name) },
    });
    res.status(200).json(updated);
  } catch (e) {
    res.status(404).json({ message: "Host not found" });
  }
});

// DELETE /hosts/:id (protected) — delete properties + their children first
router.delete("/:id", auth, async (req, res) => {
  const hostId = String(req.params.id);

  try {
    const properties = await prisma.property.findMany({
      where: { hostId },
      select: { id: true },
    });

    await prisma.$transaction(async (tx) => {
      for (const p of properties) {
        await tx.review.deleteMany({ where: { propertyId: p.id } });
        await tx.booking.deleteMany({ where: { propertyId: p.id } });
        await tx.property.update({
          where: { id: p.id },
          data: { amenities: { set: [] } },
        });
        await tx.property.delete({ where: { id: p.id } });
      }
      await tx.host.delete({ where: { id: hostId } });
    });

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    res.status(404).json({ message: "Host not found" });
  }
});

export default router;