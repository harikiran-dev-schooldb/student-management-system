--
-- PostgreSQL database dump
--

\restrict dRfgK0Qy6jZzkt0oLHeIMhDRARxcuMcJtjqc93gdLDJcjww0qIyvEC8eSe7vdK0

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

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

ALTER TABLE IF EXISTS ONLY public.class DROP CONSTRAINT IF EXISTS "class_supervisorId_fkey";
ALTER TABLE IF EXISTS ONLY public.class DROP CONSTRAINT IF EXISTS "class_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public.class DROP CONSTRAINT IF EXISTS "class_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."_SubjectGrades" DROP CONSTRAINT IF EXISTS "_SubjectGrades_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_SubjectGrades" DROP CONSTRAINT IF EXISTS "_SubjectGrades_A_fkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_linkedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Subject" DROP CONSTRAINT IF EXISTS "Subject_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_linkedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentTotalFees" DROP CONSTRAINT IF EXISTS "StudentTotalFees_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentTotalFees" DROP CONSTRAINT IF EXISTS "StudentTotalFees_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_feeStructureId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Result" DROP CONSTRAINT IF EXISTS "Result_examId_fkey";
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
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_studentFeesId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeTransaction" DROP CONSTRAINT IF EXISTS "FeeTransaction_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeStructure" DROP CONSTRAINT IF EXISTS "FeeStructure_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeeStructure" DROP CONSTRAINT IF EXISTS "FeeStructure_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeePayment" DROP CONSTRAINT IF EXISTS "FeePayment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."FeePayment" DROP CONSTRAINT IF EXISTS "FeePayment_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_gradeId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamGradeSubject" DROP CONSTRAINT IF EXISTS "ExamGradeSubject_examId_fkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."CancelledReceipt" DROP CONSTRAINT IF EXISTS "CancelledReceipt_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."CancelledReceipt" DROP CONSTRAINT IF EXISTS "CancelledReceipt_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."BulkUploadJob" DROP CONSTRAINT IF EXISTS "BulkUploadJob_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_linkedUserId_fkey";
DROP INDEX IF EXISTS public."class_supervisorId_key";
DROP INDEX IF EXISTS public."class_schoolId_idx";
DROP INDEX IF EXISTS public."_SubjectGrades_B_index";
DROP INDEX IF EXISTS public."Teacher_username_schoolId_key";
DROP INDEX IF EXISTS public."Teacher_schoolId_idx";
DROP INDEX IF EXISTS public."Teacher_phone_idx";
DROP INDEX IF EXISTS public."Teacher_name_idx";
DROP INDEX IF EXISTS public."Teacher_linkedUserId_key";
DROP INDEX IF EXISTS public."Teacher_clerk_id_schoolId_key";
DROP INDEX IF EXISTS public."Teacher_clerk_id_idx";
DROP INDEX IF EXISTS public."Teacher_classId_schoolId_key";
DROP INDEX IF EXISTS public."Subject_schoolId_idx";
DROP INDEX IF EXISTS public."Subject_name_schoolId_key";
DROP INDEX IF EXISTS public."SubjectTeacher_schoolId_idx";
DROP INDEX IF EXISTS public."Student_username_schoolId_key";
DROP INDEX IF EXISTS public."Student_schoolId_idx";
DROP INDEX IF EXISTS public."Student_linkedUserId_key";
DROP INDEX IF EXISTS public."Student_classId_gender_status_idx";
DROP INDEX IF EXISTS public."Student_academicYear_classId_gender_status_idx";
DROP INDEX IF EXISTS public."StudentTotalFees_studentId_schoolId_key";
DROP INDEX IF EXISTS public."StudentTotalFees_schoolId_idx";
DROP INDEX IF EXISTS public."StudentFees_studentId_academicYear_term_schoolId_key";
DROP INDEX IF EXISTS public."StudentFees_schoolId_idx";
DROP INDEX IF EXISTS public."StudentEnrollment_studentId_academicYear_schoolId_key";
DROP INDEX IF EXISTS public."StudentEnrollment_schoolId_idx";
DROP INDEX IF EXISTS public."StudentEnrollment_academicYear_classId_idx";
DROP INDEX IF EXISTS public."SchoolInfo_schoolId_key";
DROP INDEX IF EXISTS public."Result_studentId_examId_subjectId_schoolId_key";
DROP INDEX IF EXISTS public."Result_schoolId_idx";
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
DROP INDEX IF EXISTS public."FeeTransaction_studentId_academicYear_idx";
DROP INDEX IF EXISTS public."FeeTransaction_schoolId_receiptDate_idx";
DROP INDEX IF EXISTS public."FeeTransaction_schoolId_idx";
DROP INDEX IF EXISTS public."FeeTransaction_academicYear_receiptDate_idx";
DROP INDEX IF EXISTS public."FeeStructure_schoolId_idx";
DROP INDEX IF EXISTS public."FeeStructure_gradeId_term_academicYear_schoolId_key";
DROP INDEX IF EXISTS public."FeePayment_transactionId_key";
DROP INDEX IF EXISTS public."FeePayment_studentId_idx";
DROP INDEX IF EXISTS public."FeePayment_schoolId_idx";
DROP INDEX IF EXISTS public."FeePayment_orderId_key";
DROP INDEX IF EXISTS public."Exam_title_schoolId_key";
DROP INDEX IF EXISTS public."Exam_schoolId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_schoolId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_gradeId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_examId_idx";
DROP INDEX IF EXISTS public."ExamGradeSubject_examId_gradeId_subjectId_schoolId_key";
DROP INDEX IF EXISTS public."Event_schoolId_idx";
DROP INDEX IF EXISTS public."Event_classId_idx";
DROP INDEX IF EXISTS public."Class_supervisorId_idx";
DROP INDEX IF EXISTS public."Class_gradeId_section_key";
DROP INDEX IF EXISTS public."Class_gradeId_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_term_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_studentId_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_schoolId_idx";
DROP INDEX IF EXISTS public."CancelledReceipt_originalReceiptNo_idx";
DROP INDEX IF EXISTS public."BulkUploadJob_schoolId_idx";
DROP INDEX IF EXISTS public."Attendance_studentId_date_schoolId_key";
DROP INDEX IF EXISTS public."Attendance_studentId_classId_idx";
DROP INDEX IF EXISTS public."Attendance_schoolId_idx";
DROP INDEX IF EXISTS public."Attendance_schoolId_date_idx";
DROP INDEX IF EXISTS public."Attendance_classId_date_idx";
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
ALTER TABLE IF EXISTS ONLY public.class DROP CONSTRAINT IF EXISTS class_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."_SubjectGrades" DROP CONSTRAINT IF EXISTS "_SubjectGrades_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."Teacher" DROP CONSTRAINT IF EXISTS "Teacher_pkey";
ALTER TABLE IF EXISTS ONLY public."Subject" DROP CONSTRAINT IF EXISTS "Subject_pkey";
ALTER TABLE IF EXISTS ONLY public."SubjectTeacher" DROP CONSTRAINT IF EXISTS "SubjectTeacher_pkey";
ALTER TABLE IF EXISTS ONLY public."Student" DROP CONSTRAINT IF EXISTS "Student_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentTotalFees" DROP CONSTRAINT IF EXISTS "StudentTotalFees_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentFees" DROP CONSTRAINT IF EXISTS "StudentFees_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentEnrollment" DROP CONSTRAINT IF EXISTS "StudentEnrollment_pkey";
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
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_pkey";
ALTER TABLE IF EXISTS ONLY public."Announcement" DROP CONSTRAINT IF EXISTS "Announcement_pkey";
ALTER TABLE IF EXISTS ONLY public."Admin" DROP CONSTRAINT IF EXISTS "Admin_pkey";
ALTER TABLE IF EXISTS public.class ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Subject" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."StudentTotalFees" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."StudentFees" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."StudentEnrollment" ALTER COLUMN id DROP DEFAULT;
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
ALTER TABLE IF EXISTS public."Attendance" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Announcement" ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.class_id_seq;
DROP TABLE IF EXISTS public.class;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."_SubjectGrades";
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
DROP SEQUENCE IF EXISTS public."Attendance_id_seq";
DROP TABLE IF EXISTS public."Attendance";
DROP SEQUENCE IF EXISTS public."Announcement_id_seq";
DROP TABLE IF EXISTS public."Announcement";
DROP TABLE IF EXISTS public."Admin";
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
DROP TYPE IF EXISTS public."BloodType";
DROP TYPE IF EXISTS public."AcademicYear";
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
-- Name: AcademicYear; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AcademicYear" AS ENUM (
    'Y2024_2025',
    'Y2025_2026'
);


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
    'O_NEG'
);


--
-- Name: EnrollmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EnrollmentStatus" AS ENUM (
    'ACTIVE',
    'PROMOTED',
    'REPEATED',
    'TRANSFERRED'
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
    'EVENT'
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
    'SUSPENDED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: Attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attendance" (
    id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    present boolean DEFAULT true NOT NULL,
    "studentId" text NOT NULL,
    "classId" integer NOT NULL,
    "schoolId" text NOT NULL
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
    "cancelledAmount" numeric(65,30) DEFAULT 0 NOT NULL,
    "cancelledDiscount" numeric(65,30) DEFAULT 0 NOT NULL,
    "cancelledFine" numeric(65,30) DEFAULT 0 NOT NULL,
    "cancelledTotal" numeric(65,30) DEFAULT 0 NOT NULL,
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
    "schoolId" text NOT NULL
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
    "schoolId" text NOT NULL
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
    amount double precision NOT NULL,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "transactionId" text,
    "orderId" text NOT NULL,
    "studentId" text NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL
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
    "academicYear" public."AcademicYear" DEFAULT 'Y2024_2025'::public."AcademicYear" NOT NULL,
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
    amount double precision DEFAULT 0 NOT NULL,
    "discountAmount" double precision DEFAULT 0 NOT NULL,
    "fineAmount" double precision DEFAULT 0 NOT NULL,
    "receiptDate" timestamp(3) without time zone NOT NULL,
    "receivedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "receiptNo" text NOT NULL,
    "paymentMode" public."PaymentMode" DEFAULT 'CASH'::public."PaymentMode" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    remarks text,
    "academicYear" public."AcademicYear" DEFAULT 'Y2024_2025'::public."AcademicYear" NOT NULL,
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
    "schoolId" text NOT NULL
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "schoolId" text NOT NULL
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
    "schoolId" text NOT NULL
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
    name text NOT NULL,
    address text NOT NULL,
    phone text,
    email text,
    website text,
    logo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "schoolId" text NOT NULL,
    "receiptFooter" text,
    "receiptHeader" text,
    "taxId" text
);


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
    "academicYear" public."AcademicYear" DEFAULT 'Y2024_2025'::public."AcademicYear" NOT NULL,
    "classId" integer NOT NULL,
    "profileId" text,
    "linkedUserId" text,
    "schoolId" text NOT NULL
);


--
-- Name: StudentEnrollment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudentEnrollment" (
    id integer NOT NULL,
    "studentId" text NOT NULL,
    "classId" integer NOT NULL,
    "academicYear" public."AcademicYear" NOT NULL,
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
    "academicYear" public."AcademicYear" DEFAULT 'Y2024_2025'::public."AcademicYear" NOT NULL,
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
    "totalPaidAmount" double precision DEFAULT 0 NOT NULL,
    "totalDiscountAmount" double precision DEFAULT 0 NOT NULL,
    "totalFineAmount" double precision DEFAULT 0 NOT NULL,
    "totalAbacusAmount" double precision DEFAULT 0 NOT NULL,
    "totalFeeAmount" double precision DEFAULT 0 NOT NULL,
    "dueAmount" double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'Not Paid'::text NOT NULL,
    "schoolId" text NOT NULL
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
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    supervisor boolean DEFAULT false NOT NULL,
    dob timestamp(3) without time zone,
    "profileId" text,
    "classId" integer,
    clerk_id text,
    "linkedUserId" text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "schoolId" text NOT NULL
);


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
    "supervisorId" text,
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
-- Name: Attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance" ALTER COLUMN id SET DEFAULT nextval('public."Attendance_id_seq"'::regclass);


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
-- Name: class id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class ALTER COLUMN id SET DEFAULT nextval('public.class_id_seq'::regclass);


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Admin" (id, username, password, name, "parentName", gender, email, phone, address, dob, img, "bloodType", "createdAt", clerk_id, "profileId", "linkedUserId", "schoolId") FROM stdin;
cmjf4q3i600026cjqnm2xzto4	admin001	tester0001	A HARIKIRAN	A SRINIVASARAO	Male	hari.myskoolcom@gmail.com	7801049830	17-309, Golla Veedhi, Old Gopalapatnam	1996-03-29 00:00:00	https://res.cloudinary.com/harikiran/image/upload/v1766285381/h4x8fjbq7hlfkvbv4vg9.jpg	O_POS	2026-02-21 18:26:25.428	user_34hDQUMuHoPtvaWMWsrnYaAYztu	cmjf4q3hm00006cjq2nnukul3	cmjf4q3hv00016cjqg8jf9op8	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Announcement" (id, title, description, date, "classId", "schoolId") FROM stdin;
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Attendance" (id, date, present, "studentId", "classId", "schoolId") FROM stdin;
1	2026-02-22 00:00:00	t	1	3	cmju1hey9000104l54r6cmpsu
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

COPY public."Exam" (id, title, "schoolId") FROM stdin;
\.


--
-- Data for Name: ExamGradeSubject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ExamGradeSubject" (id, "examId", "gradeId", "subjectId", date, "startTime", "maxMarks", "schoolId") FROM stdin;
\.


--
-- Data for Name: FeePayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeePayment" (id, amount, "paymentDate", "transactionId", "orderId", "studentId", "schoolId", "createdAt", currency, "updatedAt", status) FROM stdin;
\.


--
-- Data for Name: FeeStructure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeeStructure" (id, "gradeId", "startDate", "dueDate", "termFees", "abacusFees", term, "academicYear", "schoolId") FROM stdin;
\.


--
-- Data for Name: FeeTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeeTransaction" (id, "studentId", "studentFeesId", term, amount, "discountAmount", "fineAmount", "receiptDate", "receivedDate", "receiptNo", "paymentMode", "createdAt", "updatedAt", remarks, "academicYear", "transactionType", "updatedByName", "deletedAt", "schoolId") FROM stdin;
\.


--
-- Data for Name: Grade; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Grade" (id, level, "schoolId") FROM stdin;
1	Pre KG	cmju1hey9000104l54r6cmpsu
2	LKG	cmju1hey9000104l54r6cmpsu
3	UKG	cmju1hey9000104l54r6cmpsu
4	I	cmju1hey9000104l54r6cmpsu
5	II	cmju1hey9000104l54r6cmpsu
6	III	cmju1hey9000104l54r6cmpsu
7	IV	cmju1hey9000104l54r6cmpsu
8	V	cmju1hey9000104l54r6cmpsu
9	VI	cmju1hey9000104l54r6cmpsu
10	VII	cmju1hey9000104l54r6cmpsu
11	VIII	cmju1hey9000104l54r6cmpsu
12	IX	cmju1hey9000104l54r6cmpsu
13	X	cmju1hey9000104l54r6cmpsu
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
cmlxarysa00018sjqrxfx7x8k	tester003	admin	cmlxaryrs00008sjq93ojzxx5	cmju1hey9000104l54r6cmpsu
cmlxlp7zs0001c8jqzkc0qx8d	s1	student	cmlxlp7z40000c8jqx0dj6kdm	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Messages" (id, message, type, "studentId", date, "classId", "schoolId") FROM stdin;
cmlxbuw350001t0jqj0tpr90k	Dear Parent, we would like to inform you that  ()'s class will be closed tomorrow due to a holiday. We hope your ward enjoys the break. - KOTAK SALESIAN SCHOOL	ANNOUNCEMENT	\N	2026-02-22 05:49:00.016	\N	cmju1hey9000104l54r6cmpsu
cmlxry2yr0001tkjqm962mc0p	Dear Parent, this is a reminder that the fee payment for  () is due for undefined. Please arrange the payment of ₹ at your earliest convenience to avoid any disruptions in their education. - KOTAK SALESIAN SCHOOL	FEE_RELATED	\N	2026-02-22 13:19:22.754	\N	cmju1hey9000104l54r6cmpsu
cmlxrz93i0002tkjqytifoorc	Dear Parent, we would like to inform you that  ()'s class will be closed tomorrow due to a holiday. We hope your ward enjoys the break. - KOTAK SALESIAN SCHOOL	ANNOUNCEMENT	\N	2026-02-22 13:20:17.357	\N	cmju1hey9000104l54r6cmpsu
cmlxso6ej0003tkjqy8qsupwl	Dear Parent, we would like to inform you that  ()'s class will be closed tomorrow due to a holiday. We hope your ward enjoys the break. - KOTAK SALESIAN SCHOOL	ANNOUNCEMENT	\N	2026-02-22 13:39:40.266	\N	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: PermissionSlip; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PermissionSlip" (id, "studentId", "leaveType", "subReason", description, date, "timeIssued", "withWhom", relation, "createdAt", "updatedAt", "schoolId") FROM stdin;
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Profile" (id, clerk_id, phone, "activeUserId") FROM stdin;
cmjf4q3hm00006cjq2nnukul3	user_34hDQUMuHoPtvaWMWsrnYaAYztu	7801049830	cmjf4q3hv00016cjqg8jf9op8
cmlxaryrs00008sjq93ojzxx5	user_3A0lltR0iBPMOKz2LAOVpOneVa9	7337002305	cmlxarysa00018sjqrxfx7x8k
cmlxlp7z40000c8jqx0dj6kdm	user_37TeLNYBDd6ZECYrPClHFc79L8I	8466863932	cmlxlp7zs0001c8jqzkc0qx8d
\.


--
-- Data for Name: Result; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Result" (id, marks, "studentId", "examId", "subjectId", "createdAt", "schoolId") FROM stdin;
\.


--
-- Data for Name: SchoolInfo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolInfo" (id, name, address, phone, email, website, logo, "createdAt", "updatedAt", "schoolId", "receiptFooter", "receiptHeader", "taxId") FROM stdin;
cmju1hey9000104l54r6cmpsu	KOTAK SALESIAN SCHOOL	17-309, Golla Veedhi, Old Gopalapatnam	9949523412	kotakschoolvsp@gmail.com	https://kotaksalesianschool-vizag.com/	\N	2025-12-31 13:15:51.921	2025-12-31 13:15:51.921	kss_vizag	Fees once paid are not refundable.	(Affiliated to the Council for the I.S.C. Examination, New Delhi) Affiliation No. AP/050 - Dt. 04-11-1987	AP050
cmkz9t8ab000304l5xyz987pq	ST. MARY'S ENGLISH MEDIUM SCHOOL	12-45-7, Seethammadhara, Visakhapatnam	9876543210	stmarysvizag@gmail.com	https://stmarysvizag.edu.in/	\N	2026-02-22 07:33:54.294	2026-02-22 07:33:54.294	smes_vizag	All fees are subject to school policies.	(Recognized by Government of Andhra Pradesh) Affiliation No. AP/112 - Dt. 15-08-1995	AP112
cmkzbt1x3000404l5abc111aa	GREEN VALLEY HIGH SCHOOL	8-2-45, NAD Junction, Visakhapatnam	9123456780	admin@greenvalleyvizag.com	https://greenvalleyvizag.com/	\N	2026-02-22 07:38:16.019	2026-02-22 07:38:16.019	gvhs_vizag	Fees once paid will not be refunded under any circumstances.	(Affiliated to State Board of Andhra Pradesh) Affiliation No. AP/210 - Dt. 10-06-2001	AP210
cmkzbt2y4000504l5abc222bb	LITTLE FLOWER SCHOOL	5-10-3, Gajuwaka, Visakhapatnam	9012345678	info@littleflowerschool.edu.in	https://littleflowerschool.edu.in/	\N	2026-02-22 07:38:26.087	2026-02-22 07:38:26.087	lfs_vizag	Late fee applicable after due date.	(Recognized by CBSE, New Delhi) Affiliation No. AP/315 - Dt. 22-03-2005	AP315
cmkzbt3z5000604l5abc333cc	OAKRIDGE INTERNATIONAL SCHOOL	Survey No. 102, Bheemili Road, Visakhapatnam	9345678901	contact@oakridgevizag.com	https://oakridgevizag.com/	\N	2026-02-22 07:38:36.549	2026-02-22 07:38:36.549	ois_vizag	School reserves the right to revise fee structure annually.	(Affiliated to ICSE Council, New Delhi) Affiliation No. AP/420 - Dt. 18-09-2010	AP420
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Student" (id, username, name, "motherName", "fatherName", "penNo", "studentAadhar", "fatherAadhar", "motherAadhar", email, phone, address, img, "bloodType", gender, dob, "createdAt", status, clerk_id, "academicYear", "classId", "profileId", "linkedUserId", "schoolId") FROM stdin;
1	s1	CH ASWINI	CH LAXMI	CH ERUKU NAIDU					aswinichalla2008@gmail.com	8466863932	17-309, Golla Veedhi, OldGopalapatnam	\N	Under Investigation	Female	2008-08-15 00:00:00	2026-02-22 10:24:31.684	ACTIVE	user_37TeLNYBDd6ZECYrPClHFc79L8I	Y2024_2025	3	cmlxlp7z40000c8jqx0dj6kdm	cmlxlp7zs0001c8jqzkc0qx8d	cmju1hey9000104l54r6cmpsu
\.


--
-- Data for Name: StudentEnrollment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentEnrollment" (id, "studentId", "classId", "academicYear", status, "promotedFromId", "schoolId") FROM stdin;
\.


--
-- Data for Name: StudentFees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentFees" (id, "studentId", "feeStructureId", "academicYear", term, "paidAmount", "abacusPaidAmount", "discountAmount", "fineAmount", "receiptDate", "receivedDate", "paymentMode", "receiptNo", remarks, "updatedByName", "schoolId") FROM stdin;
\.


--
-- Data for Name: StudentTotalFees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudentTotalFees" (id, "studentId", "totalPaidAmount", "totalDiscountAmount", "totalFineAmount", "totalAbacusAmount", "totalFeeAmount", "dueAmount", status, "schoolId") FROM stdin;
\.


--
-- Data for Name: Subject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subject" (id, name, "createdAt", "schoolId") FROM stdin;
\.


--
-- Data for Name: SubjectTeacher; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SubjectTeacher" ("subjectId", "teacherId", "classId", "schoolId") FROM stdin;
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Teacher" (id, username, name, "parentName", email, phone, address, img, "bloodType", gender, "createdAt", "deletedAt", supervisor, dob, "profileId", "classId", clerk_id, "linkedUserId", status, "schoolId") FROM stdin;
\.


--
-- Data for Name: _SubjectGrades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_SubjectGrades" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8c064036-6ad9-4620-847e-f01185f469d0	45eb1be617c3cc40432ac936dbb7a125f9cec1cd43987c03f69e4e673ce4477f	2026-02-20 06:18:15.533127+05:30	20251221024504_init	\N	\N	2026-02-20 06:18:15.292596+05:30	1
2b4f05f6-e738-4548-b1ca-251d6ec85e46	0a8d42f89db781d279f9967ef4e5ee49418bd78e6687505f97b82d0040b9e7b7	2026-02-20 06:18:15.53881+05:30	20251229144832_add_teacher_indexes	\N	\N	2026-02-20 06:18:15.533842+05:30	1
34f450d0-1f2e-49f7-957c-8217d8341604	258ac37e09424ac50e4036ac80a79d2d78781392c61d09728a633029464f3712	2026-02-20 20:53:42.36694+05:30	20260220152342_add_index	\N	\N	2026-02-20 20:53:42.339991+05:30	1
811d5d97-df78-4cf0-9bca-d440fab1abc5	e2234a8e4a06f88ac9b5688f518d8ea24a9d07fbcd1931334e4519eccff655d1	2026-02-20 06:18:15.542533+05:30	20251229144946_add_user_status	\N	\N	2026-02-20 06:18:15.539351+05:30	1
e884c3b6-e72f-4635-bfed-040415739d68	d705ad20ec8f62ad99fab81f7d757a5fac9aa135e322d8a6ef437fcca74dab25	2026-02-20 06:18:15.550121+05:30	20251231043204_add_school_info	\N	\N	2026-02-20 06:18:15.543102+05:30	1
e83d7f68-5386-4e9c-be1c-6f2aa34c7540	847a443fa0c2b69b784e2d9510b8ebcdef928c43c89e478fff455dd6b6b36ce9	2026-02-20 06:18:15.554696+05:30	20251231132618_add_school_username	\N	\N	2026-02-20 06:18:15.550818+05:30	1
a076ded8-e675-46cb-a79b-420e7ea002de	945f204be9129bd01197b576a9380e87a302aec350b0cbe245e820c8e00d1335	2026-02-20 06:18:15.566349+05:30	20251231162954_make_marks_float	\N	\N	2026-02-20 06:18:15.555388+05:30	1
edb7f378-e0ca-4f47-a01c-349ae4116d0b	ce086b7357cda2e5f07a9da8260d3ca19becfe12b8c3fd6262c905c8ca4e2834	2026-02-20 06:18:15.576123+05:30	20260104162127_update_messages_for_notifications	\N	\N	2026-02-20 06:18:15.566888+05:30	1
00eff941-c247-4791-802c-ba3c81d11bee	d447f955fe5f7390d8c347a1d0419bef61b7cba22b14c4c25daf0be69a426355	2026-02-20 06:18:15.585462+05:30	20260104182615_add_payment_fields	\N	\N	2026-02-20 06:18:15.576749+05:30	1
119ce321-5c81-41a2-b48b-8ab50c12cad2	fb5e3a1927eaca85fdf600ec471e2eb52a556f26ac5cb8dba632f1fd0b21e520	2026-02-20 06:18:15.72043+05:30	20260212160337_multitenant_final_fix	\N	\N	2026-02-20 06:18:15.586319+05:30	1
53344a42-21f0-4f30-b9a1-8ff657152e40	f21e8bb497fd4226ccad9cfcf7bbf598680b8d086f94b0b418af85ebd1b775f0	2026-02-20 06:18:15.724682+05:30	20260213161114_fix_student_total_fees_unique	\N	\N	2026-02-20 06:18:15.720963+05:30	1
12f46a90-9695-4f36-99f2-9522aa0853e0	3fe5a1d0bdc13a20d7d09bbfbe4dcb985f2341a9892550bd2848da29bce2257e	2026-02-20 06:18:15.729706+05:30	20260213161333_fix_student_total_fees_relation_final	\N	\N	2026-02-20 06:18:15.725311+05:30	1
8500188c-c882-4a5b-b16a-d96d3f95334e	b593151914402384997ed467f87e8b84f64d290e0bb33ba5ed6f0233f297b5c9	2026-02-20 06:38:19.254956+05:30	20260220010819_add_school_receipt_fields	\N	\N	2026-02-20 06:38:19.231788+05:30	1
0475e908-d58c-479a-a9d1-6417ae91aca2	64592970ac79cd862b9531d52a2e568a3402c6b47dedf22c9e00a6f27d6785b4	2026-02-20 19:14:14.62835+05:30	20260220134414_add_bulkupload	\N	\N	2026-02-20 19:14:14.581012+05:30	1
\.


--
-- Data for Name: class; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.class (id, name, section, "supervisorId", "gradeId", "schoolId") FROM stdin;
3	Pre KG - A	A	\N	1	cmju1hey9000104l54r6cmpsu
4	LKG	A	\N	2	cmkz9t8ab000304l5xyz987pq
\.


--
-- Name: Announcement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Announcement_id_seq"', 1, false);


--
-- Name: Attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Attendance_id_seq"', 4, true);


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
-- Name: StudentEnrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StudentEnrollment_id_seq"', 1, false);


--
-- Name: StudentFees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StudentFees_id_seq"', 1, false);


--
-- Name: StudentTotalFees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StudentTotalFees_id_seq"', 1, false);


--
-- Name: Subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Subject_id_seq"', 1, false);


--
-- Name: class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.class_id_seq', 3, true);


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
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


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
-- Name: Attendance_classId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_classId_date_idx" ON public."Attendance" USING btree ("classId", date);


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
-- Name: Attendance_studentId_date_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Attendance_studentId_date_schoolId_key" ON public."Attendance" USING btree ("studentId", date, "schoolId");


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
-- Name: Class_supervisorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Class_supervisorId_idx" ON public.class USING btree ("supervisorId");


--
-- Name: Event_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_classId_idx" ON public."Event" USING btree ("classId");


--
-- Name: Event_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_schoolId_idx" ON public."Event" USING btree ("schoolId");


--
-- Name: ExamGradeSubject_examId_gradeId_subjectId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ExamGradeSubject_examId_gradeId_subjectId_schoolId_key" ON public."ExamGradeSubject" USING btree ("examId", "gradeId", "subjectId", "schoolId");


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
-- Name: Exam_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Exam_schoolId_idx" ON public."Exam" USING btree ("schoolId");


--
-- Name: Exam_title_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Exam_title_schoolId_key" ON public."Exam" USING btree (title, "schoolId");


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
-- Name: FeeStructure_gradeId_term_academicYear_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FeeStructure_gradeId_term_academicYear_schoolId_key" ON public."FeeStructure" USING btree ("gradeId", term, "academicYear", "schoolId");


--
-- Name: FeeStructure_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeStructure_schoolId_idx" ON public."FeeStructure" USING btree ("schoolId");


--
-- Name: FeeTransaction_academicYear_receiptDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_academicYear_receiptDate_idx" ON public."FeeTransaction" USING btree ("academicYear", "receiptDate");


--
-- Name: FeeTransaction_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_schoolId_idx" ON public."FeeTransaction" USING btree ("schoolId");


--
-- Name: FeeTransaction_schoolId_receiptDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_schoolId_receiptDate_idx" ON public."FeeTransaction" USING btree ("schoolId", "receiptDate");


--
-- Name: FeeTransaction_studentId_academicYear_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FeeTransaction_studentId_academicYear_idx" ON public."FeeTransaction" USING btree ("studentId", "academicYear");


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
-- Name: Result_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Result_schoolId_idx" ON public."Result" USING btree ("schoolId");


--
-- Name: Result_studentId_examId_subjectId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Result_studentId_examId_subjectId_schoolId_key" ON public."Result" USING btree ("studentId", "examId", "subjectId", "schoolId");


--
-- Name: SchoolInfo_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolInfo_schoolId_key" ON public."SchoolInfo" USING btree ("schoolId");


--
-- Name: StudentEnrollment_academicYear_classId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentEnrollment_academicYear_classId_idx" ON public."StudentEnrollment" USING btree ("academicYear", "classId");


--
-- Name: StudentEnrollment_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentEnrollment_schoolId_idx" ON public."StudentEnrollment" USING btree ("schoolId");


--
-- Name: StudentEnrollment_studentId_academicYear_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYear_schoolId_key" ON public."StudentEnrollment" USING btree ("studentId", "academicYear", "schoolId");


--
-- Name: StudentFees_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentFees_schoolId_idx" ON public."StudentFees" USING btree ("schoolId");


--
-- Name: StudentFees_studentId_academicYear_term_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StudentFees_studentId_academicYear_term_schoolId_key" ON public."StudentFees" USING btree ("studentId", "academicYear", term, "schoolId");


--
-- Name: StudentTotalFees_schoolId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudentTotalFees_schoolId_idx" ON public."StudentTotalFees" USING btree ("schoolId");


--
-- Name: StudentTotalFees_studentId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StudentTotalFees_studentId_schoolId_key" ON public."StudentTotalFees" USING btree ("studentId", "schoolId");


--
-- Name: Student_academicYear_classId_gender_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_academicYear_classId_gender_status_idx" ON public."Student" USING btree ("academicYear", "classId", gender, status);


--
-- Name: Student_classId_gender_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Student_classId_gender_status_idx" ON public."Student" USING btree ("classId", gender, status);


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
-- Name: Teacher_classId_schoolId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Teacher_classId_schoolId_key" ON public."Teacher" USING btree ("classId", "schoolId");


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
-- Name: class_supervisorId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "class_supervisorId_key" ON public.class USING btree ("supervisorId");


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
-- Name: Student Student_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.class(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: class class_supervisorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT "class_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dRfgK0Qy6jZzkt0oLHeIMhDRARxcuMcJtjqc93gdLDJcjww0qIyvEC8eSe7vdK0

