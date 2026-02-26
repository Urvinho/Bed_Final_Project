import { v4 as uuidv4 } from "uuid";
import prisma from "../../prisma.js";

/**
 * Create a Review in the database (Prisma).
 * Your schema requires `id` (no @default(uuid())),
 * so we generate it here with uuid.
 */
const createReviews = async (userId, propertyId, rating, comment) => {
  const newReview = await prisma.review.create({
    data: {
      id: uuidv4(),
      userId: String(userId),
      propertyId: String(propertyId),
      rating: Number(rating),
      comment: comment ?? null,
    },
  });

  return newReview;
};

export default createReviews;