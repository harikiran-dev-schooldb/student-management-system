import { useParams } from "next/navigation";

export const useSchoolSlug = (): string => {
  const { schoolId } = useParams<{ schoolId: string }>();

  if (!schoolId) {
    throw new Error("Missing schoolId param");
  }

  return schoolId;
};
