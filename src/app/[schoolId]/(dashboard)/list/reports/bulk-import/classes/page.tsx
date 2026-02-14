import BulkClassUpload from "@/components/BulkUpload/classes";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkClassUpload />
      <div className="mt-10">
        <SampleCSVPreview type="classes" />
      </div>
    </div>
  );
}
