import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

// JSON imports (Node ESM)
import usersJson from "../src/data/users.json" with { type: "json" };
import hostsJson from "../src/data/hosts.json" with { type: "json" };
import amenitiesJson from "../src/data/amenities.json" with { type: "json" };
import propertiesJson from "../src/data/properties.json" with { type: "json" };
import bookingsJson from "../src/data/bookings.json" with { type: "json" };
import reviewsJson from "../src/data/reviews.json" with { type: "json" };

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: ["warn", "error"],
});

// Helper: supports both [ ... ] and { key: [...] }
function unwrap(json, key) {
  if (Array.isArray(json)) return json;
  if (key && Array.isArray(json[key])) return json[key];
  const arr = Object.values(json).find((v) => Array.isArray(v));
  if (arr) return arr;
  throw new Error("Invalid JSON format");
}

function assertId(obj, label) {
  if (!obj?.id || String(obj.id).trim() === "") {
    throw new Error(`Missing id for ${label}: ${JSON.stringify(obj)}`);
  }
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
  console.log("🌱 Users...");
  for (const u of users) {
    assertId(u, "user");
    await prisma.user.create({
      data: {
        id: String(u.id), // keep EXACT id from JSON
        username: String(u.username),
        email: String(u.email),
        password: String(u.password),
        name: u.name ?? null,
      },
    });
  }

  // ---------- HOSTS ----------
  console.log("🌱 Hosts...");
  for (const h of hosts) {
    assertId(h, "host");
    await prisma.host.create({
      data: {
        id: String(h.id), // keep EXACT id from JSON
        name: String(h.name),
      },
    });
  }

  // ---------- AMENITIES ----------
  console.log("🌱 Amenities...");
  for (const a of amenities) {
    assertId(a, "amenity");
    await prisma.amenity.create({
      data: {
        id: String(a.id), // keep EXACT id from JSON
        name: String(a.name),
      },
    });
  }

  // ---------- PROPERTIES ----------
  console.log("🌱 Properties...");
  for (const p of properties) {
    assertId(p, "property");

    // hostId must exist (or property insert will fail / tests will 404)
    if (!p.hostId) {
      throw new Error(`Property ${p.id} missing hostId`);
    }

    await prisma.property.create({
      data: {
        id: String(p.id),
        title: String(p.title),
        description: String(p.description),
        location: String(p.location),
        pricePerNight: Number(p.pricePerNight),
        bedroomCount: Number(p.bedroomCount),
        bathRoomCount: Number(p.bathRoomCount),
        maxGuestCount: Number(p.maxGuestCount),
        rating: Number(p.rating),
        hostId: String(p.hostId),

        // Connect amenities immediately (no second update needed)
        ...(Array.isArray(p.amenityIds) && p.amenityIds.length
          ? {
              amenities: {
                connect: p.amenityIds.map((id) => ({ id: String(id) })),
              },
            }
          : {}),
      },
    });
  }

  // ---------- BOOKINGS ----------
  console.log("🌱 Bookings...");
  for (const b of bookings) {
    assertId(b, "booking");

    const checkin = new Date(b.checkinDate);
    const checkout = new Date(b.checkoutDate);

    if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime())) {
      throw new Error(
        `Invalid booking dates for booking id=${b.id}. checkinDate=${b.checkinDate} checkoutDate=${b.checkoutDate}`
      );
    }

    await prisma.booking.create({
      data: {
        id: String(b.id), // keep EXACT id from JSON
        userId: String(b.userId),
        propertyId: String(b.propertyId),
        checkinDate: checkin,
        checkoutDate: checkout,

        // Include these if your Booking model has them (your JSON does)
        numberOfGuests: Number(b.numberOfGuests),
        totalPrice: Number(b.totalPrice),
        bookingStatus: String(b.bookingStatus),
      },
    });
  }

  // ---------- REVIEWS ----------
  console.log("🌱 Reviews...");
  for (const r of reviews) {
    assertId(r, "review");
    await prisma.review.create({
      data: {
        id: String(r.id), // keep EXACT id from JSON
        userId: String(r.userId),
        propertyId: String(r.propertyId),
        rating: Number(r.rating),
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
    await pool.end(); // important so seed exits cleanly
  });