import { useState, useEffect } from "react";
import { MessageType } from "../../types";
import { getMessageContent } from "@/lib/utils/messageUtils";
import { useParams } from "next/navigation";
import { tenantFetch } from "@/lib/tenantFetch";

const MessageComponent = () => {
  const [studentName, setStudentName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [announcementType, setAnnouncementType] =
    useState<MessageType>("ABSENT");
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [messageContent, setMessageContent] = useState<string>("");
  const { schoolId } = useParams<{ schoolId: string }>();
  const [schoolName, setSchoolName] = useState<string>("School");
  console.log("School ID param:", schoolId);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await tenantFetch<{ id: number; name: string }[]>(
          schoolId,
          "/classes",
        );

        setClasses(data);
      } catch (error) {
        console.error("Failed to fetch classes", error);
      }
    };

    if (schoolId) fetchClasses();
  }, [schoolId]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) return;

      try {
        const data = await tenantFetch<{ id: string; name: string }[]>(
          schoolId,
          `/students?classId=${selectedClassId}`,
        );

        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };

    fetchStudents();
  }, [selectedClassId, schoolId]);

  useEffect(() => {
    const cls = classes.find((c) => c.id === selectedClassId);
    if (cls) {
      setClassName(cls.name);
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    const student = students.find((s) => s.id === selectedStudentId);
    if (student) {
      setStudentName(student.name);
    }
  }, [selectedStudentId, students]);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await fetch(`/api/v1/public/school/${schoolId}`);
        if (!res.ok) return;

        const data = await res.json();
        setSchoolName(data.name);
      } catch (err) {
        console.error("Failed to fetch school", err);
      }
    };

    if (schoolId) fetchSchool();
  }, [schoolId]);

  useEffect(() => {
    if (!studentName && !className) return;

    setMessageContent(
      getMessageContent(announcementType, {
        studentName,
        className,
        schoolName,
      }),
    );
  }, [announcementType, studentName, className, schoolName]);

  // Handle form submission for creating a message (this will be connected to your backend API)
  const handleSubmit = async () => {
    if (!messageContent.trim()) {
      alert("Message cannot be empty");
      return;
    }

    if (!selectedStudentId && !selectedClassId) {
      alert("Please select at least a class or student");
      return;
    }

    try {
      const data = await tenantFetch<{ success: boolean }>(
        schoolId,
        "/messages",
        {
          method: "POST",
          body: JSON.stringify({
            message: messageContent,
            type: announcementType,
            studentId: selectedStudentId,
            classId: selectedClassId,
          }),
        },
      );

      if (data.success) {
        alert("Message successfully created!");
      } else {
        alert("Failed to create message");
      }
    } catch (error: any) {
      console.error("Error submitting message:", error);
      alert(error.message || "Error submitting message");
    }
  };

  return (
    <div className="p-4">
      <h2>Message Generator</h2>

      {/* Student Details Form */}
      <div className="my-2">
        <label>Student: </label>
        <select
          value={selectedStudentId ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedStudentId(id);
          }}
          className="border p-2"
          disabled={!selectedClassId}
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      <div className="my-2">
        <label>Selected Class: </label>
        <div className="border p-2 bg-gray-100">
          {className || "None selected"}
        </div>
      </div>

      <div className="my-2">
        <label>Class: </label>
        <select
          value={selectedClassId ?? ""}
          onChange={(e) => {
            const id = Number(e.target.value);
            setSelectedClassId(id);
            setSelectedStudentId(undefined); // reset student
          }}
          className="border p-2"
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Announcement Type Selection */}
      <div className="my-2">
        <label>Message Type: </label>
        <select
          value={announcementType}
          onChange={(e) => setAnnouncementType(e.target.value as MessageType)}
          className="border p-2"
        >
          <option value="ABSENT">Absent</option>
          <option value="FEE_RELATED">Fee Related</option>
          <option value="HOLIDAY_RELATED">Holiday Related</option>
          <option value="GENERAL">General</option>
        </select>
      </div>

      {/* Message Display Section */}
      <div className="my-2">
        <label>Generated Message: </label>
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)} // Allow users to edit the message
          placeholder="Generated message will appear here"
          className="border p-2 w-full h-32"
        />
      </div>

      <div className="my-2">
        <button
          onClick={handleSubmit}
          disabled={!selectedClassId || !messageContent.trim()}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          Submit Message
        </button>
      </div>

      {/* Display Generated Message */}
      {messageContent && (
        <div className="mt-4">
          <h3>Generated Message:</h3>
          <p>{messageContent}</p>
        </div>
      )}
    </div>
  );
};

export default MessageComponent;
