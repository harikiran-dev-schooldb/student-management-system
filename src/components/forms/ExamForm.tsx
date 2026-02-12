"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}) => {
    const router = useRouter();
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [examsForDate, setExamsForDate] = useState([]);
    const [existingTitles, setExistingTitles] = useState<string[]>([]);


    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<ExamSchema>({
        resolver: zodResolver(examSchema),
        defaultValues: {
            ...data,
        },
    });

    useEffect(() => {
        if (type === "update" && data) {
            reset({
                id: data?.id,
                title: data?.title || "",
                examDate: data?.examGradeSubjects?.[0]?.date || "",
                startTime: data?.examGradeSubjects?.[0]?.startTime || "",
                gradeId: data?.examGradeSubjects?.[0]?.gradeId || "",
                subjectId: data?.examGradeSubjects?.[0]?.subjectId || "",
                maxMarks: data?.examGradeSubjects?.[0]?.maxMarks || "",
            });
            setSelectedGradeId(data?.examGradeSubjects?.[0]?.gradeId || null);
        }
    }, [type, data, reset]);


    useEffect(() => {
        if (selectedGradeId) {
            const fetchSubjects = async () => {
                try {
                    const res = await fetch(`/api/subjects/grade/${selectedGradeId}`);
                    const data = await res.json();
                    if (data.subjects) {
                        setFilteredSubjects(data.subjects);
                    } else {
                        toast.error("No subjects found for this grade.");
                    }
                } catch (error) {
                    toast.error("Failed to fetch subjects.");
                }
            };
            fetchSubjects();
        } else {
            setFilteredSubjects([]);
        }
    }, [selectedGradeId]);

    const selectedDate = watch("examDate");

    useEffect(() => {
        if (!selectedDate) return;

        const fetchExamsForDate = async () => {
            try {
                const res = await fetch("/api/exams/by-date", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ date: selectedDate }),
                });

                const data = await res.json();
                if (res.ok && data.exams) {
                    setExamsForDate(data.exams);
                } else {
                    setExamsForDate([]);
                }
            } catch (err) {
                toast.error("Failed to fetch exams.");
            }
        };

        fetchExamsForDate();
    }, [selectedDate]);

    useEffect(() => {
        const fetchTitles = async () => {
            try {
                const res = await fetch("/api/exams/titles");
                const data = await res.json();
                if (data.titles) setExistingTitles(data.titles);
            } catch {
                toast.error("Failed to fetch exam titles.");
            }
        };
        fetchTitles();
    }, []);

    useEffect(() => {
        if (type === "update" && data) {
            reset({
                id: data?.id,
                title: data?.title || "",
                examDate: data?.examGradeSubjects?.[0]?.date || "",
                startTime: data?.examGradeSubjects?.[0]?.startTime || "",
                gradeId: data?.examGradeSubjects?.[0]?.gradeId || "",
                subjectId: data?.examGradeSubjects?.[0]?.subjectId || "",
                maxMarks: data?.examGradeSubjects?.[0]?.maxMarks || "",
            });
            setSelectedGradeId(data?.examGradeSubjects?.[0]?.gradeId || null);
        }
    }, [type, data, reset]);


    const onSubmit = async (formData: ExamSchema) => {
        try {
            // Determine the correct API endpoint and HTTP method based on the action type
            const url = type === "create" ? "/api/exams" : `/api/exams/${formData?.id}`;
            const method = type === "create" ? "POST" : "PUT";  // Use "PUT" for updating

            // Send the request
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            // If response is not OK (non-2xx status), handle error
            if (!res.ok) {
                // Attempt to parse the error response as JSON
                let errorMessage = "Something went wrong";
                try {
                    const data = await res.json();
                    errorMessage = data.error || "Something went wrong";
                } catch (e) {
                    // If JSON parsing fails, keep the fallback message
                    console.error("Failed to parse error response:", e);
                }
                throw new Error(errorMessage);
            }

            // Success: Show toast message, close modal, and refresh page
            toast.success(`Exam ${type === "create" ? "created" : "updated"} successfully!`);
            setOpen(false);  // Close modal or dialog
            router.refresh();  // Refresh the page or data
            reset();  // Reset form fields

        } catch (error: any) {
            // Display error message to the user
            toast.error(error.message || "Failed to submit exam.");
        }
    };

    const onDelete = async (examId: number) => {
        console.log("📦 DELETE called for", examId); // <-- Add this

        try {
            const res = await fetch(`/api/exams/${examId}`, {
                method: "DELETE",
            });

            const contentType = res.headers.get("content-type");

            if (!res.ok) {
                if (contentType?.includes("application/json")) {
                    const data = await res.json();
                    throw new Error(data.error || "Delete failed");
                } else {
                    const text = await res.text();
                    throw new Error(`Unexpected response:\n${text.slice(0, 200)}...`);
                }
            }

            toast.success("Deleted successfully");
        } catch (err: any) {
            toast.error(err.message || "Delete failed");
            console.error("Error during delete:", err);
        }
    };



    const { grades } = relatedData || {};

    return (
        <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>

            <div className="flex flex-col w-full gap-2 md:w-1/4">
                <label className="text-xs text-gray-500">Exam Title</label>
                <input
                    list="exam-titles"
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-64"
                    {...register("title")}
                    placeholder="Type or select a title"
                />
                <datalist id="exam-titles">
                    {existingTitles.map((title) => (
                        <option key={title} value={title} />
                    ))}
                </datalist>
                {errors.title?.message && (
                    <p className="text-xs text-red-400">{errors.title.message.toString()}</p>
                )}
            </div>



            <div className="flex flex-wrap justify-between gap-4">


                {/* Exam Date */}
                <InputField
                    label="Exam Date"
                    name="examDate"
                    register={register}
                    error={errors?.examDate}
                    type="date"
                />

                {/* Start Time */}
                <InputField
                    label="Start Time"
                    name="startTime"
                    register={register}
                    error={errors?.startTime}
                    type="time"
                />

                {/* Grade */}
                <div className="flex flex-col w-full gap-2 md:w-1/4">
                    <label className="text-xs text-gray-500">Grade</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("gradeId")}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedGradeId(value ? parseInt(value) : null);
                        }}
                    >
                        <option value="">Select Grade</option>
                        {grades?.map((grade: { id: number; level: string }) => (
                            <option value={grade.id} key={grade.id}>
                                {grade.level}
                            </option>
                        ))}
                    </select>
                    {errors.gradeId?.message && (
                        <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>
                    )}
                </div>

                {/* Subject */}
                <div className="flex flex-col w-full gap-2 md:w-1/4">
                    <label className="text-xs text-gray-500">Subject</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("subjectId")}
                    >
                        <option value="">Select Subject</option>
                        {filteredSubjects.map((subject: { id: number; name: string }) => (
                            <option value={subject.id} key={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    {errors.subjectId?.message && (
                        <p className="text-xs text-red-400">{errors.subjectId.message.toString()}</p>
                    )}
                </div>

                {/* Max Marks */}
                <InputField
                    label="Max Marks"
                    name="maxMarks"
                    register={register}
                    error={errors?.maxMarks}
                    type="number"
                />

                {/* Hidden ID field if updating */}
                {data && (
                    <InputField
                        label="Id"
                        name="id"
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}
            </div>

            {selectedDate && examsForDate.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">
                        Exams on {new Date(selectedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </h2>

                    <ul className="space-y-2 text-sm">
                        {examsForDate.map((exam: any) => (
                            <li key={exam.id} className="border p-2 rounded-md">
                                <div><strong>{exam.title}</strong> at {new Date(`1970-01-01T${exam.examGradeSubjects[0]?.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {exam.examGradeSubjects.map((egs: any) => (
                                    <div key={egs.id} className="text-xs text-gray-600">
                                        Grade: {egs.Grade?.level}, Subject: {egs.Subject?.name}, Marks: {egs.maxMarks}
                                    </div>
                                ))}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-4">
                <button className="p-2 text-white bg-blue-400 rounded-md">
                    {type === "create" ? "Create" : "Update"}
                </button>

                {type === "update" && (
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this exam?")) {
                                onDelete(data.id)
                                    .then(() => {
                                        setOpen(false);
                                        router.refresh();
                                    })
                                    .catch((err) => {
                                        toast.error(err.message || "Failed to delete exam");
                                    });
                            }
                        }}
                        className="p-2 text-white bg-red-500 rounded-md"
                    >
                        Delete
                    </button>
                )}
            </div>

        </form>
    );
};

export default ExamForm;
