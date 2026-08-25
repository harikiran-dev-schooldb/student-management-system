"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  IndianRupee,
  Layers3,
  School,
  Users,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const operations = [
  { title: "Students", description: "Add or update student records in bulk.", href: "/list/reports/bulk-import/students", icon: GraduationCap },
  { title: "Teachers", description: "Import and update teaching staff records.", href: "/list/reports/bulk-import/teachers", icon: UserRound },
  { title: "Grades", description: "Import grade definitions and academic levels.", href: "/list/reports/bulk-import/grades", icon: School },
  { title: "Classes & Sections", description: "Create school classes and sections from a template.", href: "/list/reports/bulk-import/classes", icon: Users },
  { title: "Subjects", description: "Import subjects and academic subject mappings.", href: "/list/reports/bulk-import/subjects", icon: Layers3 },
  { title: "Fee Structure", description: "Import fee structures for the academic year.", href: "/list/reports/bulk-import/feestructure", icon: IndianRupee },
  { title: "Fee Collection", description: "Import historical or external fee collection data.", href: "/list/reports/bulk-import/feecollection", icon: IndianRupee },
  { title: "Timetable", description: "Import timetable and lesson assignments.", href: "/list/reports/bulk-import/lessons", icon: CalendarDays },
  { title: "Exams", description: "Prepare bulk exam setup and schedules.", href: "/list/exams", icon: ClipboardList, planned: true },
  { title: "Marks", description: "Upload marks for an entire class and exam.", href: "/list/results/marks-entry", icon: BookOpen, planned: true },
];

export default function BulkOperationsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Bulk Operations</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Import and update school data using structured templates. Choose an operation below to start.
        </p>
      </div>

      <Card className="premium-card rounded-2xl border-0">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-primary/[0.04] p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">Recommended workflow</p>
              <p className="mt-1 text-xs text-muted-foreground">Download template → fill data → upload → validate → review → import.</p>
            </div>
            <span className="w-fit rounded-full bg-background px-3 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Safe import</span>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {operations.map((operation) => {
          const Icon = operation.icon;
          const available = !operation.planned;

          return (
            <Card key={operation.title} className="premium-card group rounded-2xl border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="size-5" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${available ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {available ? "Available" : "Coming next"}
                  </span>
                </div>

                <h2 className="mt-5 text-base font-bold tracking-tight">{operation.title}</h2>
                <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">{operation.description}</p>

                <div className="mt-5">
                  {available ? (
                    <Link href={operation.href} className="group/link inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open operation
                      <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">Planned next</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
