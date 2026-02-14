// // scripts/seedClasses.ts
// import prisma from "@/lib/prisma";

// const classData = [
//   { name: "LKG", section: "A", gradeId: 2, supervisorId: "staff_ks_001" },
//   { name: "LKG", section: "B", gradeId: 2, supervisorId: "staff_ks_002" },
//   { name: "UKG", section: "A", gradeId: 3, supervisorId: "staff_ks_003" },
//   { name: "UKG", section: "B", gradeId: 3, supervisorId: "staff_ks_004" },
//   { name: "UKG", section: "C", gradeId: 3, supervisorId: "staff_ks_005" },
//   { name: "I", section: "A", gradeId: 4, supervisorId: "staff_ks_007" },
//   { name: "I", section: "B", gradeId: 4, supervisorId: "staff_ks_008" },
//   { name: "I", section: "C", gradeId: 4, supervisorId: "staff_ks_009" },
//   { name: "I", section: "D", gradeId: 4, supervisorId: "staff_ks_012" },
//   // ... Add remaining entries from your list
// ];

// async function seedClasses() {
//   for (const cls of classData) {
//     const className = `${cls.name} - ${cls.section}`;

//     try {
//       await prisma.class.create({
//         data: {
//           section: cls.section,
//           gradeId: cls.gradeId,
//           supervisorId: cls.supervisorId,
//         },
//       });
//       console.log(`✅ Created: ${className}`);
//     } catch (error: any) {
//       if (error.code === "P2002") {
//         console.warn(`⚠️ Duplicate skipped: ${className}`);
//       } else {
//         console.error(`❌ Failed to create ${className}`, error);
//       }
//     }
//   }

//   console.log("✅ Class seeding complete.");
// }

// seedClasses()
//   .catch((err) => {
//     console.error("❌ Seeding failed", err);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
