import prisma from "../../prisma.js";

const getReviewById = async (id) => {
  return prisma.review.findUnique({
    where: { id: String(id) },
  });
};

export default getReviewById;