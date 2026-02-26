import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /properties?location=...
router.get("/", async (req, res) => {
  const { location, pricePerNight } = req.query;

  const where = {};

  if (location) where.location = String(location);

  if (pricePerNight !== undefined) {
    const price = Number(pricePerNight);
    if (Number.isNaN(price)) {
      return res
        .status(400)
        .json({ message: "pricePerNight must be a number" });
    }
    where.pricePerNight = price;
  }

  const items = await prisma.property.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { amenities: true },
  });

  res.json(items);
});

// POST /properties
// body: { title, location, hostId, amenityIds?: string[] }
router.post("/", auth, async (req, res) => {
  try {
    const { title, location, hostId, amenityIds } = req.body ?? {};

    if (!title || !location || !hostId) {
      return res
        .status(400)
        .json({ message: "title, location, and hostId are required" });
    }

    const created = await prisma.property.create({
      data: {
        id: uuidv4(), // REQUIRED (no @default(uuid()))
        title: String(title),
        location: String(location),
        hostId: String(hostId),

        ...(Array.isArray(amenityIds) && amenityIds.length
          ? {
              amenities: {
                connect: amenityIds.map((id) => ({ id: String(id) })),
              },
            }
          : {}),
      },
      include: { amenities: true },
    });

    res.status(201).json(created);
  } catch (e) {
    res
      .status(400)
      .json({ message: "Could not create property", error: String(e) });
  }
});

// PUT /properties/:id
// body can include: title, location, hostId, amenityIds (replace set)
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, location, hostId, amenityIds } = req.body ?? {};

    const data = {};
    if (title !== undefined) data.title = String(title);
    if (location !== undefined) data.location = String(location);
    if (hostId !== undefined) data.hostId = String(hostId);

    // If amenityIds is provided, replace amenities with exactly that set
    if (Array.isArray(amenityIds)) {
      data.amenities = {
        set: amenityIds.map((id) => ({ id: String(id) })),
      };
    }

    const updated = await prisma.property.update({
      where: { id: String(req.params.id) },
      data,
      include: { amenities: true },
    });

    res.json(updated);
  } catch (e) {
    res.status(404).json({ message: "Property not found", error: String(e) });
  }
});

// DELETE /properties/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ message: "Property not found", error: String(e) });
  }
});

export default router;
