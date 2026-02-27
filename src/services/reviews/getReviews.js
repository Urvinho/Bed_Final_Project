import prisma from "../../prisma.js";

const getReviews = async () => {
  return prisma.review.findMany();
};

export default getReviews;