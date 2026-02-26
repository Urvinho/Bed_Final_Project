import prisma from "../../prisma.js";

const deleteHostById = async (id) => {
  return prisma.host.delete({
    where: { id: String(id) },
  });
};

export default deleteHostById;
