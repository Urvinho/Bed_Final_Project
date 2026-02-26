import prisma from "../../prisma.js";
import { v4 as uuidv4 } from "uuid";

const createAmenity = async (name) => {
  return prisma.amenity.create({
    data: {
      id: uuidv4(),
      name: String(name), // must be unique
    },
  });
};

export default createAmenity;