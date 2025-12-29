import UploadStudentsPage from "@/components/BulkUpload/students";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <UploadStudentsPage />
      <div className="mt-10">
        <SampleCSVPreview type="student" />
      </div>
    </div>
  );
}
