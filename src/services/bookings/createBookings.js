import prisma from "../../prisma.js";
import { v4 as uuidv4 } from "uuid";

const createBooking = async (userId, propertyId, startDate, endDate) => {
  return prisma.booking.create({
    data: {
      id: uuidv4(),
      userId: String(userId),
      propertyId: String(propertyId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });
};

export default createBooking;