// // src/scripts/assignFeesToExistingStudents.ts

// import prisma from "@/lib/prisma";
// import { PaymentMode } from "@prisma/client";

// console.log("🚀 Starting optimized fee assignment...");

// async function assignFeesToExistingStudents() {
//   try {
//     /**
//      * 1️⃣ Fetch active students with only required fields
//      */
//     const students = await prisma.student.findMany({
//       where: { status: "ACTIVE" },
//       select: {
//         id: true,
//         academicYear: true,
//         classId: true,
//         Class: {
//           select: {
//             Grade: {
//               select: { id: true },
//             },
//           },
//         },
//       },
//     });

//     console.log(`🎯 Found ${students.length} active students`);

//     if (students.length === 0) return;

//     /**
//      * 2️⃣ Build unique (gradeId + academicYear) pairs
//      */
//     const gradeYearKeys = new Set<string>();

//     for (const s of students) {
//       const gradeId = s.Class?.Grade?.id;
//       if (gradeId) {
//         gradeYearKeys.add(`${gradeId}_${s.academicYear}`);
//       }
//     }

//     /**
//      * 3️⃣ Fetch all required fee structures ONCE
//      */
//     const feeStructures = await prisma.feeStructure.findMany({
//       where: {
//         OR: Array.from(gradeYearKeys).map((key) => {
//           const [gradeId, academicYear] = key.split("_");
//           return {
//             gradeId: Number(gradeId),
//             academicYear: academicYear as any,
//           };
//         }),
//       },
//       select: {
//         id: true,
//         gradeId: true,
//         academicYear: true,
//         term: true,
//       },
//     });

//     /**
//      * 4️⃣ Group fee structures by grade + academicYear
//      */
//     const feeMap = new Map<string, typeof feeStructures>();

//     for (const fee of feeStructures) {
//       const key = `${fee.gradeId}_${fee.academicYear}`;
//       if (!feeMap.has(key)) feeMap.set(key, []);
//       feeMap.get(key)!.push(fee);
//     }

//     /**
//      * 5️⃣ Prepare bulk StudentFees rows
//      */
//     const studentFeesData = [];

//     for (const student of students) {
//       const gradeId = student.Class?.Grade?.id;

//       if (!gradeId) {
//         console.warn(`⚠️ Student ${student.id} has no grade. Skipping.`);
//         continue;
//       }

//       const key = `${gradeId}_${student.academicYear}`;
//       const fees = feeMap.get(key);

//       if (!fees || fees.length === 0) {
//         console.warn(
//           `⚠️ No fee structure for grade ${gradeId}, year ${student.academicYear}`
//         );
//         continue;
//       }

//       for (const fee of fees) {
//         studentFeesData.push({
//           studentId: student.id,
//           feeStructureId: fee.id,
//           academicYear: student.academicYear,
//           term: fee.term,
//           paidAmount: 0,
//           discountAmount: 0,
//           fineAmount: 0,
//           abacusPaidAmount: 0,
//           receiptDate: null,
//           receivedDate: null,
//           paymentMode: PaymentMode.CASH,
//         });
//       }
//     }

//     /**
//      * 6️⃣ Bulk insert (single DB call)
//      */
//     if (studentFeesData.length > 0) {
//       const result = await prisma.studentFees.createMany({
//         data: studentFeesData,
//         skipDuplicates: true,
//       });

//       console.log(`✅ Created ${result.count} student fee records`);
//     } else {
//       console.log("⚠️ No student fees to create");
//     }

//     console.log("🏁 Fee assignment completed successfully");
//   } catch (error) {
//     console.error("❌ Fee assignment failed:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// assignFeesToExistingStudents();
