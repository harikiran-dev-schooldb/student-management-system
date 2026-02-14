"use server";

import { revalidatePath } from "next/cache";
import { FeesSchema } from "./formValidationSchemas";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { CurrentState } from "../../types";

const client = await clerkClient();

// Initialize Prisma Client
const prisma = new PrismaClient();

const deleteAdmin = async (id: number) => {
  try {
    const response = await fetch(`/api/admin/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      console.log("Admin deleted successfully");
    } else {
      console.error("Failed to delete admin:", data.message);
    }
  } catch (error) {
    console.error("Error deleting admin:", error);
  }
};

// * ---------------------------------------------- SUBJECT SCHEMA --------------------------------------------------------

// * Example deleteMessages function
export const deleteSubject = async (prevState: any, formData: FormData) => {
  const id = formData.get("id");
  const numericId = Number(id);
  if (!numericId) {
    return {
      success: false,
      error: true,
      message: "No ID provided",
    };
  }

  try {
    await prisma.subject.delete({ where: { id: numericId } });
    return { success: true, error: false };
  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      error: true,
      message: "Delete failed",
    };
  }
};

// * ---------------------------------------------- MESSAGE SCHEMA --------------------------------------------------------
// * Example deleteMessages function
export const deleteMessages = async (prevState: any, formData: FormData) => {
  const id = formData.get("id")?.toString();
  if (!id) {
    return {
      success: false,
      error: true,
      message: "No ID provided",
    };
  }

  try {
    await prisma.messages.delete({ where: { id } });
    return { success: true, error: false };
  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      error: true,
      message: "Delete failed",
    };
  }
};

// * ---------------------------------------------- ANNOUNCEMENTS SCHEMA --------------------------------------------------------

// * Example deleteMessages function
export const deleteAnnouncements = async (
  prevState: any,
  formData: FormData,
) => {
  const id = formData.get("id")?.toString();
  const numericId = Number(id); // ✅ Convert to number

  if (!numericId || isNaN(numericId)) {
    return {
      success: false,
      error: true,
      message: "Invalid ID provided",
    };
  }

  try {
    await prisma.announcement.delete({ where: { id: numericId } }); // ✅ Use number
    return { success: true, error: false };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return {
      success: false,
      error: true,
      message: "Delete failed",
    };
  }
};

// // * ---------------------------------------------- FEES SCHEMA --------------------------------------------------------

// export const createFees = async (
//   currentState: CurrentState,
//   data: FeesSchema,
//   schoolId: string,
// ) => {
//   try {
//     await prisma.feeStructure.create({
//       data: {
//         gradeId: data.gradeId, // ✅ gradeId is the primary key
//         term: data.term,
//         academicYear: data.academicYear,
//         startDate: data.startDate,
//         dueDate: data.dueDate,
//         termFees: data.termFees,
//         abacusFees: data.abacusFees,
//         schoolId, // 🔒 REQUIRED for multi-tenancy
//       },
//     });
//     console.log("Fees Created:", data);
//     return { success: true };
//   } catch (error) {
//     console.error("Error in creating Fees:", error);
//     return { success: false, error: (error as any).message };
//   }
// };

// export const updateFees = async (
//   currentState: CurrentState,
//   data: FeesSchema,
// ) => {
//   try {
//     const id = data.id;

//     // ✅ Step 1: Check if the homework exists
//     const existingFees = await prisma.feeStructure.findFirst({
//       where: {
//         id: id,
//         schoolId,
//       },
//     });

//     if (!existingFees) {
//       return { success: false, error: "Fees not found" };
//     }

//     // ✅ Step 2: Update only the fields that are provided
//     const updatedFees = await prisma.feeStructure.update({
//       where: { id: id },
//       data: {
//         gradeId: data.gradeId ?? existingFees.gradeId,
//         term: data.term ?? existingFees.term,
//         academicYear: data.academicYear ?? existingFees.academicYear,
//         startDate: data.startDate ?? existingFees.startDate,
//         dueDate: data.dueDate ?? existingFees.dueDate,
//         termFees: data.termFees ?? existingFees.termFees,
//         abacusFees: data.abacusFees ?? existingFees.abacusFees,
//         schoolId, // 🔒 Ensure schoolId is included for multi-tenancy
//       },
//     });

//     console.log("Updated Data:", updatedFees);
//     return { success: true, data: updatedFees };
//   } catch (error) {
//     console.error("Error in update Fees:", error);
//     return { success: false, error: (error as any).message };
//   }
// };

// export const deleteFees = async (
//   currentState: CurrentState,
//   data: FormData,
// ) => {
//   const id = data.get("id") as string;
//   console.log("Receved Fees Id:", data);

//   try {
//     await prisma.feeStructure.deleteMany({
//       where: {
//         id: parseInt(id),
//         schoolId,
//       },
//     });

//     console.log("Deleted Fees:", data);
//     // revalidatePath("/list/admin")
//     return { success: true, error: false };
//   } catch (err) {
//     console.log(err);
//     return { success: false, error: true };
//   }
// };

// * ---------------------------------------------- HOMEWORK SCHEMA --------------------------------------------------------

export const deleteHomework = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  console.log("Deleted Homework:", data);

  try {
    await prisma.homework.delete({
      where: { id: parseInt(id) },
    });

    console.log("Deleted Homework:", data);
    // revalidatePath("/list/admin")
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleted Data:", data);
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// * ---------------------------------------------- TEACHER SCHEMA --------------------------------------------------------

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    // Initialize Clerk client by awaiting clerkClient()
    const client = await clerkClient();

    await client.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // Log success message
    console.log(`User with ID ${id} deleted successfully`);

    // revalidatePath("/list/teachers")
    return {
      success: true,
      error: false,
      message: "Deleted user successfully",
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: "An error occurred while deleting the user",
    };
  }
};

// * ---------------------------------------------- STUDENT SCHEMA --------------------------------------------------------

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;

  try {
    // 1. Fetch clerk_id for the student
    const student = await prisma.student.findUnique({
      where: { id },
      select: { clerk_id: true },
    });

    if (!student) {
      return {
        success: false,
        error: true,
        message: "Student not found in database",
      };
    }

    // 2. Initialize Clerk client
    const client = await clerkClient();

    // 3. Delete user from Clerk if clerk_id exists
    if (student.clerk_id) {
      await client.users.deleteUser(student.clerk_id);
    }

    // 4. Delete student from Prisma
    await prisma.student.delete({
      where: { id },
    });

    console.log(
      `Student with ID ${id} and Clerk ID ${student.clerk_id} deleted successfully`,
    );
    revalidatePath("/list/users/students");
    return {
      success: true,
      error: false,
      message: "Deleted user successfully",
    };
  } catch (err) {
    console.error("Error deleting student:", err);
    return {
      success: false,
      error: true,
      message: "An error occurred while deleting the user",
    };
  }
};

// * ---------------------------------------------- EXAM SCHEMA --------------------------------------------------------

// export const createExam = async (
//     currentState: CurrentState,
//     data: ExamSchema
// ) => {
//     try {
//         await prisma.exam.create({
//             data: {
//                 title: data.title,
//                 date: data.date,
//                 classId: data.classId,    // Ensure classId is included
//             },
//         });

//         console.log(`Created Exam: [Title: ${data.title}, Date: ${data.date}, Lesson ID: ${data.lessonId}, Class ID: ${data.classId}]`);

//         return { success: true, error: false };
//     } catch (err) {
//         console.error("Error creating exam:", err);
//         return { success: false, error: true };
//     }
// };

// export const updateExam = async (
//     currentState: CurrentState,
//     data: ExamSchema
// ) => {
//     try {
//         await prisma.exam.update({
//             where: {
//                 id: data.id,
//             },
//             data: {
//                 title: data.title,
//                 date: data.date,
//                 classId: data.classId,    // Ensure classId is updated
//             },
//         });

//         console.log(`Updated Exam: [ID: ${data.id}, Title: ${data.title}, Date: ${data.date}, Lesson ID: ${data.lessonId}, Class ID: ${data.classId}]`);

//         return { success: true, error: false };
//     } catch (err) {
//         console.error("Error updating exam:", err);
//         return { success: false, error: true };
//     }
// };

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Deleted Exam:", data);

    // revalidatePath("/list/subjects")
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
