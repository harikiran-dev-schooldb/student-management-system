'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

type Exam = { id: number; title: string; date: string };
type Grade = { id: number; level: string };
type Class = { id: number; section: string };
type Subject = { id: number; name: string };
type Student = { id: string; name: string };

export default function MarksEntryForm() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedExamTitle, setSelectedExamTitle] = useState<string>();
  const [selectedExamId, setSelectedExamId] = useState<number>();
  const [selectedGradeId, setSelectedGradeId] = useState<number>();
  const [selectedClassId, setSelectedClassId] = useState<number>();

  const [marksData, setMarksData] = useState<
    { studentId: string; marks: { [subjectName: string]: string } }[]
  >([]);

  // Fetch exams and grades on load
  useEffect(() => {
    axios.get('/api/exams').then((res) => setExams(res.data.exams));
    axios.get('/api/grades').then((res) => setGrades(res.data));
  }, []);

  // Fetch classes on grade change
  useEffect(() => {
    if (!selectedGradeId) return;
    axios
      .get(`/api/classes?gradeId=${selectedGradeId}`)
      .then((res) => setClasses(res.data));
  }, [selectedGradeId]);

  // Fetch subjects and students on selection changes
  useEffect(() => {
    if (!selectedExamTitle || !selectedGradeId || !selectedClassId) return;
    const fetchExamData = async () => {
      try {
        const res = await axios.get('/api/exams/exam-data', {
          params: {
            examTitle: selectedExamTitle,
            gradeId: selectedGradeId,
            classId: selectedClassId,
          },
        });

        setSelectedExamId(res.data.examId);
        setSubjects(res.data.subjects);
        setStudents(res.data.students);

        const initialMarks = res.data.students.map((student: Student) => ({
          studentId: student.id,
          marks: {},
        }));
        setMarksData(initialMarks);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch exam data');
      }
    };

    fetchExamData();
  }, [selectedExamTitle, selectedGradeId, selectedClassId]);

  const handleMarkChange = (
    studentId: string,
    subjectName: string,
    value: string
  ) => {
    setMarksData((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId
          ? { ...entry, marks: { ...entry.marks, [subjectName]: value } }
          : entry
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedExamId || !selectedGradeId) return alert('Select all fields');

    const payload = {
      gradeId: selectedGradeId,
      examId: selectedExamId,
      entries: marksData,
    };

    try {
      await axios.post('/api/results/bulk-entry', payload);
      toast.success('Marks submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit marks');
    }
  };

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Enter Marks</h2>

      <div className="flex flex-wrap gap-4 mt-4">
        <select
          onChange={(e) => setSelectedExamTitle(e.target.value)}
          defaultValue=""
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select Exam</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.title}>{exam.title}</option>
          ))}
        </select>

        <select
          onChange={(e) => setSelectedGradeId(Number(e.target.value))}
          defaultValue=""
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select Grade</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>{g.level}</option>
          ))}
        </select>

        <select
          onChange={(e) => setSelectedClassId(Number(e.target.value))}
          defaultValue=""
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.section}</option>
          ))}
        </select>
      </div>

      {students.length > 0 && subjects.length > 0 && (
        <div className="overflow-auto mt-4">
          <table className="min-w-full table-auto border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2 text-left border dark:border-gray-600">Student ID</th>
                <th className="px-4 py-2 text-left border dark:border-gray-600">Student</th>
                {subjects.map((subj) => (
                  <th key={subj.id} className="px-4 py-2 text-left border dark:border-gray-600">{subj.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="even:bg-gray-50 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 border dark:border-gray-600">{student.id}</td>
                  <td className="px-4 py-2 border dark:border-gray-600">{student.name}</td>
                  {subjects.map((subj) => (
                    <td key={subj.id} className="px-4 py-2 border dark:border-gray-600">
                      <input
                        type="number"
                        value={marksData.find((entry) => entry.studentId === student.id)?.marks[subj.name] || ''}
                        onChange={(e) => handleMarkChange(student.id, subj.name, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {students.length > 0 && (
        <div className="text-center mt-4">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to submit the marks?')) handleSubmit();
            }}
            className="bg-green-400 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition duration-200"
          >
            Submit Marks
          </button>
        </div>
      )}
    </div>
  );
}
