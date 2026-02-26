import prisma from "../../prisma.js";

const updateHostById = async (id, name) => {
  const data = {};
  if (name !== undefined) data.name = String(name);

  return prisma.host.update({
    where: { id: String(id) },
    data,
  });
};

export default updateHostById;
