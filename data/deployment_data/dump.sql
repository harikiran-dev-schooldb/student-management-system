--
-- PostgreSQL database dump
--

\restrict BeoVyOscxauNSBnao1CY4xy1qb3RtPqShGzSRXRQCfVYTOyfNEZP9d7I1kICiPO

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.class DROP CONSTRAINT IF EXISTS "class_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public.class DROP CONSTRAINT IF EXISTS "class_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."_SubjectGrades" DROP CONSTRAINT IF EXISTS "_SubjectGrades_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_SubjectGrades" DROP CONSTRAINT IF EXISTS "_SubjectGrades_A_fkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_linkedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeacherClassAssignment" DROP CONSTRAINT IF EXISTS "TeacherClassAssignment_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeacherClassAssignment" DROP CONSTRAINT IF EXISTS "TeacherClassAssignment_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeacherClassAssignment" DROP CONSTRAINT IF EXISTS "TeacherClassAssignment_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeacherClassAssignment" DROP CONSTRAINT IF EXISTS "TeacherClassAssignment_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."Subject" DROP CONSTRAINT IF EXISTS "Subject_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_linkedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentTotalFees" DROP CONSTRAINT IF EXISTS "StudentTotalFees_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentTotalFees" DROP CONSTRAINT IF EXISTS "StudentTotalFees_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentTotalFees" DROP CONSTRAINT IF EXISTS "StudentTotalFees_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_feeStructureId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."SmsTemplate" DROP CONSTRAINT IF EXISTS "SmsTemplate_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_examId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."Profile" DROP CONSTRAINT IF EXISTS "Profile_activeUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."PermissionSlip" DROP CONSTRAINT IF EXISTS "PermissionSlip_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."PermissionSlip" DROP CONSTRAINT IF EXISTS "PermissionSlip_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Messages" DROP CONSTRAINT IF EXISTS "Messages_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Messages" DROP CONSTRAINT IF EXISTS "Messages_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Messages" DROP CONSTRAINT IF EXISTS "Messages_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."LinkedUser" DROP CONSTRAINT IF EXISTS "LinkedUser_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."LinkedUser" DROP CONSTRAINT IF EXISTS "LinkedUser_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Homework" DROP CONSTRAINT IF EXISTS "Homework_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Homework" DROP CONSTRAINT IF EXISTS "Homework_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."Homework" DROP CONSTRAINT IF EXISTS "Homework_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Grade" DROP CONSTRAINT IF EXISTS "Grade_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Grade" DROP CONSTRAINT IF EXISTS "Grade_branchId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_studentFeesId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeStructure" DROP CONSTRAINT IF EXISTS "FeeStructure_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeStructure" DROP CONSTRAINT IF EXISTS "FeeStructure_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeStructure" DROP CONSTRAINT IF EXISTS "FeeStructure_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeePayment" DROP CONSTRAINT IF EXISTS "FeePayment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeePayment" DROP CONSTRAINT IF EXISTS "FeePayment_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_examId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."CancelledReceipt" DROP CONSTRAINT IF EXISTS "CancelledReceipt_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."CancelledReceipt" DROP CONSTRAINT IF EXISTS "CancelledReceipt_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."BulkUploadJob" DROP CONSTRAINT IF EXISTS "BulkUploadJob_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Branch" DROP CONSTRAINT IF EXISTS "Branch_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_academicYearId_fkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentSubmission" DROP CONSTRAINT IF EXISTS "AssignmentSubmission_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentSubmission" DROP CONSTRAINT IF EXISTS "AssignmentSubmission_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentSubmission" DROP CONSTRAINT IF EXISTS "AssignmentSubmission_assignmentId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentGradeSubject" DROP CONSTRAINT IF EXISTS "AssignmentGradeSubject_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentGradeSubject" DROP CONSTRAINT IF EXISTS "AssignmentGradeSubject_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentGradeSubject" DROP CONSTRAINT IF EXISTS "AssignmentGradeSubject_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentGradeSubject" DROP CONSTRAINT IF EXISTS "AssignmentGradeSubject_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentGradeSubject" DROP CONSTRAINT IF EXISTS "AssignmentGradeSubject_assignmentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_linkedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."AcademicYear" DROP CONSTRAINT IF EXISTS "AcademicYear_schoolId_fkey";
DROP INDEX IF EXISTS public."class_schoolId_idx";
DROP INDEX IF EXISTS public."_SubjectGrades_B_index";
DROP INDEX IF EXISTS public."Teacher_username_schoolId_key";
DROP INDEX IF EXISTS public."Teacher_schoolId_idx";
DROP INDEX IF EXISTS public."Teacher_phone_idx";
DROP INDEX IF EXISTS public."Teacher_name_idx";
DROP INDEX IF EXISTS public."Teacher_linkedUserId_key";
DROP INDEX IF EXISTS public."Teacher_clerk_id_schoolId_key";
DROP INDEX IF EXISTS public."Teacher_clerk_id_idx";
DROP INDEX IF EXISTS public."TeacherClassAssignment_teacherId_classId_academicYearId_sch_key";
DROP INDEX IF EXISTS public."TeacherClassAssignment_schoolId_idx";
DROP INDEX IF EXISTS public."TeacherClassAssignment_classId_academicYearId_idx";
DROP INDEX IF EXISTS public."Subject_schoolId_idx";
DROP INDEX IF EXISTS public."Subject_name_schoolId_key";
DROP INDEX IF EXISTS public."SubjectTeacher_schoolId_idx";
DROP INDEX IF EXISTS public."Student_username_schoolId_key";
DROP INDEX IF EXISTS public."Student_schoolId_idx";
DROP INDEX IF EXISTS public."Student_linkedUserId_key";
DROP INDEX IF EXISTS public."Student_gender_status_idx";
DROP INDEX IF EXISTS public."Student_admissionNo_schoolId_key";
DROP INDEX IF EXISTS public."StudentTotalFees_studentId_academicYearId_schoolId_key";
DROP INDEX IF EXISTS public."StudentTotalFees_schoolId_idx";
DROP INDEX IF EXISTS public."StudentFees_studentId_academicYearId_term_schoolId_key";
DROP INDEX IF EXISTS public."StudentFees_schoolId_idx";
DROP INDEX IF EXISTS public."StudentEnrollment_studentId_academicYearId_schoolId_key";
DROP INDEX IF EXISTS public."StudentEnrollment_schoolId_idx";
DROP INDEX IF EXISTS public."StudentEnrollment_academicYearId_classId_idx";
DROP INDEX IF EXISTS public."SmsTemplate_type_schoolId_key";
DROP INDEX IF EXISTS public."SmsTemplate_schoolId_idx";
DROP INDEX IF EXISTS public."SchoolInfo_schoolId_key";
DROP INDEX IF EXISTS public."Result_studentId_examId_subjectId_academicYearId_schoolId_key";
DROP INDEX IF EXISTS public."Result_examId_schoolId_studentId_idx";
DROP INDEX IF EXISTS public."Result_academicYearId_idx";
DROP INDEX IF EXISTS public."Profile_phone_idx";
DROP INDEX IF EXISTS public."Profile_clerk_id_key";
DROP INDEX IF EXISTS public."Profile_clerk_id_idx";
DROP INDEX IF EXISTS public."Profile_activeUserId_key";
DROP INDEX IF EXISTS public."PermissionSlip_schoolId_idx";
DROP INDEX IF EXISTS public."Messages_schoolId_idx";
DROP INDEX IF EXISTS public."LinkedUser_username_schoolId_key";
DROP INDEX IF EXISTS public."LinkedUser_profileId_schoolId_idx";
DROP INDEX IF EXISTS public."Lesson_teacherId_idx";
DROP INDEX IF EXISTS public."Lesson_subjectId_idx";
DROP INDEX IF EXISTS public."Lesson_schoolId_idx";
DROP INDEX IF EXISTS public."Lesson_day_period_idx";
DROP INDEX IF EXISTS public."Lesson_classId_idx";
DROP INDEX IF EXISTS public."Homework_schoolId_idx";
DROP INDEX IF EXISTS public."Homework_groupId_idx";
DROP INDEX IF EXISTS public."Homework_gradeId_idx";
DROP INDEX IF EXISTS public."Homework_date_idx";
DROP INDEX IF EXISTS public."Homework_classId_idx";
DROP INDEX IF EXISTS public."Grade_schoolId_idx";
DROP INDEX IF EXISTS public."Grade_level_schoolId_key";
DROP INDEX IF EXISTS public."Grade_level_idx";
DROP INDEX IF EXISTS public."Grade_branchId_idx";
DROP INDEX IF EXISTS public."FeeTransaction_studentId_academicYearId_idx";
DROP INDEX IF EXISTS public."FeeTransaction_schoolId_receiptDate_idx";
DROP INDEX IF EXISTS public."FeeTransaction_schoolId_idx";
DROP INDEX IF EXISTS public."FeeTransaction_academicYearId_receiptDate_idx";
DROP INDEX IF EXISTS public."FeeStructure_schoolId_idx";
DROP INDEX IF EXISTS public."FeeStructure_gradeId_term_academicYearId_schoolId_key";
DROP INDEX IF EXISTS public."FeePayment_transactionId_key";
DROP INDEX IF EXISTS public."FeePayment_studentId_idx";
DROP INDEX IF EXISTS public."FeePayment_schoolId_idx";
DROP INDEX IF EXISTS public."FeePayment_orderId_key";
DROP INDEX IF EXISTS public."Exam_title_academicYearId_schoolId_key";
DROP INDEX IF EXISTS public."Exam_schoolId_idx";
DROP INDEX IF EXISTS public."Exam_academicYearId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_subjectId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_schoolId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_gradeId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_examId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_examId_gradeId_subjectId_academicYearId_sc_key";
DROP INDEX IF EXISTS public."Event_schoolId_idx";
DROP INDEX IF EXISTS public."Event_classId_idx";
DROP INDEX IF EXISTS public."Class_gradeId_section_key";
DROP INDEX IF EXISTS public."Class_gradeId_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_term_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_studentId_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_schoolId_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_originalReceiptNo_idx";
DROP INDEX IF EXISTS public."BulkUploadJob_schoolId_idx";
DROP INDEX IF EXISTS public."Branch_schoolId_idx";
DROP INDEX IF EXISTS public."Branch_name_schoolId_key";
DROP INDEX IF EXISTS public."Attendance_studentId_date_academicYearId_schoolId_key";
DROP INDEX IF EXISTS public."Attendance_studentId_classId_idx";
DROP INDEX IF EXISTS public."Attendance_schoolId_idx";
DROP INDEX IF EXISTS public."Attendance_schoolId_date_idx";
DROP INDEX IF EXISTS public."Attendance_schoolId_classId_date_idx";
DROP INDEX IF EXISTS public."Attendance_classId_date_idx";
DROP INDEX IF EXISTS public."Attendance_academicYearId_studentId_idx";
DROP INDEX IF EXISTS public."Assignment_title_schoolId_key";
DROP INDEX IF EXISTS public."Assignment_schoolId_idx";
DROP INDEX IF EXISTS public."AssignmentSubmission_schoolId_idx";
DROP INDEX IF EXISTS public."AssignmentSubmission_assignmentId_studentId_schoolId_key";
DROP INDEX IF EXISTS public."AssignmentGradeSubject_schoolId_idx";
DROP INDEX IF EXISTS public."AssignmentGradeSubject_assignmentId_gradeId_classId_subject_key";
DROP INDEX IF EXISTS public."Announcement_schoolId_idx";
DROP INDEX IF EXISTS public."Announcement_classId_idx";
DROP INDEX IF EXISTS public."Admin_username_schoolId_key";
DROP INDEX IF EXISTS public."Admin_username_email_phone_idx";
DROP INDEX IF EXISTS public."Admin_schoolId_idx";
DROP INDEX IF EXISTS public."Admin_phone_schoolId_key";
DROP INDEX IF EXISTS public."Admin_linkedUserId_key";
DROP INDEX IF EXISTS public."Admin_id_schoolId_key";
DROP INDEX IF EXISTS public."Admin_email_schoolId_key";
DROP INDEX IF EXISTS public."Admin_clerk_id_schoolId_key";
DROP INDEX IF EXISTS public."AcademicYear_schoolId_idx";
DROP INDEX IF EXISTS public."AcademicYear_name_schoolId_key";
ALTER TABLE IF EXISTS ONLY public.class DROP CONSTRAINT IF EXISTS class_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."_SubjectGrades" DROP CONSTRAINT IF EXISTS "_SubjectGrades_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_pkey";
ALTER TABLE IF EXISTS ONLY public."TeacherClassAssignment" DROP CONSTRAINT IF EXISTS "TeacherClassAssignment_pkey";
ALTER TABLE IF EXISTS ONLY public."Subject" DROP CONSTRAINT IF EXISTS "Subject_pkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_pkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentTotalFees" DROP CONSTRAINT IF EXISTS "StudentTotalFees_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_pkey";
ALTER TABLE IF EXISTS ONLY public."SmsTemplate" DROP CONSTRAINT IF EXISTS "SmsTemplate_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolInfo" DROP CONSTRAINT IF EXISTS "SchoolInfo_pkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_pkey";
ALTER TABLE IF EXISTS ONLY public."Profile" DROP CONSTRAINT IF EXISTS "Profile_pkey";
ALTER TABLE IF EXISTS ONLY public."PermissionSlip" DROP CONSTRAINT IF EXISTS "PermissionSlip_pkey";
ALTER TABLE IF EXISTS ONLY public."Messages" DROP CONSTRAINT IF EXISTS "Messages_pkey";
ALTER TABLE IF EXISTS ONLY public."LinkedUser" DROP CONSTRAINT IF EXISTS "LinkedUser_pkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_pkey";
ALTER TABLE IF EXISTS ONLY public."Homework" DROP CONSTRAINT IF EXISTS "Homework_pkey";
ALTER TABLE IF EXISTS ONLY public."Grade" DROP CONSTRAINT IF EXISTS "Grade_pkey";
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_pkey";
ALTER TABLE IF EXISTS ONLY public."FeeStructure" DROP CONSTRAINT IF EXISTS "FeeStructure_pkey";
ALTER TABLE IF EXISTS ONLY public."FeePayment" DROP CONSTRAINT IF EXISTS "FeePayment_pkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_pkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_pkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_pkey";
ALTER TABLE IF EXISTS ONLY public."CancelledReceipt" DROP CONSTRAINT IF EXISTS "CancelledReceipt_pkey";
ALTER TABLE IF EXISTS ONLY public."BulkUploadJob" DROP CONSTRAINT IF EXISTS "BulkUploadJob_pkey";
ALTER TABLE IF EXISTS ONLY public."Branch" DROP CONSTRAINT IF EXISTS "Branch_pkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_pkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_pkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentSubmission" DROP CONSTRAINT IF EXISTS "AssignmentSubmission_pkey";
ALTER TABLE IF EXISTS ONLY public."AssignmentGradeSubject" DROP CONSTRAINT IF EXISTS "AssignmentGradeSubject_pkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_pkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_pkey";
ALTER TABLE IF EXISTS ONLY public."AcademicYear" DROP CONSTRAINT IF EXISTS "AcademicYear_pkey";
ALTER TABLE IF EXISTS public.class ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TeacherClassAssignment" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Subject" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."StudentTotalFees" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."StudentFees" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."StudentEnrollment" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."SmsTemplate" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Result" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."PermissionSlip" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Lesson" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Homework" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Grade" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."FeeTransaction" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."FeeStructure" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."FeePayment" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."ExamGradeSubject" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Exam" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Event" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Branch" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Attendance" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."AssignmentSubmission" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."AssignmentGradeSubject" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Assignment" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Announcement" ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.class_id_seq;
DROP TABLE IF EXISTS public.class;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."_SubjectGrades";
DROP SEQUENCE IF EXISTS public."TeacherClassAssignment_id_seq";
DROP TABLE IF EXISTS public."TeacherClassAssignment";
DROP TABLE IF EXISTS public."Teacher";
DROP SEQUENCE IF EXISTS public."Subject_id_seq";
DROP TABLE IF EXISTS public."SubjectTeacher";
DROP TABLE IF EXISTS public."Subject";
DROP SEQUENCE IF EXISTS public."StudentTotalFees_id_seq";
DROP TABLE IF EXISTS public."StudentTotalFees";
DROP SEQUENCE IF EXISTS public."StudentFees_id_seq";
DROP TABLE IF EXISTS public."StudentFees";
DROP SEQUENCE IF EXISTS public."StudentEnrollment_id_seq";
DROP TABLE IF EXISTS public."StudentEnrollment";
DROP TABLE IF EXISTS public."Student";
DROP SEQUENCE IF EXISTS public."SmsTemplate_id_seq";
DROP TABLE IF EXISTS public."SmsTemplate";
DROP TABLE IF EXISTS public."SchoolInfo";
DROP SEQUENCE IF EXISTS public."Result_id_seq";
DROP TABLE IF EXISTS public."Result";
DROP TABLE IF EXISTS public."Profile";
DROP SEQUENCE IF EXISTS public."PermissionSlip_id_seq";
DROP TABLE IF EXISTS public."PermissionSlip";
DROP TABLE IF EXISTS public."Messages";
DROP TABLE IF EXISTS public."LinkedUser";
DROP SEQUENCE IF EXISTS public."Lesson_id_seq";
DROP TABLE IF EXISTS public."Lesson";
DROP SEQUENCE IF EXISTS public."Homework_id_seq";
DROP TABLE IF EXISTS public."Homework";
DROP SEQUENCE IF EXISTS public."Grade_id_seq";
DROP TABLE IF EXISTS public."Grade";
DROP SEQUENCE IF EXISTS public."FeeTransaction_id_seq";
DROP TABLE IF EXISTS public."FeeTransaction";
DROP SEQUENCE IF EXISTS public."FeeStructure_id_seq";
DROP TABLE IF EXISTS public."FeeStructure";
DROP SEQUENCE IF EXISTS public."FeePayment_id_seq";
DROP TABLE IF EXISTS public."FeePayment";
DROP SEQUENCE IF EXISTS public."Exam_id_seq";
DROP SEQUENCE IF EXISTS public."ExamGradeSubject_id_seq";
DROP TABLE IF EXISTS public."ExamGradeSubject";
DROP TABLE IF EXISTS public."Exam";
DROP SEQUENCE IF EXISTS public."Event_id_seq";
DROP TABLE IF EXISTS public."Event";
DROP TABLE IF EXISTS public."CancelledReceipt";
DROP TABLE IF EXISTS public."BulkUploadJob";
DROP SEQUENCE IF EXISTS public."Branch_id_seq";
DROP TABLE IF EXISTS public."Branch";
DROP SEQUENCE IF EXISTS public."Attendance_id_seq";
DROP TABLE IF EXISTS public."Attendance";
DROP SEQUENCE IF EXISTS public."Assignment_id_seq";
DROP SEQUENCE IF EXISTS public."AssignmentSubmission_id_seq";
DROP TABLE IF EXISTS public."AssignmentSubmission";
DROP SEQUENCE IF EXISTS public."AssignmentGradeSubject_id_seq";
DROP TABLE IF EXISTS public."AssignmentGradeSubject";
DROP TABLE IF EXISTS public."Assignment";
DROP SEQUENCE IF EXISTS public."Announcement_id_seq";
DROP TABLE IF EXISTS public."Announcement";
DROP TABLE IF EXISTS public."Admin";
DROP TABLE IF EXISTS public."AcademicYear";
DROP TYPE IF EXISTS public."UserStatus";
DROP TYPE IF EXISTS public."Term";
DROP TYPE IF EXISTS public."StudentStatus";
DROP TYPE IF EXISTS public."Period";
DROP TYPE IF EXISTS public."PaymentStatus";
DROP TYPE IF EXISTS public."PaymentMode";
DROP TYPE IF EXISTS public."MessageType";
DROP TYPE IF EXISTS public."LessonDay";
DROP TYPE IF EXISTS public."LeaveType";
DROP TYPE IF EXISTS public."Gender";
DROP TYPE IF EXISTS public."EnrollmentStatus";
DROP TYPE IF EXISTS public."ClassTeacherRole";
DROP TYPE IF EXISTS public."BranchType";
DROP TYPE IF EXISTS public."BloodType";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BloodType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BloodType" AS ENUM (
    'A_POS',
    'A_NEG',
    'B_POS',
    'B_NEG',
    'AB_POS',
    'AB_NEG',
    'O_POS',
    'O_NEG',
    'NA'
);


--
-- Name: BranchType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BranchType" AS ENUM (
    'KINDERGARTEN',
    'PRIMARY',
    'HIGHER',
    'COLLEGE',
    'INSTITUTION'
);


--
-- Name: ClassTeacherRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ClassTeacherRole" AS ENUM (
    'SUPERVISOR',
    'SUBJECT'
);


--
-- Name: EnrollmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EnrollmentStatus" AS ENUM (
    'ACTIVE',
    'PROMOTED',
    'REPEATED',
    'TRANSFERRED',
    'NOT_COMING'
);


--
-- Name: Gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Gender" AS ENUM (
    'Male',
    'Female'
);


--
-- Name: LeaveType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeaveType" AS ENUM (
    'SICK',
    'PERSONAL',
    'HALFDAY',
    'DAILY_PERMISSION'
);


--
-- Name: LessonDay; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LessonDay" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);


--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageType" AS ENUM (
    'ABSENT',
    'FEE_RELATED',
    'ANNOUNCEMENT',
    'GENERAL',
    'FEE_COLLECTION',
    'HOMEWORK',
    'EXAM_RESULT',
    'EVENT',
    'PERMISSION_SLIP'
);


--
-- Name: PaymentMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMode" AS ENUM (
    'CASH',
    'ONLINE',
    'UPI',
    'BANK_TRANSFER'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


--
-- Name: Period; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Period" AS ENUM (
    'PERIOD1',
    'PERIOD2',
    'PERIOD3',
    'PERIOD4',
    'PERIOD5',
    'PERIOD6',
    'PERIOD7',
    'PERIOD8',
    'BREAK1',
    'BREAK2',
    'LUNCH'
);


--
-- Name: StudentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StudentStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'TRANSFERRED',
    'SUSPENDED'
);


--
-- Name: Term; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Term" AS ENUM (
    'TERM_1',
    'TERM_2',
    'TERM_3',
    'TERM_4'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ON_LEAVE',
    'SUSPENDED',
    'RESIGNED',
    'TERMINATED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AcademicYear; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AcademicYear" (
    id text NOT NULL,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: Admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    "parentName" text NOT NULL,
    gender public."Gender" DEFAULT 'Male'::public."Gender" NOT NULL,
    email text,
    phone text NOT NULL,
    address text NOT NULL,
    dob timestamp(3) without time zone,
    img text,
    "bloodType" public."BloodType",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    clerk_id text,
    "profileId" text,
    "linkedUserId" text,
    "schoolId" text NOT NULL
);


--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Announcement" (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "classId" integer,
    "schoolId" text NOT NULL
);


--
-- Name: Announcement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Announcement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Announcement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Announcement_id_seq" OWNED BY public."Announcement".id;


--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Assignment" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    "schoolId" text NOT NULL
);


--
-- Name: AssignmentGradeSubject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AssignmentGradeSubject" (
    id integer NOT NULL,
    "assignmentId" integer NOT NULL,
    "gradeId" integer NOT NULL,
    "classId" integer NOT NULL,
    "subjectId" integer NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "maxMarks" integer NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: AssignmentGradeSubject_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AssignmentGradeSubject_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AssignmentGradeSubject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AssignmentGradeSubject_id_seq" OWNED BY public."AssignmentGradeSubject".id;


--
-- Name: AssignmentSubmission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AssignmentSubmission" (
    id integer NOT NULL,
    "assignmentId" integer NOT NULL,
    "studentId" text NOT NULL,
    marks double precision,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks text,
    "schoolId" text NOT NULL
);


--
-- Name: AssignmentSubmission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AssignmentSubmission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AssignmentSubmission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AssignmentSubmission_id_seq" OWNED BY public."AssignmentSubmission".id;


--
-- Name: Assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Assignment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Assignment_id_seq" OWNED BY public."Assignment".id;


--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attendance" (
    id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    present boolean DEFAULT true NOT NULL,
    "studentId" text NOT NULL,
    "classId" integer NOT NULL,
    "schoolId" text NOT NULL,
    "academicYearId" text NOT NULL
);


--
-- Name: Attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Attendance_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Attendance_id_seq" OWNED BY public."Attendance".id;


--
-- Name: Branch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Branch" (
    id integer NOT NULL,
    name text NOT NULL,
    type public."BranchType" NOT NULL,
    "order" integer NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: Branch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Branch_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Branch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Branch_id_seq" OWNED BY public."Branch".id;


--
-- Name: BulkUploadJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BulkUploadJob" (
    id text NOT NULL,
    "schoolId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    total integer NOT NULL,
    processed integer DEFAULT 0 NOT NULL,
    created integer DEFAULT 0 NOT NULL,
    updated integer DEFAULT 0 NOT NULL,
    errors jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CancelledReceipt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CancelledReceipt" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    term public."Term" NOT NULL,
    "originalReceiptNo" text NOT NULL,
    "cancelledDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cancelledBy" text,
    reason text,
    "cancelledAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "cancelledDiscount" numeric(12,2) DEFAULT 0 NOT NULL,
    "cancelledFine" numeric(12,2) DEFAULT 0 NOT NULL,
    "cancelledTotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: Event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Event" (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "classId" integer,
    "schoolId" text NOT NULL
);


--
-- Name: Event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Event_id_seq" OWNED BY public."Event".id;


--
-- Name: Exam; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Exam" (
    id integer NOT NULL,
    title text NOT NULL,
    "schoolId" text NOT NULL,
    "academicYearId" text NOT NULL
);


--
-- Name: ExamGradeSubject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExamGradeSubject" (
    id integer NOT NULL,
    "examId" integer NOT NULL,
    "gradeId" integer NOT NULL,
    "subjectId" integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "maxMarks" integer NOT NULL,
    "schoolId" text NOT NULL,
    "academicYearId" text NOT NULL
);


--
-- Name: ExamGradeSubject_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ExamGradeSubject_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ExamGradeSubject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ExamGradeSubject_id_seq" OWNED BY public."ExamGradeSubject".id;


--
-- Name: Exam_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Exam_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Exam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Exam_id_seq" OWNED BY public."Exam".id;


--
-- Name: FeePayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeePayment" (
    id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "transactionId" text,
    "orderId" text NOT NULL,
    "studentId" text NOT NULL,
    "schoolId" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: FeePayment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."FeePayment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: FeePayment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."FeePayment_id_seq" OWNED BY public."FeePayment".id;


--
-- Name: FeeStructure; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeeStructure" (
    id integer NOT NULL,
    "gradeId" integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "termFees" integer NOT NULL,
    "abacusFees" integer,
    term public."Term" NOT NULL,
    "academicYearId" text NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: FeeStructure_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."FeeStructure_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: FeeStructure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."FeeStructure_id_seq" OWNED BY public."FeeStructure".id;


--
-- Name: FeeTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeeTransaction" (
    id integer NOT NULL,
    "studentId" text NOT NULL,
    "studentFeesId" integer NOT NULL,
    term public."Term" NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "fineAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "receiptDate" timestamp(3) without time zone NOT NULL,
    "receivedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "receiptNo" text NOT NULL,
    "paymentMode" public."PaymentMode" DEFAULT 'CASH'::public."PaymentMode" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    remarks text,
    "academicYearId" text NOT NULL,
    "transactionType" text DEFAULT 'PAYMENT'::text NOT NULL,
    "updatedByName" text,
    "deletedAt" timestamp(3) without time zone,
    "schoolId" text NOT NULL
);


--
-- Name: FeeTransaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."FeeTransaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: FeeTransaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."FeeTransaction_id_seq" OWNED BY public."FeeTransaction".id;


--
-- Name: Grade; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Grade" (
    id integer NOT NULL,
    level text NOT NULL,
    "schoolId" text NOT NULL,
    "branchId" integer NOT NULL
);


--
-- Name: Grade_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Grade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Grade_id_seq" OWNED BY public."Grade".id;


--
-- Name: Homework; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Homework" (
    id integer NOT NULL,
    "groupId" text,
    description text NOT NULL,
    date timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "classId" integer NOT NULL,
    "gradeId" integer NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: Homework_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Homework_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Homework_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Homework_id_seq" OWNED BY public."Homework".id;


--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lesson" (
    id integer NOT NULL,
    title text NOT NULL,
    day public."LessonDay" NOT NULL,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    period public."Period" NOT NULL,
    "subjectId" integer NOT NULL,
    "classId" integer NOT NULL,
    "teacherId" text NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: Lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Lesson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Lesson_id_seq" OWNED BY public."Lesson".id;


--
-- Name: LinkedUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LinkedUser" (
    id text NOT NULL,
    username text NOT NULL,
    role text NOT NULL,
    "profileId" text NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: Messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Messages" (
    id text NOT NULL,
    message text NOT NULL,
    type public."MessageType" NOT NULL,
    "studentId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "classId" integer,
    "schoolId" text NOT NULL
);


--
-- Name: PermissionSlip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PermissionSlip" (
    id integer NOT NULL,
    "studentId" text NOT NULL,
    "leaveType" public."LeaveType" NOT NULL,
    "subReason" text,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "timeIssued" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "withWhom" text,
    relation text,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PermissionSlip_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."PermissionSlip_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PermissionSlip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."PermissionSlip_id_seq" OWNED BY public."PermissionSlip".id;


--
-- Name: Profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Profile" (
    id text NOT NULL,
    clerk_id text,
    phone text,
    "activeUserId" text
);


--
-- Name: Result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Result" (
    id integer NOT NULL,
    marks double precision NOT NULL,
    "studentId" text NOT NULL,
    "examId" integer NOT NULL,
    "subjectId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "schoolId" text NOT NULL,
    "academicYearId" text NOT NULL
);


--
-- Name: Result_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Result_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Result_id_seq" OWNED BY public."Result".id;


--
-- Name: SchoolInfo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolInfo" (
    id text NOT NULL,
    "schoolId" text NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    phone text,
    email text,
    website text,
    logo text,
    "taxId" text,
    "receiptHeader" text,
    "receiptFooter" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SmsTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SmsTemplate" (
    id integer NOT NULL,
    type public."MessageType" NOT NULL,
    content text NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SmsTemplate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."SmsTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SmsTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."SmsTemplate_id_seq" OWNED BY public."SmsTemplate".id;


--
-- Name: Student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    "motherName" text,
    "fatherName" text,
    "penNo" text,
    "studentAadhar" text,
    "fatherAadhar" text,
    "motherAadhar" text,
    email text,
    phone text NOT NULL,
    address text NOT NULL,
    img text,
    "bloodType" text,
    gender public."Gender" NOT NULL,
    dob timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."StudentStatus" DEFAULT 'ACTIVE'::public."StudentStatus" NOT NULL,
    clerk_id text,
    "profileId" text,
    "linkedUserId" text,
    "schoolId" text NOT NULL,
    "leftAt" timestamp(3) without time zone,
    "leftReason" text,
    "admissionNo" text
);


--
-- Name: StudentEnrollment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudentEnrollment" (
    id integer NOT NULL,
    "studentId" text NOT NULL,
    "classId" integer NOT NULL,
    "academicYearId" text NOT NULL,
    status public."EnrollmentStatus" DEFAULT 'ACTIVE'::public."EnrollmentStatus" NOT NULL,
    "promotedFromId" integer,
    "schoolId" text NOT NULL
);


--
-- Name: StudentEnrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."StudentEnrollment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: StudentEnrollment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."StudentEnrollment_id_seq" OWNED BY public."StudentEnrollment".id;


--
-- Name: StudentFees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudentFees" (
    id integer NOT NULL,
    "studentId" text NOT NULL,
    "feeStructureId" integer NOT NULL,
    "academicYearId" text NOT NULL,
    term public."Term" NOT NULL,
    "paidAmount" integer DEFAULT 0 NOT NULL,
    "abacusPaidAmount" integer,
    "discountAmount" integer DEFAULT 0 NOT NULL,
    "fineAmount" integer DEFAULT 0 NOT NULL,
    "receiptDate" timestamp(3) without time zone,
    "receivedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" public."PaymentMode" DEFAULT 'CASH'::public."PaymentMode" NOT NULL,
    "receiptNo" text,
    remarks text DEFAULT ''::text,
    "updatedByName" text,
    "schoolId" text NOT NULL
);


--
-- Name: StudentFees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."StudentFees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: StudentFees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."StudentFees_id_seq" OWNED BY public."StudentFees".id;


--
-- Name: StudentTotalFees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudentTotalFees" (
    id integer NOT NULL,
    "studentId" text NOT NULL,
    "schoolId" text NOT NULL,
    "totalPaidAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalDiscountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalFineAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalAbacusAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalFeeAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "dueAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "academicYearId" text NOT NULL
);


--
-- Name: StudentTotalFees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."StudentTotalFees_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: StudentTotalFees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."StudentTotalFees_id_seq" OWNED BY public."StudentTotalFees".id;


--
-- Name: Subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subject" (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: SubjectTeacher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SubjectTeacher" (
    "subjectId" integer NOT NULL,
    "teacherId" text NOT NULL,
    "classId" integer NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: Subject_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Subject_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Subject_id_seq" OWNED BY public."Subject".id;


--
-- Name: Teacher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Teacher" (
    id text NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    "parentName" text,
    email text,
    phone text NOT NULL,
    address text NOT NULL,
    img text,
    "bloodType" text,
    gender public."Gender" NOT NULL,
    dob timestamp(3) without time zone,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    clerk_id text,
    "profileId" text,
    "linkedUserId" text,
    "schoolId" text NOT NULL,
    "leftAt" timestamp(3) without time zone,
    "leftReason" text
);


--
-- Name: TeacherClassAssignment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeacherClassAssignment" (
    id integer NOT NULL,
    "teacherId" text NOT NULL,
    "classId" integer NOT NULL,
    "academicYearId" text NOT NULL,
    "schoolId" text NOT NULL,
    role public."ClassTeacherRole" DEFAULT 'SUBJECT'::public."ClassTeacherRole" NOT NULL
);


--
-- Name: TeacherClassAssignment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TeacherClassAssignment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TeacherClassAssignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TeacherClassAssignment_id_seq" OWNED BY public."TeacherClassAssignment".id;


--
-- Name: _SubjectGrades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_SubjectGrades" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: class; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class (
    id integer NOT NULL,
    name text,
    section text NOT NULL,
    "gradeId" integer NOT NULL,
    "schoolId" text NOT NULL
);


--
-- Name: class_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.class_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: class_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.class_id_seq OWNED BY public.class.id;


--
-- Name: Announcement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement" ALTER COLUMN id SET DEFAULT nextval('public."Announcement_id_seq"'::regclass);


--
-- Name: Assignment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment" ALTER COLUMN id SET DEFAULT nextval('public."Assignment_id_seq"'::regclass);


--
-- Name: AssignmentGradeSubject id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentGradeSubject" ALTER COLUMN id SET DEFAULT nextval('public."AssignmentGradeSubject_id_seq"'::regclass);


--
-- Name: AssignmentSubmission id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentSubmission" ALTER COLUMN id SET DEFAULT nextval('public."AssignmentSubmission_id_seq"'::regclass);


--
-- Name: Attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance" ALTER COLUMN id SET DEFAULT nextval('public."Attendance_id_seq"'::regclass);


--
-- Name: Branch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch" ALTER COLUMN id SET DEFAULT nextval('public."Branch_id_seq"'::regclass);


--
-- Name: Event id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event" ALTER COLUMN id SET DEFAULT nextval('public."Event_id_seq"'::regclass);


--
-- Name: Exam id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Exam" ALTER COLUMN id SET DEFAULT nextval('public."Exam_id_seq"'::regclass);


--
-- Name: ExamGradeSubject id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamGradeSubject" ALTER COLUMN id SET DEFAULT nextval('public."ExamGradeSubject_id_seq"'::regclass);


--
-- Name: FeePayment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeePayment" ALTER COLUMN id SET DEFAULT nextval('public."FeePayment_id_seq"'::regclass);


--
-- Name: FeeStructure id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeStructure" ALTER COLUMN id SET DEFAULT nextval('public."FeeStructure_id_seq"'::regclass);


--
-- Name: FeeTransaction id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeTransaction" ALTER COLUMN id SET DEFAULT nextval('public."FeeTransaction_id_seq"'::regclass);


--
-- Name: Grade id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Grade" ALTER COLUMN id SET DEFAULT nextval('public."Grade_id_seq"'::regclass);


--
-- Name: Homework id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Homework" ALTER COLUMN id SET DEFAULT nextval('public."Homework_id_seq"'::regclass);


--
-- Name: Lesson id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson" ALTER COLUMN id SET DEFAULT nextval('public."Lesson_id_seq"'::regclass);


--
-- Name: PermissionSlip id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PermissionSlip" ALTER COLUMN id SET DEFAULT nextval('public."PermissionSlip_id_seq"'::regclass);


--
-- Name: Result id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Result" ALTER COLUMN id SET DEFAULT nextval('public."Result_id_seq"'::regclass);


--
-- Name: SmsTemplate id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SmsTemplate" ALTER COLUMN id SET DEFAULT nextval('public."SmsTemplate_id_seq"'::regclass);


--
-- Name: StudentEnrollment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentEnrollment" ALTER COLUMN id SET DEFAULT nextval('public."StudentEnrollment_id_seq"'::regclass);


--
-- Name: StudentFees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentFees" ALTER COLUMN id SET DEFAULT nextval('public."StudentFees_id_seq"'::regclass);


--
-- Name: StudentTotalFees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentTotalFees" ALTER COLUMN id SET DEFAULT nextval('public."StudentTotalFees_id_seq"'::regclass);


--
-- Name: Subject id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject" ALTER COLUMN id SET DEFAULT nextval('public."Subject_id_seq"'::regclass);


--
-- Name: TeacherClassAssignment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeacherClassAssignment" ALTER COLUMN id SET DEFAULT nextval('public."TeacherClassAssignment_id_seq"'::regclass);


--
-- Name: class id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class ALTER COLUMN id SET DEFAULT nextval('public.class_id_seq'::regclass);


--
-- Data for Name: AcademicYear; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AcademicYear" (id, name, "startDate", "endDate", "isActive", "schoolId") FROM stdin;
1	2024-2025	2024-04-01 00:00:00	2025-03-28 00:00:00	t	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Admin" (id, username, password, name, "parentName", gender, email, phone, address, dob, img, "bloodType", "createdAt", clerk_id, "profileId", "linkedUserId", "schoolId") FROM stdin;
cmjf4q3i600026cjqnm2xzto4	admin001	tester0001	A HARIKIRAN	A SRINIVASARAO	Male	hari.myskoolcom@gmail.com	7801049830	17-309, Golla Veedhi, Old Gopalapatnam	1996-03-29 00:00:00	https://res.cloudinary.com/harikiran/image/upload/v1766285381/h4x8fjbq7hlfkvbv4vg9.jpg	O_POS	2026-03-02 18:02:19.339	user_34hDQUMuHoPtvaWMWsrnYaAYztu	cmjf4q3hm00006cjq2nnukul3	cmjf4q3hv00016cjqg8jf9op8	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Announcement" (id, title, description, date, "classId", "schoolId") FROM stdin;
\.


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Assignment" (id, title, description, "schoolId") FROM stdin;
\.


--
-- Data for Name: AssignmentGradeSubject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AssignmentGradeSubject" (id, "assignmentId", "gradeId", "classId", "subjectId", "dueDate", "maxMarks", "schoolId") FROM stdin;
\.


--
-- Data for Name: AssignmentSubmission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AssignmentSubmission" (id, "assignmentId", "studentId", marks, "submittedAt", remarks, "schoolId") FROM stdin;
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Attendance" (id, date, present, "studentId", "classId", "schoolId", "academicYearId") FROM stdin;
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Branch" (id, name, type, "order", "schoolId") FROM stdin;
1	Kindergarten	KINDERGARTEN	1	cmju1hey9000104l54r6cmpsu
3	Secondary	HIGHER	3	cmju1hey9000104l54r6cmpsu
2	Primary	PRIMARY	2	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: BulkUploadJob; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BulkUploadJob" (id, "schoolId", status, total, processed, created, updated, errors, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CancelledReceipt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CancelledReceipt" (id, "studentId", term, "originalReceiptNo", "cancelledDate", "cancelledBy", reason, "cancelledAmount", "cancelledDiscount", "cancelledFine", "cancelledTotal", "schoolId") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Event" (id, title, description, "startTime", "endTime", "classId", "schoolId") FROM stdin;
\.


--
-- Data for Name: Exam; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Exam" (id, title, "schoolId", "academicYearId") FROM stdin;
\.


--
-- Data for Name: ExamGradeSubject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ExamGradeSubject" (id, "examId", "gradeId", "subjectId", date, "startTime", "maxMarks", "schoolId", "academicYearId") FROM stdin;
\.


--
-- Data for Name: FeePayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeePayment" (id, amount, currency, "paymentDate", status, "transactionId", "orderId", "studentId", "schoolId", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FeeStructure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeeStructure" (id, "gradeId", "startDate", "dueDate", "termFees", "abacusFees", term, "academicYearId", "schoolId") FROM stdin;
\.


--
-- Data for Name: FeeTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeeTransaction" (id, "studentId", "studentFeesId", term, amount, "discountAmount", "fineAmount", "receiptDate", "receivedDate", "receiptNo", "paymentMode", "createdAt", "updatedAt", remarks, "academicYearId", "transactionType", "updatedByName", "deletedAt", "schoolId") FROM stdin;
\.


--
-- Data for Name: Grade; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Grade" (id, level, "schoolId", "branchId") FROM stdin;
1	PRE KG	cmju1hey9000104l54r6cmpsu	1
2	LKG	cmju1hey9000104l54r6cmpsu	1
3	UKG	cmju1hey9000104l54r6cmpsu	1
4	I	cmju1hey9000104l54r6cmpsu	2
5	II	cmju1hey9000104l54r6cmpsu	2
6	III	cmju1hey9000104l54r6cmpsu	2
7	IV	cmju1hey9000104l54r6cmpsu	2
8	V	cmju1hey9000104l54r6cmpsu	2
9	VI	cmju1hey9000104l54r6cmpsu	3
10	VII	cmju1hey9000104l54r6cmpsu	3
11	VIII	cmju1hey9000104l54r6cmpsu	3
12	IX	cmju1hey9000104l54r6cmpsu	3
13	X	cmju1hey9000104l54r6cmpsu	3
\.


--
-- Data for Name: Homework; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Homework" (id, "groupId", description, date, "classId", "gradeId", "schoolId") FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lesson" (id, title, day, "startTime", "endTime", period, "subjectId", "classId", "teacherId", "schoolId") FROM stdin;
\.


--
-- Data for Name: LinkedUser; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LinkedUser" (id, username, role, "profileId", "schoolId") FROM stdin;
cmjf4q3hv00016cjqg8jf9op8	admin001	admin	cmjf4q3hm00006cjq2nnukul3	cmju1hey9000104l54r6cmpsu
cmmaq6r180001nsjql6zyzrvs	s10001	student	cmmaq6r0y0000nsjq398ut4vk	cmju1hey9000104l54r6cmpsu
cmmar7k3r00016ojqbngjstfk	s10002	student	cmmar7k3k00006ojqyfiwgqhb	cmju1hey9000104l54r6cmpsu
cmmavky0i0001q4jq4h0yvrxj	s16666	student	cmjf4q3hm00006cjq2nnukul3	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Messages" (id, message, type, "studentId", date, "classId", "schoolId") FROM stdin;
\.


--
-- Data for Name: PermissionSlip; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PermissionSlip" (id, "studentId", "leaveType", "subReason", description, date, "timeIssued", "withWhom", relation, "schoolId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Profile" (id, clerk_id, phone, "activeUserId") FROM stdin;
cmmaq6r0y0000nsjq398ut4vk	user_39oyNnbeljKFHfJKp70sQdBomme	9390633797	cmmaq6r180001nsjql6zyzrvs
cmmar7k3k00006ojqyfiwgqhb	user_3ARMykNjUhOjaobw9Mg58ARExb1	8466863932	cmmar7k3r00016ojqbngjstfk
cmjf4q3hm00006cjq2nnukul3	user_34hDQUMuHoPtvaWMWsrnYaAYztu	7801049830	cmjf4q3hv00016cjqg8jf9op8
\.


--
-- Data for Name: Result; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Result" (id, marks, "studentId", "examId", "subjectId", "createdAt", "schoolId", "academicYearId") FROM stdin;
\.


--
-- Data for Name: SchoolInfo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolInfo" (id, "schoolId", name, address, phone, email, website, logo, "taxId", "receiptHeader", "receiptFooter", "createdAt", "updatedAt") FROM stdin;
cmju1hey9000104l54r6cmpsu	test	SCHOOL FOR TESTING	17-309, Golla Veedhi, Old Gopalapatnam	7801049830	schoolfortesting@gmail.com	https://www.schooldb.co.in/	\N	test001	(Affiliated to the Council for the I.S.C. Examination, New Delhi) Affiliation No. test/001 - Dt. 01-11-2024	Fees once paid are not refundable.	2026-03-02 18:02:01.054	2026-03-02 18:02:01.054
\.


--
-- Data for Name: SmsTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SmsTemplate" (id, type, content, "schoolId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Student" (id, username, name, "motherName", "fatherName", "penNo", "studentAadhar", "fatherAadhar", "motherAadhar", email, phone, address, img, "bloodType", gender, dob, "createdAt", status, clerk_id, "profileId", "linkedUserId", "schoolId", "leftAt", "leftReason", "admissionNo") FROM stdin;
10002	s10002	CH ASWINI	CH LAKSHMI	CH ERUKUNAIDU					harikiran.dev.schooldb@gmail.com	8466863932	17-309, GOLLA VEEDHI, OLD GOPALAPATNAM	\N	Under Investigation	Female	2008-08-15 00:00:00	2026-03-03 15:19:45.557	ACTIVE	user_3ARMykNjUhOjaobw9Mg58ARExb1	cmmar7k3k00006ojqyfiwgqhb	cmmar7k3r00016ojqbngjstfk	cmju1hey9000104l54r6cmpsu	\N	\N	10002
cmmavky1r0002q4jqf4affene	s16666	ADANGI HARI KIRAN	A SRIDEVI	A SRINIVASA RAO					harikiran.dev.schooldb@gmail.com	7801049830	17-309, GOLLA VEEDHI, OLD GOPALAPATNAM	\N	Under Investigation	Male	1996-03-29 00:00:00	2026-03-03 17:22:08.607	ACTIVE	user_34hDQUMuHoPtvaWMWsrnYaAYztu	cmjf4q3hm00006cjq2nnukul3	cmmavky0i0001q4jq4h0yvrxj	cmju1hey9000104l54r6cmpsu	\N	\N	16666
10001	s10001	A YASWANTH	A BHAVANI	A LAXMANA RAO	\N	\N	\N	\N	sliceeditor07@gmail.com	9390633796	17-309, GOLLA VEEDHI, OLD GOPALAPATNAM	\N	Under Investigation	Male	2008-06-15 00:00:00	2026-03-03 14:51:08.261	ACTIVE	user_39oyNnbeljKFHfJKp70sQdBomme	cmmaq6r0y0000nsjq398ut4vk	cmmaq6r180001nsjql6zyzrvs	cmju1hey9000104l54r6cmpsu	\N	\N	10001
\.


--
-- Data for Name: StudentEnrollment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentEnrollment" (id, "studentId", "classId", "academicYearId", status, "promotedFromId", "schoolId") FROM stdin;
2	10002	3	1	ACTIVE	\N	cmju1hey9000104l54r6cmpsu
3	cmmavky1r0002q4jqf4affene	3	1	ACTIVE	\N	cmju1hey9000104l54r6cmpsu
1	10001	3	1	ACTIVE	\N	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: StudentFees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentFees" (id, "studentId", "feeStructureId", "academicYearId", term, "paidAmount", "abacusPaidAmount", "discountAmount", "fineAmount", "receiptDate", "receivedDate", "paymentMode", "receiptNo", remarks, "updatedByName", "schoolId") FROM stdin;
\.


--
-- Data for Name: StudentTotalFees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentTotalFees" (id, "studentId", "schoolId", "totalPaidAmount", "totalDiscountAmount", "totalFineAmount", "totalAbacusAmount", "totalFeeAmount", "dueAmount", "academicYearId") FROM stdin;
1	10001	cmju1hey9000104l54r6cmpsu	0.00	0.00	0.00	0.00	0.00	0.00	1
2	10002	cmju1hey9000104l54r6cmpsu	0.00	0.00	0.00	0.00	0.00	0.00	1
3	cmmavky1r0002q4jqf4affene	cmju1hey9000104l54r6cmpsu	0.00	0.00	0.00	0.00	0.00	0.00	1
\.


--
-- Data for Name: Subject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subject" (id, name, "createdAt", "schoolId") FROM stdin;
1	BIOLOGY	2026-03-07 12:26:38.742	cmju1hey9000104l54r6cmpsu
2	CHEMISTRY	2026-03-07 12:26:38.764	cmju1hey9000104l54r6cmpsu
3	CLASS ACTIVITIES	2026-03-07 12:26:38.77	cmju1hey9000104l54r6cmpsu
4	COMPUTER	2026-03-07 12:26:38.778	cmju1hey9000104l54r6cmpsu
5	DRAWING	2026-03-07 12:26:38.785	cmju1hey9000104l54r6cmpsu
6	ENGLISH I	2026-03-07 12:26:38.789	cmju1hey9000104l54r6cmpsu
7	ENGLISH II	2026-03-07 12:26:38.793	cmju1hey9000104l54r6cmpsu
8	ENGLISH READING (ORAL)	2026-03-07 12:26:38.799	cmju1hey9000104l54r6cmpsu
9	ENGLISH (WRITTEN)	2026-03-07 12:26:38.806	cmju1hey9000104l54r6cmpsu
10	EVS	2026-03-07 12:26:38.812	cmju1hey9000104l54r6cmpsu
11	GENERAL KNOWLEDGE	2026-03-07 12:26:38.817	cmju1hey9000104l54r6cmpsu
12	GENERAL SCIENCE	2026-03-07 12:26:38.823	cmju1hey9000104l54r6cmpsu
13	GEOGRAPHY	2026-03-07 12:26:38.828	cmju1hey9000104l54r6cmpsu
14	HANDWRITING	2026-03-07 12:26:38.832	cmju1hey9000104l54r6cmpsu
15	HISTORY & CIVICS	2026-03-07 12:26:38.836	cmju1hey9000104l54r6cmpsu
16	II LANGUAGE (TELUGU/HINDI)	2026-03-07 12:26:38.842	cmju1hey9000104l54r6cmpsu
17	III LANGUAGE (TELUGU/HINDI)	2026-03-07 12:26:38.846	cmju1hey9000104l54r6cmpsu
18	MATHS	2026-03-07 12:26:38.849	cmju1hey9000104l54r6cmpsu
19	MORAL SCIENCE	2026-03-07 12:26:38.853	cmju1hey9000104l54r6cmpsu
20	NUMBER WORK (ORAL)	2026-03-07 12:26:38.857	cmju1hey9000104l54r6cmpsu
21	NUMBER WORK (WRITTEN)	2026-03-07 12:26:38.861	cmju1hey9000104l54r6cmpsu
22	PHYSICS	2026-03-07 12:26:38.866	cmju1hey9000104l54r6cmpsu
23	READING / RECITATION	2026-03-07 12:26:38.872	cmju1hey9000104l54r6cmpsu
24	RHYMES (ORAL)	2026-03-07 12:26:38.877	cmju1hey9000104l54r6cmpsu
25	SOCIAL STUDIES	2026-03-07 12:26:38.881	cmju1hey9000104l54r6cmpsu
26	SPELLINGS	2026-03-07 12:26:38.884	cmju1hey9000104l54r6cmpsu
27	TELUGU/HINDI (WRITTEN)	2026-03-07 12:26:38.888	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: SubjectTeacher; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SubjectTeacher" ("subjectId", "teacherId", "classId", "schoolId") FROM stdin;
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Teacher" (id, username, name, "parentName", email, phone, address, img, "bloodType", gender, dob, status, "createdAt", clerk_id, "profileId", "linkedUserId", "schoolId", "leftAt", "leftReason") FROM stdin;
staff_ks_063	staff_ks_063	TEACHER_084	\N	staff_ks_063@kss.com	9000000000	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_063	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_001	staff_ks_001	TEACHER_002	\N	staff_ks_001@kss.com	9000000001	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_001	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_002	staff_ks_002	TEACHER_003	\N	staff_ks_002@kss.com	9000000002	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_002	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_003	staff_ks_003	TEACHER_004	\N	staff_ks_003@kss.com	9000000003	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_003	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_004	staff_ks_004	TEACHER_005	\N	staff_ks_004@kss.com	9000000004	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_004	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_005	staff_ks_005	TEACHER_006	\N	staff_ks_005@kss.com	9000000005	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_005	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_007	staff_ks_007	TEACHER_007	\N	staff_ks_007@kss.com	9000000006	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_007	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_040	staff_ks_040	TEACHER_029	\N	staff_ks_040@kss.com	9000000028	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_040	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_041	staff_ks_041	TEACHER_030	\N	staff_ks_041@kss.com	9000000029	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_041	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_043	staff_ks_043	TEACHER_031	\N	staff_ks_043@kss.com	9000000030	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_043	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_044	staff_ks_044	TEACHER_032	\N	staff_ks_044@kss.com	9000000031	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_044	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_045	staff_ks_045	TEACHER_033	\N	staff_ks_045@kss.com	9000000032	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_045	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_046	staff_ks_046	TEACHER_034	\N	staff_ks_046@kss.com	9000000033	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_046	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_048	staff_ks_048	TEACHER_035	\N	staff_ks_048@kss.com	9000000034	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_048	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_047	staff_ks_047	TEACHER_057	\N	staff_ks_047@kss.com	9000000056	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_047	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_049	staff_ks_049	TEACHER_058	\N	staff_ks_049@kss.com	9000000057	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_049	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_051	staff_ks_051	TEACHER_059	\N	staff_ks_051@kss.com	9000000058	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_051	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_053	staff_ks_053	TEACHER_060	\N	staff_ks_053@kss.com	9000000059	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_053	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_058	staff_ks_058	TEACHER_061	\N	staff_ks_058@kss.com	9000000060	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_058	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_059	staff_ks_059	TEACHER_062	\N	staff_ks_059@kss.com	9000000061	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_059	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_060	staff_ks_060	TEACHER_063	\N	staff_ks_060@kss.com	9000000062	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_060	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_008	staff_ks_008	TEACHER_008	\N	staff_ks_008@kss.com	9000000007	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_008	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_009	staff_ks_009	TEACHER_009	\N	staff_ks_009@kss.com	9000000008	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_009	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_012	staff_ks_012	TEACHER_010	\N	staff_ks_012@kss.com	9000000009	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_012	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_015	staff_ks_015	TEACHER_011	\N	staff_ks_015@kss.com	9000000010	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_015	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_016	staff_ks_016	TEACHER_012	\N	staff_ks_016@kss.com	9000000011	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_016	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_017	staff_ks_017	TEACHER_013	\N	staff_ks_017@kss.com	9000000012	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_017	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_018	staff_ks_018	TEACHER_014	\N	staff_ks_018@kss.com	9000000013	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_018	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_019	staff_ks_019	TEACHER_015	\N	staff_ks_019@kss.com	9000000014	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_019	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_020	staff_ks_020	TEACHER_016	\N	staff_ks_020@kss.com	9000000015	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_020	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_022	staff_ks_022	TEACHER_017	\N	staff_ks_022@kss.com	9000000016	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_022	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_025	staff_ks_025	TEACHER_018	\N	staff_ks_025@kss.com	9000000017	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_025	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_028	staff_ks_028	TEACHER_019	\N	staff_ks_028@kss.com	9000000018	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_028	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_029	staff_ks_029	TEACHER_020	\N	staff_ks_029@kss.com	9000000019	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_029	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_030	staff_ks_030	TEACHER_021	\N	staff_ks_030@kss.com	9000000020	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_030	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_032	staff_ks_032	TEACHER_022	\N	staff_ks_032@kss.com	9000000021	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_032	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_033	staff_ks_033	TEACHER_023	\N	staff_ks_033@kss.com	9000000022	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_033	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_034	staff_ks_034	TEACHER_024	\N	staff_ks_034@kss.com	9000000023	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_034	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_036	staff_ks_036	TEACHER_025	\N	staff_ks_036@kss.com	9000000024	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_036	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_037	staff_ks_037	TEACHER_026	\N	staff_ks_037@kss.com	9000000025	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_037	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_038	staff_ks_038	TEACHER_027	\N	staff_ks_038@kss.com	9000000026	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_038	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_039	staff_ks_039	TEACHER_028	\N	staff_ks_039@kss.com	9000000027	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_039	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_050	staff_ks_050	TEACHER_036	\N	staff_ks_050@kss.com	9000000035	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_050	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_052	staff_ks_052	TEACHER_037	\N	staff_ks_052@kss.com	9000000036	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_052	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_054	staff_ks_054	TEACHER_038	\N	staff_ks_054@kss.com	9000000037	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_054	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_055	staff_ks_055	TEACHER_039	\N	staff_ks_055@kss.com	9000000038	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_055	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_056	staff_ks_056	TEACHER_040	\N	staff_ks_056@kss.com	9000000039	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_056	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_057	staff_ks_057	TEACHER_041	\N	staff_ks_057@kss.com	9000000040	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_057	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_061	staff_ks_061	TEACHER_042	\N	staff_ks_061@kss.com	9000000041	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_061	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_062	staff_ks_062	TEACHER_043	\N	staff_ks_062@kss.com	9000000042	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_062	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_006	staff_ks_006	TEACHER_044	\N	staff_ks_006@kss.com	9000000043	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_006	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_010	staff_ks_010	TEACHER_045	\N	staff_ks_010@kss.com	9000000044	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_010	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_011	staff_ks_011	TEACHER_046	\N	staff_ks_011@kss.com	9000000045	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_011	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_013	staff_ks_013	TEACHER_047	\N	staff_ks_013@kss.com	9000000046	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_013	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_014	staff_ks_014	TEACHER_048	\N	staff_ks_014@kss.com	9000000047	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_014	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_021	staff_ks_021	TEACHER_049	\N	staff_ks_021@kss.com	9000000048	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_021	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_023	staff_ks_023	TEACHER_050	\N	staff_ks_023@kss.com	9000000049	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_023	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_024	staff_ks_024	TEACHER_051	\N	staff_ks_024@kss.com	9000000050	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_024	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_026	staff_ks_026	TEACHER_052	\N	staff_ks_026@kss.com	9000000051	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_026	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_027	staff_ks_027	TEACHER_053	\N	staff_ks_027@kss.com	9000000052	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Female	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_027	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_031	staff_ks_031	TEACHER_054	\N	staff_ks_031@kss.com	9000000053	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_031	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_035	staff_ks_035	TEACHER_055	\N	staff_ks_035@kss.com	9000000054	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_035	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
staff_ks_042	staff_ks_042	TEACHER_056	\N	staff_ks_042@kss.com	9000000055	CHINNA WALTAIR, VISAKHAPATNAM	\N	Under Investigation	Male	1984-12-31 18:30:00	ACTIVE	2026-03-03 13:13:59.733	staff_ks_042	\N	\N	cmju1hey9000104l54r6cmpsu	\N	\N
\.


--
-- Data for Name: TeacherClassAssignment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeacherClassAssignment" (id, "teacherId", "classId", "academicYearId", "schoolId", role) FROM stdin;
1	staff_ks_001	3	1	cmju1hey9000104l54r6cmpsu	SUPERVISOR
2	staff_ks_002	5	1	cmju1hey9000104l54r6cmpsu	SUPERVISOR
\.


--
-- Data for Name: _SubjectGrades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_SubjectGrades" ("A", "B") FROM stdin;
9	1
10	1
11	1
12	1
13	1
9	2
10	2
11	2
12	2
13	2
1	3
4	4
5	4
6	4
7	4
8	4
9	4
10	4
11	4
12	4
13	4
2	5
3	5
4	5
5	5
6	5
7	5
8	5
9	5
10	5
11	5
4	6
5	6
6	6
7	6
8	6
9	6
10	6
11	6
12	6
13	6
4	7
5	7
6	7
7	7
8	7
9	7
10	7
11	7
12	7
13	7
2	8
3	8
2	9
3	9
2	10
3	10
4	10
5	10
4	11
5	11
6	11
7	11
8	11
9	11
10	11
11	11
12	11
6	12
7	12
8	12
9	13
10	13
11	13
12	13
13	13
2	14
3	14
4	14
5	14
9	15
10	15
11	15
12	15
13	15
3	16
4	16
5	16
6	16
7	16
8	16
9	16
10	16
11	16
12	16
13	16
6	17
7	17
8	17
9	17
10	17
4	18
5	18
6	18
7	18
8	18
9	18
10	18
11	18
12	18
13	18
4	19
5	19
6	19
7	19
8	19
9	19
10	19
11	19
12	19
2	20
3	20
2	21
3	21
9	22
10	22
11	22
12	22
13	22
4	23
5	23
2	24
3	24
6	25
7	25
8	25
2	26
3	26
4	26
5	26
3	27
4	27
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ed9a7291-70b6-44dc-8ad2-9096c5de4105	2d6660157acb83a55cff573ba19e0dae2f7295e44148780b0cc0b98362ab7270	2026-03-02 18:00:50.397055+05:30	20260301010310_init	\N	\N	2026-03-02 18:00:50.14368+05:30	1
2eca7477-7f9e-4550-ae15-37564f6b0a44	0f68d99f3bccce07056d83f7301756d5e21a1bee3949cc64de9aa9aa57635313	2026-03-02 18:00:50.441032+05:30	20260301015918_added_branch_model	\N	\N	2026-03-02 18:00:50.397573+05:30	1
aea95b32-711f-4fcf-8411-2b5cc1ffe6e8	babe7f265ede55e887801265669bf43df7312c52ef8916e05cfed655d2278752	2026-03-02 18:00:50.452994+05:30	20260301030805_added_new_migrations	\N	\N	2026-03-02 18:00:50.441347+05:30	1
6e4de451-b42c-41db-a37b-b2659e78780d	6f11ea0ad76d4ed4718e4d421447a90ef30e7bfd8b7126117f733d824b9c5001	2026-03-02 18:00:50.461946+05:30	20260301042734_added_new_model	\N	\N	2026-03-02 18:00:50.453416+05:30	1
b6bb2f45-0081-48e7-acb8-4e161f6d80d7	48ea41e8f5cd286af927088ccdb6f9a17d4ad7d8c1374a1dd243660a3c5c9663	2026-03-03 20:59:55.636522+05:30	20260303152955_add_admission_no	\N	\N	2026-03-03 20:59:55.59125+05:30	1
c0e10263-292a-40cb-be52-5805531e8fe1	7435f1e95feda9c21d81413eb2418490ac08c0d8edf0491be15c8a62791c2449	2026-03-05 19:13:02.484146+05:30	20260305134302_add_teacher_id	\N	\N	2026-03-05 19:13:02.475088+05:30	1
fa29882c-e55c-4191-87f3-dc3d8b440ce6	13ae43fa855c057748b68a420f604341170314b7b445d2efd7b838197bfb54a3	2026-03-05 21:51:28.049501+05:30	20260305162128_exam_academic_year_refactor	\N	\N	2026-03-05 21:51:28.025374+05:30	1
\.


--
-- Data for Name: class; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.class (id, name, section, "gradeId", "schoolId") FROM stdin;
3	LKG - A	A	2	cmju1hey9000104l54r6cmpsu
4	LKG - B	B	2	cmju1hey9000104l54r6cmpsu
5	UKG - A	A	3	cmju1hey9000104l54r6cmpsu
\.


--
-- Name: Announcement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Announcement_id_seq"', 1, false);


--
-- Name: AssignmentGradeSubject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AssignmentGradeSubject_id_seq"', 1, false);


--
-- Name: AssignmentSubmission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AssignmentSubmission_id_seq"', 1, false);


--
-- Name: Assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Assignment_id_seq"', 1, false);


--
-- Name: Attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Attendance_id_seq"', 1, false);


--
-- Name: Branch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Branch_id_seq"', 1, false);


--
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Event_id_seq"', 1, false);


--
-- Name: ExamGradeSubject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ExamGradeSubject_id_seq"', 1, false);


--
-- Name: Exam_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Exam_id_seq"', 1, false);


--
-- Name: FeePayment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."FeePayment_id_seq"', 1, false);


--
-- Name: FeeStructure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."FeeStructure_id_seq"', 1, false);


--
-- Name: FeeTransaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."FeeTransaction_id_seq"', 1, false);


--
-- Name: Grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Grade_id_seq"', 13, true);


--
-- Name: Homework_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Homework_id_seq"', 1, false);


--
-- Name: Lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Lesson_id_seq"', 1, false);


--
-- Name: PermissionSlip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PermissionSlip_id_seq"', 1, false);


--
-- Name: Result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Result_id_seq"', 1, false);


--
-- Name: SmsTemplate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."SmsTemplate_id_seq"', 1, false);


--
-- Name: StudentEnrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StudentEnrollment_id_seq"', 3, true);


--
-- Name: StudentFees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StudentFees_id_seq"', 1, false);


--
-- Name: StudentTotalFees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StudentTotalFees_id_seq"', 3, true);


--
-- Name: Subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Subject_id_seq"', 27, true);


--
-- Name: TeacherClassAssignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TeacherClassAssignment_id_seq"', 2, true);


--
-- Name: class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.class_id_seq', 5, true);


--
-- Name: AcademicYear AcademicYear_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AcademicYear"
    ADD CONSTRAINT "AcademicYear_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: AssignmentGradeSubject AssignmentGradeSubject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentGradeSubject"
    ADD CONSTRAINT "AssignmentGradeSubject_pkey" PRIMARY KEY (id);


--
-- Name: AssignmentSubmission AssignmentSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentSubmission"
    ADD CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY (id);


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: BulkUploadJob BulkUploadJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BulkUploadJob"
    ADD CONSTRAINT "BulkUploadJob_pkey" PRIMARY KEY (id);


--
-- Name: CancelledReceipt CancelledReceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CancelledReceipt"
    ADD CONSTRAINT "CancelledReceipt_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: ExamGradeSubject ExamGradeSubject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamGradeSubject"
    ADD CONSTRAINT "ExamGradeSubject_pkey" PRIMARY KEY (id);


--
-- Name: Exam Exam_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Exam"
    ADD CONSTRAINT "Exam_pkey" PRIMARY KEY (id);


--
-- Name: FeePayment FeePayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeePayment"
    ADD CONSTRAINT "FeePayment_pkey" PRIMARY KEY (id);


--
-- Name: FeeStructure FeeStructure_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeStructure"
    ADD CONSTRAINT "FeeStructure_pkey" PRIMARY KEY (id);


--
-- Name: FeeTransaction FeeTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeTransaction"
    ADD CONSTRAINT "FeeTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Grade Grade_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_pkey" PRIMARY KEY (id);


--
-- Name: Homework Homework_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: LinkedUser LinkedUser_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LinkedUser"
    ADD CONSTRAINT "LinkedUser_pkey" PRIMARY KEY (id);


--
-- Name: Messages Messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_pkey" PRIMARY KEY (id);


--
-- Name: PermissionSlip PermissionSlip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PermissionSlip"
    ADD CONSTRAINT "PermissionSlip_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: Result Result_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Result"
    ADD CONSTRAINT "Result_pkey" PRIMARY KEY (id);


--
-- Name: SchoolInfo SchoolInfo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolInfo"
    ADD CONSTRAINT "SchoolInfo_pkey" PRIMARY KEY (id);


--
-- Name: SmsTemplate SmsTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SmsTemplate"
    ADD CONSTRAINT "SmsTemplate_pkey" PRIMARY KEY (id);


--
-- Name: StudentEnrollment StudentEnrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentEnrollment"
    ADD CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY (id);


--
-- Name: StudentFees StudentFees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentFees"
    ADD CONSTRAINT "StudentFees_pkey" PRIMARY KEY (id);


--
-- Name: StudentTotalFees StudentTotalFees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentTotalFees"
    ADD CONSTRAINT "StudentTotalFees_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: SubjectTeacher SubjectTeacher_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectTeacher"
    ADD CONSTRAINT "SubjectTeacher_pkey" PRIMARY KEY ("subjectId", "teacherId", "classId", "schoolId");


--
-- Name: Subject Subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_pkey" PRIMARY KEY (id);


--
-- Name: TeacherClassAssignment TeacherClassAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeacherClassAssignment"
    ADD CONSTRAINT "TeacherClassAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Teacher Teacher_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_pkey" PRIMARY KEY (id);


--
-- Name: _SubjectGrades _SubjectGrades_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SubjectGrades"
    ADD CONSTRAINT "_SubjectGrades_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: class class_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT class_pkey PRIMARY KEY (id);


--
-- Name: AcademicYear_name_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AcademicYear_name_schoolId_key" ON public."AcademicYear" USING btree (name, "schoolId");


--
-- Name: AcademicYear_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AcademicYear_schoolId_idx" ON public."AcademicYear" USING btree ("schoolId");


--
-- Name: Admin_clerk_id_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_clerk_id_schoolId_key" ON public."Admin" USING btree (clerk_id, "schoolId");


--
-- Name: Admin_email_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_email_schoolId_key" ON public."Admin" USING btree (email, "schoolId");


--
-- Name: Admin_id_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_id_schoolId_key" ON public."Admin" USING btree (id, "schoolId");


--
-- Name: Admin_linkedUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_linkedUserId_key" ON public."Admin" USING btree ("linkedUserId");


--
-- Name: Admin_phone_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_phone_schoolId_key" ON public."Admin" USING btree (phone, "schoolId");


--
-- Name: Admin_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Admin_schoolId_idx" ON public."Admin" USING btree ("schoolId");


--
-- Name: Admin_username_email_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Admin_username_email_phone_idx" ON public."Admin" USING btree (username, email, phone);


--
-- Name: Admin_username_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_username_schoolId_key" ON public."Admin" USING btree (username, "schoolId");


--
-- Name: Announcement_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Announcement_classId_idx" ON public."Announcement" USING btree ("classId");


--
-- Name: Announcement_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Announcement_schoolId_idx" ON public."Announcement" USING btree ("schoolId");


--
-- Name: AssignmentGradeSubject_assignmentId_gradeId_classId_subject_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AssignmentGradeSubject_assignmentId_gradeId_classId_subject_key" ON public."AssignmentGradeSubject" USING btree ("assignmentId", "gradeId", "classId", "subjectId", "schoolId");


--
-- Name: AssignmentGradeSubject_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AssignmentGradeSubject_schoolId_idx" ON public."AssignmentGradeSubject" USING btree ("schoolId");


--
-- Name: AssignmentSubmission_assignmentId_studentId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_schoolId_key" ON public."AssignmentSubmission" USING btree ("assignmentId", "studentId", "schoolId");


--
-- Name: AssignmentSubmission_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AssignmentSubmission_schoolId_idx" ON public."AssignmentSubmission" USING btree ("schoolId");


--
-- Name: Assignment_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Assignment_schoolId_idx" ON public."Assignment" USING btree ("schoolId");


--
-- Name: Assignment_title_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Assignment_title_schoolId_key" ON public."Assignment" USING btree (title, "schoolId");


--
-- Name: Attendance_academicYearId_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_academicYearId_studentId_idx" ON public."Attendance" USING btree ("academicYearId", "studentId");


--
-- Name: Attendance_classId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_classId_date_idx" ON public."Attendance" USING btree ("classId", date);


--
-- Name: Attendance_schoolId_classId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_schoolId_classId_date_idx" ON public."Attendance" USING btree ("schoolId", "classId", date);


--
-- Name: Attendance_schoolId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_schoolId_date_idx" ON public."Attendance" USING btree ("schoolId", date);


--
-- Name: Attendance_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_schoolId_idx" ON public."Attendance" USING btree ("schoolId");


--
-- Name: Attendance_studentId_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_studentId_classId_idx" ON public."Attendance" USING btree ("studentId", "classId");


--
-- Name: Attendance_studentId_date_academicYearId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Attendance_studentId_date_academicYearId_schoolId_key" ON public."Attendance" USING btree ("studentId", date, "academicYearId", "schoolId");


--
-- Name: Branch_name_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Branch_name_schoolId_key" ON public."Branch" USING btree (name, "schoolId");


--
-- Name: Branch_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Branch_schoolId_idx" ON public."Branch" USING btree ("schoolId");


--
-- Name: BulkUploadJob_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BulkUploadJob_schoolId_idx" ON public."BulkUploadJob" USING btree ("schoolId");


--
-- Name: CancelledReceipt_originalReceiptNo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CancelledReceipt_originalReceiptNo_idx" ON public."CancelledReceipt" USING btree ("originalReceiptNo");


--
-- Name: CancelledReceipt_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CancelledReceipt_schoolId_idx" ON public."CancelledReceipt" USING btree ("schoolId");


--
-- Name: CancelledReceipt_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CancelledReceipt_studentId_idx" ON public."CancelledReceipt" USING btree ("studentId");


--
-- Name: CancelledReceipt_term_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CancelledReceipt_term_idx" ON public."CancelledReceipt" USING btree (term);


--
-- Name: Class_gradeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Class_gradeId_idx" ON public.class USING btree ("gradeId");


--
-- Name: Class_gradeId_section_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Class_gradeId_section_key" ON public.class USING btree ("gradeId", section, "schoolId");


--
-- Name: Event_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_classId_idx" ON public."Event" USING btree ("classId");


--
-- Name: Event_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_schoolId_idx" ON public."Event" USING btree ("schoolId");


--
-- Name: ExamGradeSubject_examId_gradeId_subjectId_academicYearId_sc_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ExamGradeSubject_examId_gradeId_subjectId_academicYearId_sc_key" ON public."ExamGradeSubject" USING btree ("examId", "gradeId", "subjectId", "academicYearId", "schoolId");


--
-- Name: ExamGradeSubject_examId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamGradeSubject_examId_idx" ON public."ExamGradeSubject" USING btree ("examId");


--
-- Name: ExamGradeSubject_gradeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamGradeSubject_gradeId_idx" ON public."ExamGradeSubject" USING btree ("gradeId");


--
-- Name: ExamGradeSubject_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamGradeSubject_schoolId_idx" ON public."ExamGradeSubject" USING btree ("schoolId");


--
-- Name: ExamGradeSubject_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExamGradeSubject_subjectId_idx" ON public."ExamGradeSubject" USING btree ("subjectId");


--
-- Name: Exam_academicYearId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Exam_academicYearId_idx" ON public."Exam" USING btree ("academicYearId");


--
-- Name: Exam_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Exam_schoolId_idx" ON public."Exam" USING btree ("schoolId");


--
-- Name: Exam_title_academicYearId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Exam_title_academicYearId_schoolId_key" ON public."Exam" USING btree (title, "academicYearId", "schoolId");


--
-- Name: FeePayment_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FeePayment_orderId_key" ON public."FeePayment" USING btree ("orderId");


--
-- Name: FeePayment_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeePayment_schoolId_idx" ON public."FeePayment" USING btree ("schoolId");


--
-- Name: FeePayment_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeePayment_studentId_idx" ON public."FeePayment" USING btree ("studentId");


--
-- Name: FeePayment_transactionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FeePayment_transactionId_key" ON public."FeePayment" USING btree ("transactionId");


--
-- Name: FeeStructure_gradeId_term_academicYearId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FeeStructure_gradeId_term_academicYearId_schoolId_key" ON public."FeeStructure" USING btree ("gradeId", term, "academicYearId", "schoolId");


--
-- Name: FeeStructure_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeStructure_schoolId_idx" ON public."FeeStructure" USING btree ("schoolId");


--
-- Name: FeeTransaction_academicYearId_receiptDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_academicYearId_receiptDate_idx" ON public."FeeTransaction" USING btree ("academicYearId", "receiptDate");


--
-- Name: FeeTransaction_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_schoolId_idx" ON public."FeeTransaction" USING btree ("schoolId");


--
-- Name: FeeTransaction_schoolId_receiptDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_schoolId_receiptDate_idx" ON public."FeeTransaction" USING btree ("schoolId", "receiptDate");


--
-- Name: FeeTransaction_studentId_academicYearId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_studentId_academicYearId_idx" ON public."FeeTransaction" USING btree ("studentId", "academicYearId");


--
-- Name: Grade_branchId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Grade_branchId_idx" ON public."Grade" USING btree ("branchId");


--
-- Name: Grade_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Grade_level_idx" ON public."Grade" USING btree (level);


--
-- Name: Grade_level_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Grade_level_schoolId_key" ON public."Grade" USING btree (level, "schoolId");


--
-- Name: Grade_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Grade_schoolId_idx" ON public."Grade" USING btree ("schoolId");


--
-- Name: Homework_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Homework_classId_idx" ON public."Homework" USING btree ("classId");


--
-- Name: Homework_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Homework_date_idx" ON public."Homework" USING btree (date);


--
-- Name: Homework_gradeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Homework_gradeId_idx" ON public."Homework" USING btree ("gradeId");


--
-- Name: Homework_groupId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Homework_groupId_idx" ON public."Homework" USING btree ("groupId");


--
-- Name: Homework_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Homework_schoolId_idx" ON public."Homework" USING btree ("schoolId");


--
-- Name: Lesson_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lesson_classId_idx" ON public."Lesson" USING btree ("classId");


--
-- Name: Lesson_day_period_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lesson_day_period_idx" ON public."Lesson" USING btree (day, period);


--
-- Name: Lesson_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lesson_schoolId_idx" ON public."Lesson" USING btree ("schoolId");


--
-- Name: Lesson_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lesson_subjectId_idx" ON public."Lesson" USING btree ("subjectId");


--
-- Name: Lesson_teacherId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lesson_teacherId_idx" ON public."Lesson" USING btree ("teacherId");


--
-- Name: LinkedUser_profileId_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LinkedUser_profileId_schoolId_idx" ON public."LinkedUser" USING btree ("profileId", "schoolId");


--
-- Name: LinkedUser_username_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LinkedUser_username_schoolId_key" ON public."LinkedUser" USING btree (username, "schoolId");


--
-- Name: Messages_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Messages_schoolId_idx" ON public."Messages" USING btree ("schoolId");


--
-- Name: PermissionSlip_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PermissionSlip_schoolId_idx" ON public."PermissionSlip" USING btree ("schoolId");


--
-- Name: Profile_activeUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Profile_activeUserId_key" ON public."Profile" USING btree ("activeUserId");


--
-- Name: Profile_clerk_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Profile_clerk_id_idx" ON public."Profile" USING btree (clerk_id);


--
-- Name: Profile_clerk_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Profile_clerk_id_key" ON public."Profile" USING btree (clerk_id);


--
-- Name: Profile_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Profile_phone_idx" ON public."Profile" USING btree (phone);


--
-- Name: Result_academicYearId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Result_academicYearId_idx" ON public."Result" USING btree ("academicYearId");


--
-- Name: Result_examId_schoolId_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Result_examId_schoolId_studentId_idx" ON public."Result" USING btree ("examId", "schoolId", "studentId");


--
-- Name: Result_studentId_examId_subjectId_academicYearId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Result_studentId_examId_subjectId_academicYearId_schoolId_key" ON public."Result" USING btree ("studentId", "examId", "subjectId", "academicYearId", "schoolId");


--
-- Name: SchoolInfo_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolInfo_schoolId_key" ON public."SchoolInfo" USING btree ("schoolId");


--
-- Name: SmsTemplate_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SmsTemplate_schoolId_idx" ON public."SmsTemplate" USING btree ("schoolId");


--
-- Name: SmsTemplate_type_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SmsTemplate_type_schoolId_key" ON public."SmsTemplate" USING btree (type, "schoolId");


--
-- Name: StudentEnrollment_academicYearId_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentEnrollment_academicYearId_classId_idx" ON public."StudentEnrollment" USING btree ("academicYearId", "classId");


--
-- Name: StudentEnrollment_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentEnrollment_schoolId_idx" ON public."StudentEnrollment" USING btree ("schoolId");


--
-- Name: StudentEnrollment_studentId_academicYearId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYearId_schoolId_key" ON public."StudentEnrollment" USING btree ("studentId", "academicYearId", "schoolId");


--
-- Name: StudentFees_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentFees_schoolId_idx" ON public."StudentFees" USING btree ("schoolId");


--
-- Name: StudentFees_studentId_academicYearId_term_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StudentFees_studentId_academicYearId_term_schoolId_key" ON public."StudentFees" USING btree ("studentId", "academicYearId", term, "schoolId");


--
-- Name: StudentTotalFees_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentTotalFees_schoolId_idx" ON public."StudentTotalFees" USING btree ("schoolId");


--
-- Name: StudentTotalFees_studentId_academicYearId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StudentTotalFees_studentId_academicYearId_schoolId_key" ON public."StudentTotalFees" USING btree ("studentId", "academicYearId", "schoolId");


--
-- Name: Student_admissionNo_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Student_admissionNo_schoolId_key" ON public."Student" USING btree ("admissionNo", "schoolId");


--
-- Name: Student_gender_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_gender_status_idx" ON public."Student" USING btree (gender, status);


--
-- Name: Student_linkedUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Student_linkedUserId_key" ON public."Student" USING btree ("linkedUserId");


--
-- Name: Student_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_schoolId_idx" ON public."Student" USING btree ("schoolId");


--
-- Name: Student_username_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Student_username_schoolId_key" ON public."Student" USING btree (username, "schoolId");


--
-- Name: SubjectTeacher_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SubjectTeacher_schoolId_idx" ON public."SubjectTeacher" USING btree ("schoolId");


--
-- Name: Subject_name_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Subject_name_schoolId_key" ON public."Subject" USING btree (name, "schoolId");


--
-- Name: Subject_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Subject_schoolId_idx" ON public."Subject" USING btree ("schoolId");


--
-- Name: TeacherClassAssignment_classId_academicYearId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeacherClassAssignment_classId_academicYearId_idx" ON public."TeacherClassAssignment" USING btree ("classId", "academicYearId");


--
-- Name: TeacherClassAssignment_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TeacherClassAssignment_schoolId_idx" ON public."TeacherClassAssignment" USING btree ("schoolId");


--
-- Name: TeacherClassAssignment_teacherId_classId_academicYearId_sch_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TeacherClassAssignment_teacherId_classId_academicYearId_sch_key" ON public."TeacherClassAssignment" USING btree ("teacherId", "classId", "academicYearId", "schoolId");


--
-- Name: Teacher_clerk_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Teacher_clerk_id_idx" ON public."Teacher" USING btree (clerk_id);


--
-- Name: Teacher_clerk_id_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Teacher_clerk_id_schoolId_key" ON public."Teacher" USING btree (clerk_id, "schoolId");


--
-- Name: Teacher_linkedUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Teacher_linkedUserId_key" ON public."Teacher" USING btree ("linkedUserId");


--
-- Name: Teacher_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Teacher_name_idx" ON public."Teacher" USING btree (name);


--
-- Name: Teacher_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Teacher_phone_idx" ON public."Teacher" USING btree (phone);


--
-- Name: Teacher_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Teacher_schoolId_idx" ON public."Teacher" USING btree ("schoolId");


--
-- Name: Teacher_username_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Teacher_username_schoolId_key" ON public."Teacher" USING btree (username, "schoolId");


--
-- Name: _SubjectGrades_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_SubjectGrades_B_index" ON public."_SubjectGrades" USING btree ("B");


--
-- Name: class_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "class_schoolId_idx" ON public.class USING btree ("schoolId");


--
-- Name: AcademicYear AcademicYear_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AcademicYear"
    ADD CONSTRAINT "AcademicYear_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Admin Admin_linkedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES public."LinkedUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Admin Admin_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Admin Admin_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Announcement Announcement_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentGradeSubject AssignmentGradeSubject_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentGradeSubject"
    ADD CONSTRAINT "AssignmentGradeSubject_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentGradeSubject AssignmentGradeSubject_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentGradeSubject"
    ADD CONSTRAINT "AssignmentGradeSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentGradeSubject AssignmentGradeSubject_gradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentGradeSubject"
    ADD CONSTRAINT "AssignmentGradeSubject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentGradeSubject AssignmentGradeSubject_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentGradeSubject"
    ADD CONSTRAINT "AssignmentGradeSubject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentGradeSubject AssignmentGradeSubject_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentGradeSubject"
    ADD CONSTRAINT "AssignmentGradeSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentSubmission AssignmentSubmission_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentSubmission"
    ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentSubmission AssignmentSubmission_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentSubmission"
    ADD CONSTRAINT "AssignmentSubmission_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AssignmentSubmission AssignmentSubmission_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssignmentSubmission"
    ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Assignment Assignment_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attendance Attendance_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Branch Branch_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BulkUploadJob BulkUploadJob_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BulkUploadJob"
    ADD CONSTRAINT "BulkUploadJob_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CancelledReceipt CancelledReceipt_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CancelledReceipt"
    ADD CONSTRAINT "CancelledReceipt_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CancelledReceipt CancelledReceipt_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CancelledReceipt"
    ADD CONSTRAINT "CancelledReceipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Event Event_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExamGradeSubject ExamGradeSubject_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamGradeSubject"
    ADD CONSTRAINT "ExamGradeSubject_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExamGradeSubject ExamGradeSubject_examId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamGradeSubject"
    ADD CONSTRAINT "ExamGradeSubject_examId_fkey" FOREIGN KEY ("examId") REFERENCES public."Exam"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExamGradeSubject ExamGradeSubject_gradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamGradeSubject"
    ADD CONSTRAINT "ExamGradeSubject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExamGradeSubject ExamGradeSubject_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamGradeSubject"
    ADD CONSTRAINT "ExamGradeSubject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExamGradeSubject ExamGradeSubject_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExamGradeSubject"
    ADD CONSTRAINT "ExamGradeSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Exam Exam_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Exam"
    ADD CONSTRAINT "Exam_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Exam Exam_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Exam"
    ADD CONSTRAINT "Exam_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FeePayment FeePayment_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeePayment"
    ADD CONSTRAINT "FeePayment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FeePayment FeePayment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeePayment"
    ADD CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeeStructure FeeStructure_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeStructure"
    ADD CONSTRAINT "FeeStructure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeeStructure FeeStructure_gradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeStructure"
    ADD CONSTRAINT "FeeStructure_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeeStructure FeeStructure_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeStructure"
    ADD CONSTRAINT "FeeStructure_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FeeTransaction FeeTransaction_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeTransaction"
    ADD CONSTRAINT "FeeTransaction_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FeeTransaction FeeTransaction_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeTransaction"
    ADD CONSTRAINT "FeeTransaction_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FeeTransaction FeeTransaction_studentFeesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeTransaction"
    ADD CONSTRAINT "FeeTransaction_studentFeesId_fkey" FOREIGN KEY ("studentFeesId") REFERENCES public."StudentFees"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FeeTransaction FeeTransaction_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeeTransaction"
    ADD CONSTRAINT "FeeTransaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Grade Grade_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grade Grade_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Homework Homework_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Homework Homework_gradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Homework Homework_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LinkedUser LinkedUser_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LinkedUser"
    ADD CONSTRAINT "LinkedUser_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LinkedUser LinkedUser_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LinkedUser"
    ADD CONSTRAINT "LinkedUser_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Messages Messages_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Messages Messages_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "Messages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PermissionSlip PermissionSlip_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PermissionSlip"
    ADD CONSTRAINT "PermissionSlip_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PermissionSlip PermissionSlip_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PermissionSlip"
    ADD CONSTRAINT "PermissionSlip_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Profile Profile_activeUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_activeUserId_fkey" FOREIGN KEY ("activeUserId") REFERENCES public."LinkedUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Result Result_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Result"
    ADD CONSTRAINT "Result_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Result Result_examId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Result"
    ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES public."Exam"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Result Result_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Result"
    ADD CONSTRAINT "Result_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Result Result_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Result"
    ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Result Result_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Result"
    ADD CONSTRAINT "Result_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SmsTemplate SmsTemplate_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SmsTemplate"
    ADD CONSTRAINT "SmsTemplate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentEnrollment StudentEnrollment_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentEnrollment"
    ADD CONSTRAINT "StudentEnrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentEnrollment StudentEnrollment_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentEnrollment"
    ADD CONSTRAINT "StudentEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentEnrollment StudentEnrollment_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentEnrollment"
    ADD CONSTRAINT "StudentEnrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentEnrollment StudentEnrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentEnrollment"
    ADD CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentFees StudentFees_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentFees"
    ADD CONSTRAINT "StudentFees_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentFees StudentFees_feeStructureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentFees"
    ADD CONSTRAINT "StudentFees_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES public."FeeStructure"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentFees StudentFees_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentFees"
    ADD CONSTRAINT "StudentFees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentFees StudentFees_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentFees"
    ADD CONSTRAINT "StudentFees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentTotalFees StudentTotalFees_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentTotalFees"
    ADD CONSTRAINT "StudentTotalFees_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentTotalFees StudentTotalFees_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentTotalFees"
    ADD CONSTRAINT "StudentTotalFees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentTotalFees StudentTotalFees_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudentTotalFees"
    ADD CONSTRAINT "StudentTotalFees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_linkedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES public."LinkedUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Student Student_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubjectTeacher SubjectTeacher_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectTeacher"
    ADD CONSTRAINT "SubjectTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SubjectTeacher SubjectTeacher_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectTeacher"
    ADD CONSTRAINT "SubjectTeacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubjectTeacher SubjectTeacher_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectTeacher"
    ADD CONSTRAINT "SubjectTeacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SubjectTeacher SubjectTeacher_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubjectTeacher"
    ADD CONSTRAINT "SubjectTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subject Subject_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherClassAssignment TeacherClassAssignment_academicYearId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeacherClassAssignment"
    ADD CONSTRAINT "TeacherClassAssignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES public."AcademicYear"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeacherClassAssignment TeacherClassAssignment_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeacherClassAssignment"
    ADD CONSTRAINT "TeacherClassAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherClassAssignment TeacherClassAssignment_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeacherClassAssignment"
    ADD CONSTRAINT "TeacherClassAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherClassAssignment TeacherClassAssignment_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeacherClassAssignment"
    ADD CONSTRAINT "TeacherClassAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Teacher Teacher_linkedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES public."LinkedUser"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Teacher Teacher_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Teacher Teacher_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _SubjectGrades _SubjectGrades_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SubjectGrades"
    ADD CONSTRAINT "_SubjectGrades_A_fkey" FOREIGN KEY ("A") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _SubjectGrades _SubjectGrades_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SubjectGrades"
    ADD CONSTRAINT "_SubjectGrades_B_fkey" FOREIGN KEY ("B") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: class class_gradeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT "class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES public."Grade"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: class class_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT "class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."SchoolInfo"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BeoVyOscxauNSBnao1CY4xy1qb3RtPqShGzSRXRQCfVYTOyfNEZP9d7I1kICiPO

