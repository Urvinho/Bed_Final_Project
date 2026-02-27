import prisma from "../../prisma.js";

const deleteReviewById = async (id) => {
  return prisma.review.delete({
    where: { id: String(id) },
  });
};

export default deleteReviewById;