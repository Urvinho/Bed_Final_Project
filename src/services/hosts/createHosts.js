import prisma from "../../prisma.js";
import { v4 as uuidv4 } from "uuid";

const createHost = async (name) => {
  const newHost = await prisma.host.create({
    data: {
      id: uuidv4(), // REQUIRED (no @default(uuid()))
      name: String(name),
    },
  });

  return newHost;
};

export default createHost;
