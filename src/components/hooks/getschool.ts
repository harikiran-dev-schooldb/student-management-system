import { useParams } from "next/navigation";

export const useSchoolSlug = () => {
  const params = useParams();
  return params.schoolId as string;
};
