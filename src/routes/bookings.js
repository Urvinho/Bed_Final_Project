import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /bookings (public) + filter ?userId=
router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;

    const items = await prisma.booking.findMany({
      where: userId ? { userId: String(userId) } : undefined,
    });

    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
});

// POST /bookings (protected)
router.post("/", auth, async (req, res) => {
  try {
    const b = req.body ?? {};

    const userId = b.userId;
    const propertyId = b.propertyId;

    const checkinRaw = b.checkinDate ?? b.startDate;
    const checkoutRaw = b.checkoutDate ?? b.endDate;

    const numberOfGuests = b.numberOfGuests;
    const totalPrice = b.totalPrice;
    const bookingStatus = b.bookingStatus;

    if (
      !userId ||
      !propertyId ||
      !checkinRaw ||
      !checkoutRaw ||
      numberOfGuests === undefined ||
      totalPrice === undefined ||
      !bookingStatus
    ) {
      return res.status(400).json({
        message:
          "userId, propertyId, checkinDate/checkoutDate, numberOfGuests, totalPrice, bookingStatus are required",
      });
    }

    const checkinDate = new Date(checkinRaw);
    const checkoutDate = new Date(checkoutRaw);

    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime())) {
      return res.status(400).json({ message: "checkinDate/checkoutDate must be valid dates" });
    }

    const created = await prisma.booking.create({
      data: {
        id: b.id ? String(b.id) : uuidv4(),
        userId: String(userId),
        propertyId: String(propertyId),
        checkinDate,
        checkoutDate,
        numberOfGuests: Number(numberOfGuests),
        totalPrice: Number(totalPrice),
        bookingStatus: String(bookingStatus),
      },
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: "Could not create booking", error: String(e) });
  }
});

// GET /bookings/:id (public)
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.booking.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!item) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(item);
  } catch (e) {
    next(e);
  }
});

// PUT /bookings/:id (protected)
router.put("/:id", auth, async (req, res) => {
  const id = String(req.params.id);
  const b = req.body ?? {};

  const data = {};

  if (b.userId !== undefined) data.userId = String(b.userId);
  if (b.propertyId !== undefined) data.propertyId = String(b.propertyId);

  if (b.checkinDate !== undefined || b.startDate !== undefined) {
    const d = new Date(b.checkinDate ?? b.startDate);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid checkinDate" });
    data.checkinDate = d;
  }

  if (b.checkoutDate !== undefined || b.endDate !== undefined) {
    const d = new Date(b.checkoutDate ?? b.endDate);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid checkoutDate" });
    data.checkoutDate = d;
  }

  if (b.numberOfGuests !== undefined) data.numberOfGuests = Number(b.numberOfGuests);
  if (b.totalPrice !== undefined) data.totalPrice = Number(b.totalPrice);
  if (b.bookingStatus !== undefined) data.bookingStatus = String(b.bookingStatus);

  try {
    const updated = await prisma.booking.update({ where: { id }, data });
    res.status(200).json(updated);
  } catch (e) {
    res.status(404).json({ message: "Booking not found", error: String(e) });
  }
});

// DELETE /bookings/:id (protected) -> 200
router.delete("/:id", auth, async (req, res) => {
  const id = String(req.params.id);

  try {
    await prisma.booking.delete({ where: { id } });
    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    res.status(404).json({ message: "Booking not found", error: String(e) });
  }
});

export default router;