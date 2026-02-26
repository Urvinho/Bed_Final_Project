import prisma from "../../prisma.js";

const getAmenityById = async (id) =>
  prisma.amenity.findUnique({ where: { id: String(id) } });

export default getAmenityById;