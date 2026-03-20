"use client";

import { useEffect, useState } from "react";
import ReportLayout from "@/components/reports/ReportLayout";
import ReportTable from "@/components/reports/ReportTable";
import { tenantFetch } from "@/lib/tenantFetch";
import { useSchoolSlug } from "@/components/hooks/getschool";

export default async function OutstandingReport() {
  const [data, setData] = useState([]);
  const schoolId = await useSchoolSlug();

  useEffect(() => {
    tenantFetch(schoolId, "/reports/fees/outstanding")
      .then((res) => setData(res.data));
  }, []);

  return (
    <ReportLayout
      title="Outstanding Fees"
      description="Students with pending dues"
    >
      <ReportTable
        columns={[
          { key: "name", label: "Student", render: (r:any) => r.student.name },
          { key: "dueAmount", label: "Due Amount" },
        ]}
        data={data}
      />
    </ReportLayout>
  );
}