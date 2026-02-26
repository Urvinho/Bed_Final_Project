import prisma from "../../prisma.js";

const getHosts = async (name) => {
  return prisma.host.findMany({
    where: name ? { name: String(name) } : undefined,
  });
};

export default getHosts;
