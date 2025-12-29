import BulkExamUpload from "@/components/BulkUpload/exams";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkExamUpload />
      <div className="mt-10">
        <SampleCSVPreview type="exams" />
      </div>
    </div>
  );
}
