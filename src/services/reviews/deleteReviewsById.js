import prisma from "../../prisma.js";

const deleteReviewsById = async (id) => {
  const existing = await prisma.review.findUnique({
    where: { id: String(id) },
  });

  if (!existing) return null;

  return prisma.review.delete({
    where: { id: String(id) },
  });
};

export default deleteReviewsById;