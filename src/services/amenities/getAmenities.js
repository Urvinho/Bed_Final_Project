import prisma from "../../prisma.js";

const getAmenities = async () => prisma.amenity.findMany();

export default getAmenities;