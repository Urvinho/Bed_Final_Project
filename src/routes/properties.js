import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /properties?location=...&pricePerNight=...
router.get("/", async (req, res) => {
  const { location, pricePerNight } = req.query;

  const where = {};
  if (location) where.location = String(location);

  if (pricePerNight !== undefined) {
    const price = Number(pricePerNight);
    if (Number.isNaN(price)) {
      return res.status(400).json({ message: "pricePerNight must be a number" });
    }
    where.pricePerNight = price;
  }

  const items = await prisma.property.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { amenities: true },
  });

  res.status(200).json(items);
});

// POST /properties (protected)
router.post("/", auth, async (req, res) => {
  try {
    const b = req.body ?? {};
    const required = ["title", "location", "hostId", "pricePerNight", "bedroomCount", "bathRoomCount", "maxGuestCount"];
    for (const k of required) {
      if (b[k] === undefined || b[k] === null || b[k] === "") {
        return res.status(400).json({ message: `${k} is required` });
      }
    }

    const created = await prisma.property.create({
      data: {
        id: b.id ? String(b.id) : uuidv4(),
        title: String(b.title),
        description: b.description ?? null,
        location: String(b.location),
        pricePerNight: Number(b.pricePerNight),
        bedroomCount: Number(b.bedroomCount),
        bathRoomCount: Number(b.bathRoomCount),
        maxGuestCount: Number(b.maxGuestCount),
        rating: b.rating !== undefined ? Number(b.rating) : null,
        hostId: String(b.hostId),
        ...(Array.isArray(b.amenityIds) && b.amenityIds.length
          ? { amenities: { connect: b.amenityIds.map((id) => ({ id: String(id) })) } }
          : {}),
      },
      include: { amenities: true },
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: "Could not create property", error: String(e) });
  }
});

// GET /properties/:id
router.get("/:id", async (req, res) => {
  const item = await prisma.property.findUnique({
    where: { id: String(req.params.id) },
    include: { amenities: true },
  });

  if (!item) return res.status(404).json({ message: "Property not found" });
  res.status(200).json(item);
});

// PUT /properties/:id (protected)
router.put("/:id", auth, async (req, res) => {
  try {
    const b = req.body ?? {};
    const data = {};

    if (b.title !== undefined) data.title = String(b.title);
    if (b.description !== undefined) data.description = b.description ?? null;
    if (b.location !== undefined) data.location = String(b.location);
    if (b.pricePerNight !== undefined) data.pricePerNight = Number(b.pricePerNight);
    if (b.bedroomCount !== undefined) data.bedroomCount = Number(b.bedroomCount);
    if (b.bathRoomCount !== undefined) data.bathRoomCount = Number(b.bathRoomCount);
    if (b.maxGuestCount !== undefined) data.maxGuestCount = Number(b.maxGuestCount);
    if (b.rating !== undefined) data.rating = b.rating ?? null;
    if (b.hostId !== undefined) data.hostId = String(b.hostId);

    if (Array.isArray(b.amenityIds)) {
      data.amenities = { set: b.amenityIds.map((id) => ({ id: String(id) })) };
    }

    const updated = await prisma.property.update({
      where: { id: String(req.params.id) },
      data,
      include: { amenities: true },
    });

    res.status(200).json(updated);
  } catch (e) {
    res.status(404).json({ message: "Property not found" });
  }
});

// DELETE /properties/:id (protected)
router.delete("/:id", auth, async (req, res) => {
  const propertyId = String(req.params.id);

  try {
    await prisma.$transaction([
      prisma.review.deleteMany({ where: { propertyId } }),
      prisma.booking.deleteMany({ where: { propertyId } }),
      prisma.property.update({ where: { id: propertyId }, data: { amenities: { set: [] } } }),
      prisma.property.delete({ where: { id: propertyId } }),
    ]);

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    res.status(404).json({ message: "Property not found" });
  }
});

export default router;