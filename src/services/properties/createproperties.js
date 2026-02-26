import prisma from "../../prisma.js";
import { v4 as uuidv4 } from "uuid";

const createProperty = async (fields) => {
  const { title, location, hostId, amenityIds } = fields;

  return prisma.property.create({
    data: {
      id: uuidv4(),
      title: String(title),
      location: String(location),
      hostId: String(hostId),

      // Optional many-to-many connect
      ...(Array.isArray(amenityIds) && amenityIds.length
        ? {
            amenities: {
              connect: amenityIds.map((id) => ({ id: String(id) })),
            },
          }
        : {}),
    },
    include: {
      amenities: true,
    },
  });
};

export default createProperty;