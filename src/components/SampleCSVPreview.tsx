"use client";

import Link from "next/link";

interface SampleCSVPreviewProps {
  type:
    | "student"
    | "teacher"
    | "grades"
    | "classes"
    | "feestructure"
    | "subjects"
    | "feecollection"
    | "lessons"
    | "exams";
}

const SampleCSVPreview = ({ type }: SampleCSVPreviewProps) => {
  let sampleRows: Record<string, string>[] = [];

  switch (type) {
    case "exams":
      sampleRows = [
        {
          exam_title: "Mid Term 1",
          grade_level: "Grade 5",
          subject_name: "Mathematics",
          exam_date: "2025-09-10",
          start_time: "09:30",
          max_marks: "100",
        },
        {
          exam_title: "Mid Term 1",
          grade_level: "Grade 5",
          subject_name: "English",
          exam_date: "2025-09-11",
          start_time: "09:30",
          max_marks: "100",
        },
      ];
      break;
    case "teacher":
      sampleRows = [
        {
          id: "t001",
          username: "teach001",
          name: "Amit Sharma",
          parentName: "Suresh Sharma",
          email: "teach001@kotakschool.com",
          phone: "9876543210",
          address: "42 Hill Road",
          img: "teacher1.jpg",
          bloodType: "A+",
          gender: "Male",
          dob: "1985-05-10",
          classId: "1",
          clerk_id: "",
        },
        {
          id: "t002",
          username: "teach002",
          name: "Sunita Rani",
          parentName: "Mahesh Rani",
          email: "teach002@kotakschool.com",
          phone: "9876543211",
          address: "89 Garden Lane",
          img: "teacher2.jpg",
          bloodType: "O-",
          gender: "Female",
          dob: "1988-07-15",
          classId: "2",
          clerk_id: "",
        },
      ];
      break;

    case "grades":
      sampleRows = [
        {
          id: "1",
          level: "LKG",
        },
        {
          id: "2",
          level: "UKG",
        },
        {
          id: "3",
          level: "1",
        },
      ];
      break;

    case "classes":
      sampleRows = [
        {
          id: "1",
          section: "A",
          gradeId: "1",
          supervisorId: "t001",
        },
        {
          id: "2",
          section: "B",
          gradeId: "1",
          supervisorId: "t002",
        },
      ];
      break;

    case "subjects":
      sampleRows = [
        {
          id: "1",
          name: "Mathematics",
        },
        {
          id: "2",
          name: "Science",
        },
      ];
      break;

    case "feecollection":
      sampleRows = [
        {
          studentId: "123",
          term: "TERM_1",
          amount: "2000",
          discountAmount: "100",
          fineAmount: "50",
          receiptDate: "2025-07-17",
          receiptNo: "R-001",
          remarks: "July payment",
          paymentMode: "CASH",
        },
        {
          studentId: "124",
          term: "TERM_1",
          amount: "2500",
          discountAmount: "0",
          fineAmount: "0",
          receiptDate: "2025-07-17",
          receiptNo: "R-002",
          remarks: "Full paid",
          paymentMode: "CASH",
        },
        {
          studentId: "125",
          term: "TERM_2",
          amount: "3000",
          discountAmount: "200",
          fineAmount: "0",
          receiptDate: "2025-07-18",
          receiptNo: "R-003",
          remarks: "With discount",
          paymentMode: "ONLINE",
        },
      ];
      break;

    case "feestructure":
      sampleRows = [
        {
          id: "1",
          gradeId: "1",
          abacusFees: "0",
          termFees: "6050",
          term: "TERM_1",
          startDate: "2024-06-01",
          dueDate: "2024-06-10",
          academicYear: "2024-2025",
        },
        {
          id: "2",
          gradeId: "1",
          abacusFees: "0",
          termFees: "6050",
          term: "TERM_2",
          startDate: "2024-12-01",
          dueDate: "2024-12-10",
          academicYear: "2024-2025",
        },
        {
          id: "3",
          gradeId: "1",
          abacusFees: "0",
          termFees: "6050",
          term: "TERM_3",
          startDate: "2024-12-01",
          dueDate: "2024-12-10",
          academicYear: "2024-2025",
        },
        {
          id: "4",
          gradeId: "1",
          abacusFees: "0",
          termFees: "6050",
          term: "TERM_4",
          startDate: "2024-12-01",
          dueDate: "2024-12-10",
          academicYear: "2024-2025",
        },
      ];
      break;

    case "lessons":
      sampleRows = [
        {
          id: "l001",
          classId: "1",
          subjectId: "101",
          teacherId: "201",
          day: "MONDAY",
          startTime: "09:00",
          endTime: "09:45",
          academicYear: "Y2024_2025",
        },
        {
          id: "l002",
          classId: "1",
          subjectId: "102",
          teacherId: "202",
          day: "MONDAY",
          startTime: "09:46",
          endTime: "10:30",
          academicYear: "Y2024_2025",
        },
        {
          id: "l003",
          classId: "1",
          subjectId: "103",
          teacherId: "203",
          day: "TUESDAY",
          startTime: "10:31",
          endTime: "11:15",
          academicYear: "Y2024_2025",
        },
        {
          id: "l004",
          classId: "2",
          subjectId: "104",
          teacherId: "204",
          day: "WEDNESDAY",
          startTime: "11:16",
          endTime: "12:00",
          academicYear: "Y2024_2025",
        },
      ];
      break;

    default: // student
      sampleRows = [
        {
          id: "s001",
          username: "stu001",
          name: "Ravi Kumar",
          parentName: "Suresh Kumar",
          email: "stu001@kotakschool.com",
          phone: "9876543210",
          address: "123 Street",
          img: "A.jpg",
          bloodType: "B+",
          gender: "Male",
          dob: "15-04-2009",
          classId: "1",
          clerk_id: "",
          academicYear: "Y2024_2025",
        },
        {
          id: "s002",
          username: "stu002",
          name: "Meena Devi",
          parentName: "Rajesh Devi",
          email: "stu002@kotakschool.com",
          phone: "9876543211",
          address: "456 Road",
          img: "B.jpg",
          bloodType: "O+",
          gender: "Female",
          dob: "10-06-2010",
          classId: "1",
          clerk_id: "",
          academicYear: "Y2024_2025",
        },
      ];
      break;
  }

  const downloadLink = {
    student: "/sample/student-bulk-template.csv",
    teacher: "/sample/teacher-bulk-template.csv",
    grades: "/sample/grade-bulk-template.csv",
    classes: "/sample/class-bulk-template.csv",
    feestructure: "/sample/feeStructure-bulk-template.csv",
    subjects: "/sample/subjects-bulk-template.csv",
    feecollection: "/sample/fees-bulk-template.csv",
    lessons: "/sample/lessons-bulk-template.csv",
    exams: "/sample/exams-bulk-template.csv", 
  };

  const titleMap = {
    student: "Student",
    teacher: "Teacher",
    grades: "Grade",
    classes: "Class",
    feestructure: "Fee Structure",
    subjects: "Subject",
    feecollection: "Fee Collection",
    lessons: "Lessons",
     exams: "Exams",
  };

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
        📄 {titleMap[type]} CSV Preview
      </h2>

      <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded">
        <table className="min-w-full text-xs text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {Object.keys(sampleRows[0]).map((key) => (
                <th
                  key={key}
                  className="px-3 py-2 border-b text-gray-700 dark:text-gray-300 dark:border-gray-600 whitespace-nowrap"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((row, i) => (
              <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-700">
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    className="px-3 py-1 border-b dark:border-gray-600 whitespace-nowrap"
                  >
                    {val || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-3">
        <Link
          href={downloadLink[type]}
          download
          className="text-sm bg-LamaPurple dark:bg-purple-700 text-black dark:text-white px-4 py-2 rounded hover:bg-LamaPurpleLight dark:hover:bg-purple-600 transition"
        >
          Download Sample CSV
        </Link>
      </div>
    </div>
  );
};

export default SampleCSVPreview;
