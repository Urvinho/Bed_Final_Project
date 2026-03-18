import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /properties?location=...&pricePerNight=...
router.get("/", async (req, res, next) => {
  try {
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

    if ((location || pricePerNight !== undefined) && items.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
});

// POST /properties
router.post("/", auth, async (req, res, next) => {
  try {
    const b = req.body ?? {};

    if (
      !b.title ||
      !b.description ||
      !b.location ||
      b.pricePerNight === undefined ||
      b.bedroomCount === undefined ||
      b.bathRoomCount === undefined ||
      b.maxGuestCount === undefined ||
      b.rating === undefined ||
      !b.hostId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const created = await prisma.property.create({
      data: {
        id: b.id ? String(b.id) : uuidv4(),
        title: String(b.title),
        description: String(b.description),
        location: String(b.location),
        pricePerNight: Number(b.pricePerNight),
        bedroomCount: Number(b.bedroomCount),
        bathRoomCount: Number(b.bathRoomCount),
        maxGuestCount: Number(b.maxGuestCount),
        rating: Number(b.rating),
        hostId: String(b.hostId),
      },
      include: { amenities: true },
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// GET /properties/:id
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.property.findUnique({
      where: { id: String(req.params.id) },
      include: { amenities: true },
    });

    if (!item) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(item);
  } catch (e) {
    next(e);
  }
});

// PUT /properties/:id
router.put("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Property not found" });
    }

    const b = req.body ?? {};
    const data = {};

    if (b.title !== undefined) data.title = String(b.title);
    if (b.description !== undefined) data.description = String(b.description);
    if (b.location !== undefined) data.location = String(b.location);
    if (b.pricePerNight !== undefined)
      data.pricePerNight = Number(b.pricePerNight);
    if (b.bedroomCount !== undefined)
      data.bedroomCount = Number(b.bedroomCount);
    if (b.bathRoomCount !== undefined)
      data.bathRoomCount = Number(b.bathRoomCount);
    if (b.maxGuestCount !== undefined)
      data.maxGuestCount = Number(b.maxGuestCount);
    if (b.rating !== undefined) data.rating = Number(b.rating);
    if (b.hostId !== undefined) data.hostId = String(b.hostId);

    const updated = await prisma.property.update({
      where: { id },
      data,
      include: { amenities: true },
    });

    res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
});

// DELETE /properties/:id
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Property not found" });
    }

    await prisma.property.delete({
      where: { id },
    });

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;
