import prisma from "../../prisma.js";

const deleteHostById = async (id) => {
  const host = await prisma.host.findUnique({
    where: { id: String(id) },
  });

  if (!host) {
    const error = new Error("Host not found");
    error.status = 404;
    throw error;
  }

  return prisma.host.delete({
    where: { id: String(id) },
  });
};

export default deleteHostById;
