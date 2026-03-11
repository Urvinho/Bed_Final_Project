import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /bookings?userId=...
router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;

    const items = await prisma.booking.findMany({
      where: userId ? { userId: String(userId) } : undefined,
    });

    if (userId && items.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
});

// POST /bookings
router.post("/", auth, async (req, res, next) => {
  try {
    const b = req.body ?? {};

    const created = await prisma.booking.create({
      data: {
        id: b.id ? String(b.id) : uuidv4(),
        userId: String(b.userId),
        propertyId: String(b.propertyId),
        checkinDate: new Date(b.checkinDate ?? b.startDate),
        checkoutDate: new Date(b.checkoutDate ?? b.endDate),
        numberOfGuests: Number(b.numberOfGuests),
        totalPrice: Number(b.totalPrice),
        bookingStatus: String(b.bookingStatus),
      },
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// GET /bookings/:id
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.booking.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!item) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(item);
  } catch (e) {
    next(e);
  }
});

// PUT /bookings/:id
router.put("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const b = req.body ?? {};
    const data = {};

    if (b.userId !== undefined) data.userId = String(b.userId);
    if (b.propertyId !== undefined) data.propertyId = String(b.propertyId);
    if (b.checkinDate !== undefined || b.startDate !== undefined) {
      data.checkinDate = new Date(b.checkinDate ?? b.startDate);
    }
    if (b.checkoutDate !== undefined || b.endDate !== undefined) {
      data.checkoutDate = new Date(b.checkoutDate ?? b.endDate);
    }
    if (b.numberOfGuests !== undefined) data.numberOfGuests = Number(b.numberOfGuests);
    if (b.totalPrice !== undefined) data.totalPrice = Number(b.totalPrice);
    if (b.bookingStatus !== undefined) data.bookingStatus = String(b.bookingStatus);

    const updated = await prisma.booking.update({
      where: { id },
      data,
    });

    res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
});

// DELETE /bookings/:id
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await prisma.booking.delete({
      where: { id },
    });

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;