import { getStudents } from "./tools/student.js";

export const tools = {
  getStudents,
};

export const toolDescriptions = `
Available tools:

1. getStudents
   - description: Get students list
   - params:
       class (optional): grade level like "10th"
       schoolId (required): school identifier
`;