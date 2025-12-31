"use client";

import Link from "next/link";
import { FileDown, Table } from "lucide-react";

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

  // ... (Your existing switch case logic remains mostly the same, just keeping it clean)
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
        { id: "1", level: "LKG" },
        { id: "2", level: "UKG" },
        { id: "3", level: "1" },
      ];
      break;

    case "classes":
      sampleRows = [
        { id: "1", section: "A", gradeId: "1", supervisorId: "t001" },
        { id: "2", section: "B", gradeId: "1", supervisorId: "t002" },
      ];
      break;

    case "subjects":
      sampleRows = [
        { id: "1", name: "Mathematics" },
        { id: "2", name: "Science" },
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
    <div className="space-y-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Table className="w-4 h-4" />
          </div>
          {titleMap[type]} Template Preview
        </h2>
        
        {/* Download Button moved to top for better UX */}
        <Link
          href={downloadLink[type]}
          download
          className="group flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" />
          Download CSV
        </Link>
      </div>

      <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">
              <tr>
                {Object.keys(sampleRows[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sampleRows.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td
                      key={j}
                      className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
                    >
                      {val || <span className="text-zinc-300 dark:text-zinc-600">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
        * This is a preview of the columns required. Please download the file to see the full format.
      </p>
    </div>
  );
};

export default SampleCSVPreview;