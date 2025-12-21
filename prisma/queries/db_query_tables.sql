-- Retrieve all table names from the public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Generate SELECT queries for all tables in the public schema
SELECT 'SELECT * FROM ' || tablename || ';'  
FROM pg_tables  
WHERE schemaname = 'public';

CREATE TABLE Admin (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Announcement (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    classId INT REFERENCES Class(id) ON DELETE SET NULL
);

CREATE TABLE attendance (
    id          SERIAL PRIMARY KEY,
    date        TIMESTAMP NOT NULL,
    present     BOOLEAN NOT NULL DEFAULT true,
    student_id  TEXT NOT NULL,
    class_id    INTEGER NOT NULL,

    CONSTRAINT fk_attendance_class
        FOREIGN KEY (class_id)
        REFERENCES class(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id)
        REFERENCES student(id)
        ON DELETE CASCADE,

    CONSTRAINT attendance_student_date_unique
        UNIQUE (student_id, date)
);


CREATE TABLE Class (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    supervisorId TEXT UNIQUE REFERENCES Teacher(id),
    gradeId INT REFERENCES Grade(id) ON DELETE CASCADE
);

CREATE TABLE Event (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    classId INT REFERENCES Class(id) ON DELETE SET NULL
);

CREATE TABLE Exam (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    classId INT REFERENCES Class(id) ON DELETE CASCADE
);

CREATE TABLE ExamSubject (
    id SERIAL PRIMARY KEY,
    examId INT REFERENCES Exam(id) ON DELETE CASCADE,
    subjectId INT REFERENCES Subject(id) ON DELETE CASCADE,
    maxMarks INT NOT NULL,
    UNIQUE(examId, subjectId)
);

CREATE TABLE Fee (
    id SERIAL PRIMARY KEY,
    studentId TEXT REFERENCES Student(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    amount INT NOT NULL,
    extraFee INT DEFAULT 0,
    totalFee INT NOT NULL,
    dueAmount INT NOT NULL,
    paidAmount INT DEFAULT 0,
    status TEXT DEFAULT 'Not Paid',
    feesbook TEXT NOT NULL,
    dueDate TIMESTAMP NOT NULL,
    paidDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(studentId, term)
);

CREATE TABLE FeesStructure (
    id SERIAL PRIMARY KEY,
    classId INT UNIQUE REFERENCES Class(id) ON DELETE CASCADE,
    totalFees INT NOT NULL,
    abacusFees INT NOT NULL,
    termFees INT NOT NULL
);

CREATE TABLE Grade (
    id SERIAL PRIMARY KEY,
    level TEXT UNIQUE NOT NULL
);

CREATE TABLE Homework (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    Date TIMESTAMP NOT NULL,
    classId INT REFERENCES Class(id) ON DELETE CASCADE,
    subjectId INT REFERENCES Subject(id) ON DELETE CASCADE
);

CREATE TABLE Lesson (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    day TEXT NOT NULL,
    startTime TIMESTAMP NOT NULL,
    endTime TIMESTAMP NOT NULL,
    subjectId INT REFERENCES Subject(id) ON DELETE CASCADE,
    classId INT REFERENCES Class(id) ON DELETE CASCADE,
    teacherId TEXT REFERENCES Teacher(id) ON DELETE CASCADE
);

CREATE TABLE Result (
    id SERIAL PRIMARY KEY,
    score FLOAT NOT NULL,
    studentId TEXT REFERENCES Student(id) ON DELETE CASCADE,
    examId INT REFERENCES Exam(id) ON DELETE CASCADE,
    subjectId INT REFERENCES Subject(id) ON DELETE CASCADE
);

-- Student Table
CREATE TABLE Student (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    parentName TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    img TEXT,
    bloodType TEXT,
    gender TEXT NOT NULL,
    dob TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP,
    classId INT REFERENCES Class(id) ON DELETE CASCADE,
    clerk_id TEXT UNIQUE
);

CREATE TABLE Subject (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Teacher (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    img TEXT,
    bloodType TEXT,
    gender TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP,
    supervisor BOOLEAN DEFAULT FALSE,
    dob TIMESTAMP,
	classId TEXT UNIQUE,
	CONSTRAINT teacher_username_unique UNIQUE (username),
    CONSTRAINT teacher_email_unique UNIQUE (email),
    CONSTRAINT teacher_classId_unique UNIQUE (classId)
);

CREATE TABLE ClerkUser (
    clerk_id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    studentId TEXT UNIQUE REFERENCES Student(id) ON DELETE CASCADE,
    teacherId TEXT UNIQUE REFERENCES Teacher(id) ON DELETE CASCADE,
    CHECK (
        (studentId IS NOT NULL AND teacherId IS NULL) OR 
        (studentId IS NULL AND teacherId IS NOT NULL)
    )
);

-- Admin Page

SELECT * FROM "Admin";

INSERT INTO "Admin" (username, full_name,  password, role,address,dob,email,gender, "parentName",phone ) 
VALUES 
('harikiran', 'HARI KIRAN ADANGI', '812551', 'admin', 'Gopalapatnam, Visakhpatnam','1996-03-29','hari.myskoolgmail.com','Male','A SRINIVASA RAO', '7801049830')  

DELETE FROM "Admin";
