import prisma from "../../prisma.js";

const getBookingById = async (id) =>
  prisma.booking.findUnique({ where: { id: String(id) } });

export default getBookingById;