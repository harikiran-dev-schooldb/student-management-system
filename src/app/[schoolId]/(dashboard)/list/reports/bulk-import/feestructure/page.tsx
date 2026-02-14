import BulkFeeStructureUpload from "@/components/BulkUpload/feestructure";
import SampleCSVPreview from "@/components/SampleCSVPreview";

export default function ReportsPage() {
  return (
    <div className="">
      <BulkFeeStructureUpload />
      <div className="mt-10">
        <SampleCSVPreview type="feestructure" />

      </div>
    </div>
  );
}
