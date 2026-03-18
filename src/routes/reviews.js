import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /reviews
router.get("/", async (req, res, next) => {
  try {
    const { userId, propertyId } = req.query;

    const where = {
      ...(userId ? { userId: String(userId) } : {}),
      ...(propertyId ? { propertyId: String(propertyId) } : {}),
    };

    const items = await prisma.review.findMany({
      where: Object.keys(where).length ? where : undefined,
    });

    if ((userId || propertyId) && items.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
});

// POST /reviews
router.post("/", auth, async (req, res, next) => {
  try {
    const b = req.body ?? {};

    if (!b.userId || !b.propertyId || b.rating === undefined) {
      return res.status(400).json({ message: "userId, propertyId and rating are required" });
    }

    const created = await prisma.review.create({
      data: {
        id: b.id ? String(b.id) : uuidv4(),
        userId: String(b.userId),
        propertyId: String(b.propertyId),
        rating: Number(b.rating),
        comment: b.comment ?? null,
      },
    });

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// GET /reviews/:id
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.review.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!item) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(item);
  } catch (e) {
    next(e);
  }
});

// PUT /reviews/:id
router.put("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }

    const b = req.body ?? {};
    const data = {};

    if (b.userId !== undefined) data.userId = String(b.userId);
    if (b.propertyId !== undefined) data.propertyId = String(b.propertyId);
    if (b.rating !== undefined) data.rating = Number(b.rating);
    if (b.comment !== undefined) data.comment = b.comment ?? null;

    const updated = await prisma.review.update({
      where: { id },
      data,
    });

    res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
});

// DELETE /reviews/:id
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }

    await prisma.review.delete({
      where: { id },
    });

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;