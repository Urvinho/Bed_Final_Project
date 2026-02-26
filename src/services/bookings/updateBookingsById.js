import prisma from "../../prisma.js";

const updateBookingById = async (id, fields) => {
  const data = {};
  if (fields.userId !== undefined) data.userId = String(fields.userId);
  if (fields.propertyId !== undefined) data.propertyId = String(fields.propertyId);
  if (fields.startDate !== undefined) data.startDate = new Date(fields.startDate);
  if (fields.endDate !== undefined) data.endDate = new Date(fields.endDate);

  return prisma.booking.update({
    where: { id: String(id) },
    data,
  });
};

export default updateBookingById;