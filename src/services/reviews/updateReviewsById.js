import prisma from "../../prisma.js";

const updateReviewsById = async (id, rating, comment) => {
  const data = {};

  if (rating !== undefined) data.rating = Number(rating);
  if (comment !== undefined) data.comment = comment ?? null;

  return prisma.review.update({
    where: { id: String(id) },
    data,
  });
};

export default updateReviewsById;