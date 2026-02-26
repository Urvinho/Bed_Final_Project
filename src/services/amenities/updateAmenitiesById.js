import prisma from "../../prisma.js";

const updateAmenityById = async (id, name) => {
  return prisma.amenity.update({
    where: { id: String(id) },
    data: { name: String(name) },
  });
};

export default updateAmenityById;