import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /bookings?userId=...
router.get("/", async (req, res) => {
  const { userId } = req.query;

  const items = await prisma.booking.findMany({
    where: userId ? { userId: String(userId) } : undefined,
  });

  res.json(items);
});

// POST /bookings
// body: { userId, propertyId, startDate, endDate }
router.post("/", auth, async (req, res) => {
  try {
    const { userId, propertyId, startDate, endDate } = req.body ?? {};

    if (!userId || !propertyId || !startDate || !endDate) {
      return res.status(400).json({
        message: "userId, propertyId, startDate, and endDate are required",
      });
    }

    const created = await prisma.booking.create({
      data: {
        id: uuidv4(), // REQUIRED (no @default(uuid()))
        userId: String(userId),
        propertyId: String(propertyId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json(created);
  } catch (e) {
    res
      .status(400)
      .json({ message: "Could not create booking", error: String(e) });
  }
});

// GET /bookings/:id
router.get("/:id", async (req, res) => {
  const item = await prisma.booking.findUnique({
    where: { id: String(req.params.id) },
  });

  if (!item) return res.status(404).json({ message: "Booking not found" });
  res.json(item);
});

// PUT /bookings/:id
// body can include: userId, propertyId, startDate, endDate
router.put("/:id", auth, async (req, res) => {
  try {
    const { userId, propertyId, startDate, endDate } = req.body ?? {};

    const data = {};
    if (userId !== undefined) data.userId = String(userId);
    if (propertyId !== undefined) data.propertyId = String(propertyId);
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);

    const updated = await prisma.booking.update({
      where: { id: String(req.params.id) },
      data,
    });

    res.json(updated);
  } catch (e) {
    res.status(404).json({ message: "Booking not found", error: String(e) });
  }
});

// DELETE /bookings/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ message: "Booking not found", error: String(e) });
  }
});

export default router;
