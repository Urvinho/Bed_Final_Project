import prisma from "../../prisma.js";

const deletePropertyById = async (id) =>
  prisma.property.delete({ where: { id: String(id) } });

export default deletePropertyById;