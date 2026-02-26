import { Router } from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

function pickReviewCreate(body) {
  return {
    id: uuidv4(), // REQUIRED because schema has `id String @id` with no default
    userId: String(body.userId),
    propertyId: String(body.propertyId),
    rating: Number(body.rating),
    comment: body.comment ?? null,
  };
}

function pickReviewUpdate(body) {
  const data = {};
  if (body.rating !== undefined) data.rating = Number(body.rating);
  if (body.comment !== undefined) data.comment = body.comment ?? null;

  // Usually you do NOT allow changing relations on update:
  // if (body.userId !== undefined) data.userId = String(body.userId);
  // if (body.propertyId !== undefined) data.propertyId = String(body.propertyId);

  return data;
}

router.get("/", async (req, res) => {
  const items = await prisma.review.findMany();
  res.json(items);
});

router.post("/", auth, async (req, res) => {
  try {
    const { userId, propertyId, rating } = req.body ?? {};
    if (!userId || !propertyId || rating === undefined) {
      return res.status(400).json({
        message: "userId, propertyId, and rating are required",
      });
    }

    const data = pickReviewCreate(req.body);

    if (Number.isNaN(data.rating)) {
      return res.status(400).json({ message: "rating must be a number" });
    }

    const created = await prisma.review.create({ data });
    res.status(201).json(created);
  } catch (e) {
    res
      .status(400)
      .json({ message: "Could not create review", error: String(e) });
  }
});

router.get("/:id", async (req, res) => {
  const item = await prisma.review.findUnique({
    where: { id: String(req.params.id) },
  });
  if (!item) return res.status(404).json({ message: "Review not found" });
  res.json(item);
});

router.put("/:id", auth, async (req, res) => {
  try {
    const data = pickReviewUpdate(req.body);

    if (data.rating !== undefined && Number.isNaN(data.rating)) {
      return res.status(400).json({ message: "rating must be a number" });
    }

    const updated = await prisma.review.update({
      where: { id: String(req.params.id) },
      data,
    });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ message: "Review not found", error: String(e) });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ message: "Review not found", error: String(e) });
  }
});

export default router;
