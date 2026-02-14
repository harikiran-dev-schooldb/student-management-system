import BulkGradeUpload from "@/components/BulkUpload/grades";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkGradeUpload />
      <div className="mt-10">
        <SampleCSVPreview type="grades" />

      </div>
    </div>
  );
}
