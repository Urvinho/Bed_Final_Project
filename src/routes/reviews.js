import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /reviews (public) + filters ?userId= & ?propertyId=
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

    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
});

// POST /reviews (protected)
router.post("/", auth, async (req, res) => {
  try {
    const b = req.body ?? {};
    const userId = b.userId;
    const propertyId = b.propertyId;
    const rating = b.rating;

    if (!userId || !propertyId || rating === undefined) {
      return res.status(400).json({
        message: "userId, propertyId and rating are required",
      });
    }

    const created = await prisma.review.create({
      data: {
        id: b.id ? String(b.id) : uuidv4(),
        userId: String(userId),
        propertyId: String(propertyId),
        rating: Number(rating),
        comment: b.comment ?? null,
      },
    });

    res.status(201).json(created);
  } catch (e) {
    res
      .status(400)
      .json({ message: "Could not create review", error: String(e) });
  }
});

// GET /reviews/:id (public)
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.review.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!item) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(item);
  } catch (e) {
    next(e);
  }
});

// PUT /reviews/:id (protected)
router.put("/:id", auth, async (req, res) => {
  const id = String(req.params.id);
  const b = req.body ?? {};

  const data = {};
  if (b.userId !== undefined) data.userId = String(b.userId);
  if (b.propertyId !== undefined) data.propertyId = String(b.propertyId);
  if (b.rating !== undefined) data.rating = Number(b.rating);
  if (b.comment !== undefined) data.comment = b.comment ?? null;

  try {
    const updated = await prisma.review.update({ where: { id }, data });
    res.status(200).json(updated);
  } catch (e) {
    res.status(404).json({ message: "Review not found", error: String(e) });
  }
});

// DELETE /reviews/:id (protected) -> 200
router.delete("/:id", auth, async (req, res) => {
  const id = String(req.params.id);

  try {
    await prisma.review.delete({ where: { id } });
    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    res.status(404).json({ message: "Review not found", error: String(e) });
  }
});

export default router;
