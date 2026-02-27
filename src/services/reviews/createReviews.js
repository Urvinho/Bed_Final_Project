import prisma from "../../prisma.js";
import { v4 as uuidv4 } from "uuid";

const createReview = async (userId, propertyId, rating, comment) => {
  return prisma.review.create({
    data: {
      id: uuidv4(),
      userId: String(userId),
      propertyId: String(propertyId),
      rating: Number(rating),
      comment: comment ?? null,
    },
  });
};

export default createReview;