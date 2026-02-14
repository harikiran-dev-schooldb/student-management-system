// import { PrismaClient } from '@prisma/client';
// import fs from 'fs';
// import csv from 'csv-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const prisma = new PrismaClient();

// const readCSVFile = (filePath: string): Promise<any[]> => {
//     return new Promise((resolve, reject) => {
//         const results: any[] = [];
//         fs.createReadStream(filePath)
//             .pipe(csv())
//             .on('data', (data) => results.push(data))
//             .on('end', () => resolve(results))
//             .on('error', reject);
//     });
// };

// async function seedStudents() {
//     console.log("📌 Seeding students...");

//     const projectRootPath = path.resolve(__dirname, '..');
//     const studentFilePath = path.join(projectRootPath, 'data', 'student_data.csv');

//     if (!fs.existsSync(studentFilePath)) {
//         console.error(`❌ Student CSV file not found at: ${studentFilePath}`);
//         return;
//     }

//     const studentsData = await readCSVFile(studentFilePath);

//     const formattedStudents = studentsData.map((row: any) => {
//         const dob = new Date(row.dob);
//         const validDob =
//             dob instanceof Date && !isNaN(dob.getTime()) ? dob : new Date("2000-01-01");

//         return {
//             id: row.id,
//             username: row.username,
//             name: row.name,
//             fatherName: row.fatherName,
//             email: row.email,
//             phone: row.phone,
//             address: row.address,
//             img: row.img,
//             bloodType: row.bloodType,
//             gender: row.gender,
//             dob: validDob,
//             classId: Number(row.classId), 
//             clerk_id: row.clerk_id || null,
//             academicYear: row.academicYear,
//         };
//     });


//     await prisma.student.createMany({ data: formattedStudents });


//     console.log("✅ Students seeded successfully");
// }

// seedStudents()
//     .catch((err) => {
//         console.error("❌ Seeding students failed:", err);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });


// //   npx tsx prisma/seedStudents.ts
