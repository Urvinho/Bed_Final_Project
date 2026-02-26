import prisma from "../../prisma.js";

const deleteBookingById = async (id) =>
  prisma.booking.delete({ where: { id: String(id) } });

export default deleteBookingById;