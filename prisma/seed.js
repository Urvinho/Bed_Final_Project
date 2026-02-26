// prisma/seed.js
import "dotenv/config";
import { createRequire } from "node:module";
import { v4 as uuidv4 } from "uuid";

const require = createRequire(import.meta.url);
// const { PrismaClient } = require("@prisma/client");
import { PrismaClient } from "../src/generated/prisma/client";
// JSON imports (Node ESM)
import usersJson from "../src/data/users.json" with { type: "json" };
import hostsJson from "../src/data/hosts.json" with { type: "json" };
import amenitiesJson from "../src/data/amenities.json" with { type: "json" };
import propertiesJson from "../src/data/properties.json" with { type: "json" };
import bookingsJson from "../src/data/bookings.json" with { type: "json" };
import reviewsJson from "../src/data/reviews.json" with { type: "json" };
// import prisma from "../src/prisma";


const prisma = new PrismaClient({ log: ["warn", "error"] });

// Helper: supports both [ ... ] and { key: [...] }
function unwrap(json, key) {
  if (Array.isArray(json)) return json;
  if (key && Array.isArray(json[key])) return json[key];
  const arr = Object.values(json).find((v) => Array.isArray(v));
  if (arr) return arr;
  throw new Error("Invalid JSON format");
}

async function main() {
  console.log("🌱 Seeding database...");

  const users = unwrap(usersJson, "users");
  const hosts = unwrap(hostsJson, "hosts");
  const amenities = unwrap(amenitiesJson, "amenities");
  const properties = unwrap(propertiesJson, "properties");
  const bookings = unwrap(bookingsJson, "bookings");
  const reviews = unwrap(reviewsJson, "reviews");

  // ---------- CLEAR TABLES (children → parents) ----------
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.host.deleteMany();
  await prisma.user.deleteMany();

  // ---------- USERS ----------
  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u.id ?? uuidv4(),
        username: u.username,
        email: u.email,
        name: u.name ?? null,
        image: u.image ?? null,
        password: u.password ?? "password123", // plain text (no crypto allowed)
      },
    });
  }

  // ---------- HOSTS ----------
  for (const h of hosts) {
    await prisma.host.create({
      data: {
        id: h.id ?? uuidv4(),
        name: h.name,
      },
    });
  }

  // ---------- AMENITIES ----------
  for (const a of amenities) {
    await prisma.amenity.create({
      data: {
        id: a.id ?? uuidv4(),
        name: a.name,
      },
    });
  }

  // ---------- PROPERTIES ----------
  for (const p of properties) {
    const created = await prisma.property.create({
      data: {
        id: p.id ?? uuidv4(),
        title: p.title,
        description: p.description,
        location: p.location,
        pricePerNight: Number(p.pricePerNight),
        bedroomCount: Number(p.bedroomCount),
        bathRoomCount: Number(p.bathRoomCount),
        maxGuestCount: Number(p.maxGuestCount),
        rating: Number(p.rating),
        hostId: p.hostId,
      },
    });

    // Connect amenities (many-to-many) if your properties.json contains amenityIds
    if (Array.isArray(p.amenityIds) && p.amenityIds.length) {
      await prisma.property.update({
        where: { id: created.id },
        data: {
          amenities: {
            connect: p.amenityIds.map((id) => ({ id: String(id) })),
          },
        },
      });
    }
  }

  // ---------- BOOKINGS ----------
  for (const b of bookings) {
    await prisma.booking.create({
      data: {
        id: b.id ?? uuidv4(),
        userId: b.userId,
        propertyId: b.propertyId,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
      },
    });
  }

  // ---------- REVIEWS ----------
  for (const r of reviews) {
    await prisma.review.create({
      data: {
        id: r.id ?? uuidv4(),
        userId: r.userId,
        propertyId: r.propertyId,
        rating: r.rating,
        comment: r.comment ?? null,
      },
    });
  }

  console.log("✅ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });