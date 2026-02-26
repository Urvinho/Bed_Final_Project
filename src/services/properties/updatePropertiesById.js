import prisma from "../../prisma.js";

const updatePropertyById = async (id, fields) => {
  const data = {};

  if (fields.title !== undefined) data.title = String(fields.title);
  if (fields.location !== undefined) data.location = String(fields.location);
  if (fields.hostId !== undefined) data.hostId = String(fields.hostId);

  // Optional: replace amenities (set)
  if (Array.isArray(fields.amenityIds)) {
    data.amenities = {
      set: fields.amenityIds.map((aId) => ({ id: String(aId) })),
    };
  }

  return prisma.property.update({
    where: { id: String(id) },
    data,
    include: { amenities: true },
  });
};

export default updatePropertyById;