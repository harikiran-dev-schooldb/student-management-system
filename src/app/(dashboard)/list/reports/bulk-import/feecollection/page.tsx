import BulkFeesUpload from "@/components/BulkUpload/fees";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkFeesUpload />
      <div className="mt-10">
        <SampleCSVPreview type="feecollection" />
      </div>
    </div>
  );
}
