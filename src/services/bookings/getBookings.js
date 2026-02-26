import prisma from "../../prisma.js";

const getBookings = async (userId) => {
  return prisma.booking.findMany({
    where: userId ? { userId: String(userId) } : undefined,
  });
};

export default getBookings;