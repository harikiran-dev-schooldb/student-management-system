import BulkTeacherUpload from "@/components/BulkUpload/teachers";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkTeacherUpload />
      <div className="mt-10">
        <SampleCSVPreview type="teacher" />
      </div>
    </div>
  );
}
