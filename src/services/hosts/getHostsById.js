import prisma from "../../../prisma.js";

const getHostById = async (id) => {
  return prisma.host.findUnique({
    where: { id: String(id) },
  });
};

export default getHostById;