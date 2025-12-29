import BulkSubjectUpload from "@/components/BulkUpload/subjects";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkSubjectUpload />
      <div className="mt-10">
        <SampleCSVPreview type="subjects" />
      </div>
    </div>
  );
}
