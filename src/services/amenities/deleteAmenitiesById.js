import prisma from "../../prisma.js";

const deleteAmenityById = async (id) =>
  prisma.amenity.delete({ where: { id: String(id) } });

export default deleteAmenityById;