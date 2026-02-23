-- 1. Retrieve table and column info

-- List all tables in public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- List all columns and their data types for a table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Student';

SELECT *
FROM "StudentFees"
WHERE "studentId" = '17159'
  AND "academicYear" = 'Y2024_2025';


-- 3. 1. Generate reset statements for all sequences

-- This generates ALTER SEQUENCE statements for all serial/bigserial columns
SELECT 
  'ALTER SEQUENCE "' || sequence_name || '" RESTART WITH ' || 
  COALESCE(
    '(SELECT COALESCE(MAX(' || column_name || '),0) + 1 FROM "' || table_name || '")', 
    1
  ) || ';' AS reset_command
FROM information_schema.sequences s
JOIN information_schema.columns c 
  ON s.sequence_name = c.column_default::text LIKE '%' || s.sequence_name || '%';

  SELECT 
  'ALTER SEQUENCE "' || s.sequence_name || '" RESTART WITH ' ||
  (SELECT COALESCE(MAX(id), 0) + 1 FROM "Subject") || ';' AS reset_command
FROM information_schema.sequences s
WHERE s.sequence_name LIKE '%Subject%id%seq%';

SELECT 
  'ALTER SEQUENCE "' || s.sequence_name || '" RESTART WITH ' ||
  (SELECT COALESCE(MAX(id), 0) + 1 FROM "class") || ';' AS reset_command
FROM information_schema.sequences s
WHERE s.sequence_name LIKE '%Class%id%seq%';

ALTER SEQUENCE "class_id_seq" RESTART WITH 1;



-- 2. Basic SELECT queries

-- Retrieve all records
SELECT * FROM "Admin";
SELECT * FROM "Announcement";
SELECT * FROM "Student";
SELECT * FROM "Teacher";
SELECT id, name, 'schoolId'
FROM "Teacher"
WHERE schoolId = 'cmju1hey9000104l54r6cmpsu';
SELECT * FROM "class";
SELECT * FROM "Grade";
SELECT * FROM "FeeStructure";
SELECT * FROM "FeesCollection";
SELECT * FROM "StudentFees";
SELECT * FROM "FeeTransaction";
SELECT * FROM "Exam";
SELECT * FROM "ExamSubject";
SELECT * FROM "Subject";
SELECT * FROM "Homework";
SELECT * FROM "Lesson";
SELECT * FROM "Result";
SELECT * FROM "Attendance";
SELECT * FROM "Messages";
SELECT * FROM "Profile" WHERE clerk_id is not null;
SELECT * FROM "LinkedUser";


SELECT * FROM "Student" WHERE "classId" = 43;
SELECT * FROM "SchoolInfo";
SELECT * FROM "Exam";
SELECT * FROM "ExamGradeSubject";
SELECT * FROM "Result";
SELECT * FROM "Subject";
SELECT * FROM "Profile";
SELECT * FROM "LinkedUser";

INSERT INTO "SchoolInfo" (
  "id","name","address","phone","email","website","logo",
  "taxId","receiptHeader","receiptFooter","createdAt","updatedAt","schoolId"
) VALUES (
  'cmkz9t8ab000304l5xyz987pq',
  'ST. MARY''S ENGLISH MEDIUM SCHOOL',
  '12-45-7, Seethammadhara, Visakhapatnam',
  '9876543210',
  'stmarysvizag@gmail.com',
  'https://stmarysvizag.edu.in/',
  NULL,
  'AP112',
  '(Recognized by Government of Andhra Pradesh) Affiliation No. AP/112 - Dt. 15-08-1995',
  'All fees are subject to school policies.',
  NOW(),
  NOW(),
  'smes_vizag'
);

-- 1️⃣ SchoolInfo
INSERT INTO "SchoolInfo" (
  "id","name","address","phone","email","website","logo",
  "taxId","receiptHeader","receiptFooter","createdAt","updatedAt","schoolId"
) VALUES (
  'cmju1hey9000104l54r6cmpsu',
  'KOTAK SALESIAN SCHOOL',
  '17-309, Golla Veedhi, Old Gopalapatnam',
  '9949523412',
  'kotakschoolvsp@gmail.com',
  'https://kotaksalesianschool-vizag.com/',
  NULL,
  'AP050',
  '(Affiliated to the Council for the I.S.C. Examination, New Delhi) Affiliation No. AP/050 - Dt. 04-11-1987',
  'Fees once paid are not refundable.',
  NOW(),
  NOW(),
  'kss_vizag'
);

INSERT INTO "SchoolInfo" (
  "id","name","address","phone","email","website","logo",
  "taxId","receiptHeader","receiptFooter","createdAt","updatedAt","schoolId"
) VALUES (
  'cmkzbt1x3000404l5abc111aa',
  'GREEN VALLEY HIGH SCHOOL',
  '8-2-45, NAD Junction, Visakhapatnam',
  '9123456780',
  'admin@greenvalleyvizag.com',
  'https://greenvalleyvizag.com/',
  NULL,
  'AP210',
  '(Affiliated to State Board of Andhra Pradesh) Affiliation No. AP/210 - Dt. 10-06-2001',
  'Fees once paid will not be refunded under any circumstances.',
  NOW(),
  NOW(),
  'gvhs_vizag'
);

INSERT INTO "SchoolInfo" (
  "id","name","address","phone","email","website","logo",
  "taxId","receiptHeader","receiptFooter","createdAt","updatedAt","schoolId"
) VALUES (
  'cmkzbt2y4000504l5abc222bb',
  'LITTLE FLOWER SCHOOL',
  '5-10-3, Gajuwaka, Visakhapatnam',
  '9012345678',
  'info@littleflowerschool.edu.in',
  'https://littleflowerschool.edu.in/',
  NULL,
  'AP315',
  '(Recognized by CBSE, New Delhi) Affiliation No. AP/315 - Dt. 22-03-2005',
  'Late fee applicable after due date.',
  NOW(),
  NOW(),
  'lfs_vizag'
);

INSERT INTO "SchoolInfo" (
  "id","name","address","phone","email","website","logo",
  "taxId","receiptHeader","receiptFooter","createdAt","updatedAt","schoolId"
) VALUES (
  'cmkzbt3z5000604l5abc333cc',
  'OAKRIDGE INTERNATIONAL SCHOOL',
  'Survey No. 102, Bheemili Road, Visakhapatnam',
  '9345678901',
  'contact@oakridgevizag.com',
  'https://oakridgevizag.com/',
  NULL,
  'AP420',
  '(Affiliated to ICSE Council, New Delhi) Affiliation No. AP/420 - Dt. 18-09-2010',
  'School reserves the right to revise fee structure annually.',
  NOW(),
  NOW(),
  'ois_vizag'
);

-- 2️⃣ Profile
INSERT INTO "Profile" (
  "id","clerk_id","phone","activeUserId"
) VALUES (
  'cmjf4q3hm00006cjq2nnukul3',
  'user_34hDQUMuHoPtvaWMWsrnYaAYztu',
  '7801049830',
  NULL
);


-- 3️⃣ LinkedUser (ONLY ONCE)
INSERT INTO "LinkedUser" (
  "id","username","role","profileId","schoolId"
) VALUES (
  'cmjf4q3hv00016cjqg8jf9op8',
  'admin001',
  'admin',
  'cmjf4q3hm00006cjq2nnukul3',
  'cmju1hey9000104l54r6cmpsu'
);


-- 4️⃣ Update Profile activeUserId
UPDATE "Profile"
SET "activeUserId" = 'cmjf4q3hv00016cjqg8jf9op8'
WHERE "id" = 'cmjf4q3hm00006cjq2nnukul3';


-- 5️⃣ Admin
INSERT INTO "Admin" (
  "id","username","password","name","parentName","gender","email",
  "phone","address","dob","img","bloodType","createdAt",
  "clerk_id","profileId","linkedUserId","schoolId"
) VALUES (
  'cmjf4q3i600026cjqnm2xzto4',
  'admin001',
  'tester0001',  -- 🔐 use bcrypt
  'A HARIKIRAN',
  'A SRINIVASARAO',
  'Male',
  'hari.myskoolcom@gmail.com',
  '7801049830',
  '17-309, Golla Veedhi, Old Gopalapatnam',
  '1996-03-29',
  'https://res.cloudinary.com/harikiran/image/upload/v1766285381/h4x8fjbq7hlfkvbv4vg9.jpg',
  'O_POS',
  NOW(),
  'user_34hDQUMuHoPtvaWMWsrnYaAYztu',
  'cmjf4q3hm00006cjq2nnukul3',
  'cmjf4q3hv00016cjqg8jf9op8',
  'cmju1hey9000104l54r6cmpsu'
);

SELECT id, 'schoolId', role FROM "LinkedUser";