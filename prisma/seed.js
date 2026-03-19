import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";
import crypto from "crypto";
const prisma = new PrismaClient({
    __internal: {
        configOverride: (config) => ({
            ...config,
            datasource: {
                url: process.env.DATABASE_URL,
            },
        }),
    },
});
const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});
async function main() {
    console.log("🌱 Seeding started...");
    const phone = "7801049830";
    const name = "A HARIKIRAN";
    const normalizedPhone = phone;
    /* =========================================
       1️⃣ Clerk User (FIRST)
    ========================================= */
    let clerkUser;
    const existing = await clerk.users.getUserList({
        externalId: [normalizedPhone],
    });
    if (existing.data.length > 0) {
        clerkUser = existing.data[0];
        console.log("✅ Reusing Clerk user:", clerkUser.id);
    }
    else {
        try {
            clerkUser = await clerk.users.createUser({
                externalId: normalizedPhone,
                emailAddress: [`${normalizedPhone}@schooldb.com`],
                firstName: name,
                password: crypto.randomUUID(),
                skipPasswordChecks: true,
            });
            console.log("✅ Clerk user created:", clerkUser.id);
        }
        catch (err) {
            console.error("❌ Clerk error:", err?.errors);
            const retry = await clerk.users.getUserList({
                externalId: [normalizedPhone],
            });
            if (retry.data.length === 0)
                throw err;
            clerkUser = retry.data[0];
        }
    }
    /* =========================================
       2️⃣ School
    ========================================= */
    const school = await prisma.schoolInfo.upsert({
        where: { id: "testing_school" },
        update: {},
        create: {
            id: "testing_school",
            name: "SCHOOL FOR TESTING",
            address: "17-309, Golla Veedhi, Old Gopalapatnam",
            phone,
            email: "kotakschoolvsp@gmail.com",
            website: "https://schooldb.co.in/",
            taxId: "AP001",
            receiptHeader: "Affiliated School",
            receiptFooter: "Fees once paid are not refundable",
            schoolId: "testing_school",
        },
    });
    console.log("✅ School ready");
    /* =========================================
       3️⃣ Branches
    ========================================= */
    await prisma.branch.createMany({
        data: [
            { id: 1, name: "Kinder Garten", type: "KINDERGARTEN", order: 1, schoolId: school.id },
            { id: 2, name: "Primary", type: "PRIMARY", order: 2, schoolId: school.id },
            { id: 3, name: "Secondary", type: "HIGHER", order: 3, schoolId: school.id },
        ],
        skipDuplicates: true,
    });
    console.log("✅ Branches ready");
    /* =========================================
       4️⃣ Academic Year
    ========================================= */
    await prisma.academicYear.updateMany({
        where: { schoolId: school.id },
        data: { isActive: false },
    });
    await prisma.academicYear.upsert({
        where: {
            name_schoolId: {
                name: "2025-26",
                schoolId: school.id,
            },
        },
        update: { isActive: true },
        create: {
            name: "2025-26",
            startDate: new Date("2026-04-01"),
            endDate: new Date("2027-03-31"),
            isActive: true,
            schoolId: school.id,
        },
    });
    console.log("✅ Academic Year ready");
    /* =========================================
       5️⃣ Profile
    ========================================= */
    let profile = await prisma.profile.findFirst({
        where: { clerk_id: clerkUser.id },
    });
    if (!profile) {
        profile = await prisma.profile.create({
            data: {
                clerk_id: clerkUser.id,
                phone,
            },
        });
        console.log("✅ Profile created");
    }
    else {
        console.log("✅ Profile exists");
    }
    /* =========================================
       6️⃣ LinkedUser
    ========================================= */
    let linkedUser = await prisma.linkedUser.findFirst({
        where: {
            profileId: profile.id,
            schoolId: school.id,
        },
    });
    if (!linkedUser) {
        linkedUser = await prisma.linkedUser.create({
            data: {
                username: "admin001",
                role: "admin",
                profileId: profile.id,
                schoolId: school.id,
            },
        });
        console.log("✅ LinkedUser created");
    }
    else {
        console.log("✅ LinkedUser exists");
    }
    /* =========================================
       7️⃣ Admin
    ========================================= */
    const existingAdmin = await prisma.admin.findFirst({
        where: { profileId: profile.id },
    });
    if (!existingAdmin) {
        await prisma.admin.create({
            data: {
                username: "admin001",
                name,
                parentName: "A SRINIVASARAO",
                gender: "Male",
                email: "hari.myskoolcom@gmail.com",
                phone,
                address: "17-309, Golla Veedhi, Old Gopalapatnam",
                dob: new Date("1996-03-29"),
                img: "https://res.cloudinary.com/harikiran/image/upload/v1766285381/h4x8fjbq7hlfkvbv4vg9.jpg",
                bloodType: "O_POS",
                clerk_id: clerkUser.id,
                profileId: profile.id,
                linkedUserId: linkedUser.id,
                schoolId: school.id,
            },
        });
        console.log("✅ Admin created");
    }
    else {
        console.log("✅ Admin exists");
    }
    /* =========================================
       8️⃣ Active User
    ========================================= */
    if (!profile.activeUserId) {
        await prisma.profile.update({
            where: { id: profile.id },
            data: {
                activeUserId: linkedUser.id,
            },
        });
        console.log("✅ Active user set");
    }
    console.log("🌱 Seeding completed successfully");
}
/* =========================================
   RUN
========================================= */
main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
