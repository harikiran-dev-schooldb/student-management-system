import BulkLessonsUpload from "@/components/BulkUpload/lessons";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkLessonsUpload />
      <div className="mt-10">
        <SampleCSVPreview type="lessons" />
      </div>
    </div>
  );
}
