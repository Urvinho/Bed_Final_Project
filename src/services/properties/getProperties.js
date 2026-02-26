import prisma from "../../prisma.js";

const getProperties = async (location) => {
  return prisma.property.findMany({
    where: location ? { location: String(location) } : undefined,
  });
};

export default getProperties;