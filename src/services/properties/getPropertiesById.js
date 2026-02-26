import prisma from "../../prisma.js";

const getPropertyById = async (id) =>
  prisma.property.findUnique({ where: { id: String(id) } });

export default getPropertyById;