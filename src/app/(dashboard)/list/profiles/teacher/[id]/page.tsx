import Messages from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import TeacherTimetableContainer from "@/components/TeacherTimetableContainer";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  Calendar, 
  Droplets, 
  BookOpen, 
  Users, 
  GraduationCap, 
  CalendarDays,
  ExternalLink
} from "lucide-react";

interface TeacherSinglePageProps {
  params: Promise<{ id: string }>;
}

/* --- UI Tokens --- */
const cardClass = 
  "bg-white dark:bg-[#121727] rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:shadow-md";

const metricCardClass = 
  "bg-white dark:bg-[#121727] p-4 rounded-xl border border-gray-200/50 dark:border-gray-800 shadow-sm flex items-center gap-4 min-w-[140px] flex-1 transition-transform hover:-translate-y-1";

export default async function TeacherProfilePage({ params }: TeacherSinglePageProps) {
  const { id } = await params;
  
  // Fetch current user role to conditionally render Edit button
  const { role } = await fetchUserInfo();

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          Grade: true,
          _count: { select: { students: true, lessons: true } },
        },
      },
      _count: { select: { subjects: true, lessons: true } },
    },
  });

  if (!teacher) return notFound();

  const totalStudents = teacher.class?._count?.students ?? 0;

  return (
    <div className="flex flex-col flex-1 gap-6 p-6 xl:flex-row bg-gray-50/50 dark:bg-[#0d1117] min-h-screen">
      
      {/* ================= LEFT COLUMN (Profile, Metrics, Schedule) ================= */}
      <div className="w-full xl:w-3/4 space-y-6">
        
        {/* 1. TOP SECTION: Profile + Metrics */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* A. Profile Card */}
          <div className={`${cardClass} flex flex-1 flex-col sm:flex-row gap-6 p-6 items-start relative`}>
             
             {/* Avatar Area */}
            <div className="relative shrink-0 mx-auto sm:mx-0 group">
               <div className="w-28 h-28 rounded-full ring-4 ring-indigo-50 dark:ring-indigo-900/20 overflow-hidden relative">
                 <Image
                   src={teacher.img || (teacher.gender === "Male" ? "/maleteacher.png" : "/femaleteacher.png")}
                   alt={teacher.name}
                   fill
                   className="object-cover transition-transform group-hover:scale-105"
                 />
               </div>
               
               {/* Admin Edit Button */}
               {role === "admin" && (
                 <div className="absolute -bottom-2 -right-2 z-10">
                    <FormContainer table="teacher" type="update" data={teacher} />
                 </div>
               )}
            </div>

            {/* Info Area */}
            <div className="flex flex-col flex-1 gap-5 w-full">
              <div className="text-center sm:text-left border-b border-gray-100 dark:border-gray-800 pb-4">
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {teacher.name}
                 </h1>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                      ID: {teacher.id}
                    </span>
                 </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <InfoRow icon={Mail} label="Email" value={teacher.email || "N/A"} />
                 <InfoRow icon={Phone} label="Phone" value={teacher.phone || "N/A"} />
                 <InfoRow 
                    icon={Calendar} 
                    label="Birthday" 
                    value={teacher.dob ? new Intl.DateTimeFormat("en-GB").format(new Date(teacher.dob)) : "N/A"} 
                 />
                 <InfoRow icon={Droplets} label="Blood Type" value={teacher.bloodType || "N/A"} />
              </div>
            </div>
          </div>

          {/* B. Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1 lg:max-w-md">
            
            {/* Class Metric */}
            <MetricItem 
              icon={GraduationCap} 
              value={teacher.class?.name || "N/A"} 
              label="Class" 
              color="indigo"
            />

            {/* Students Metric */}
            <MetricItem 
              icon={Users} 
              value={totalStudents} 
              label="Students" 
              color="emerald"
            />

            {/* Subjects Metric */}
            <MetricItem 
              icon={BookOpen} 
              value={teacher._count.subjects} 
              label="Subjects" 
              color="rose"
            />

            {/* Lessons Metric */}
            <MetricItem 
              icon={CalendarDays} 
              value={teacher._count.lessons} 
              label="Lessons" 
              color="sky"
            />

          </div>
        </div>

        {/* 2. TIMETABLE SECTION */}
        <div className={`${cardClass} p-6`}>
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <Calendar className="text-indigo-600" size={20} />
                 Weekly Schedule
              </h3>
           </div>
           <TeacherTimetableContainer teacherId={teacher.id} />
        </div>
      </div>

      {/* ================= RIGHT COLUMN (Widgets) ================= */}
      <div className="flex flex-col w-full gap-6 xl:w-1/4">
        
        {/* Shortcuts Widget */}
        <div className={`${cardClass} p-5`}>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
            Quick Actions
          </h2>

          <div className="flex flex-col gap-2">
            <Shortcut
              href={`/list/classes?supervisorId=${teacher.id}`}
              label="My Classes"
              icon={GraduationCap}
            />
            <Shortcut
              href={`/list/users/students?teacherId=${teacher.id}`}
              label="My Students"
              icon={Users}
            />
            <Shortcut
              href={`/list/lessons?teacherId=${teacher.id}`}
              label="My Lessons"
              icon={BookOpen}
            />
          </div>
        </div>

        {/* Announcements Widget */}
        <div className={`${cardClass} p-5`}>
           <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
            Announcements
          </h2>
          <Messages />
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

/* 1. Info Row for Profile Card */
const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
      <Icon size={16} />
    </div>
    <div className="flex flex-col">
       <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
       <span className="font-medium text-gray-900 dark:text-gray-200 truncate max-w-[180px]" title={value}>
         {value}
       </span>
    </div>
  </div>
);

/* 2. Metric KPI Item */
const MetricItem = ({ icon: Icon, value, label, color }: { icon: any, value: string | number, label: string, color: string }) => {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20",
    sky: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20",
  };

  return (
    <div className={metricCardClass}>
      <div className={`p-2.5 rounded-full ${colors[color]}`}>
         <Icon size={24} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[100px]" title={String(value)}>
            {value}
        </h2>
        <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
      </div>
    </div>
  );
};

/* 3. Shortcut Button */
const Shortcut = ({ href, label, icon: Icon }: { href: string; label: string, icon: any }) => (
  <Link
    href={href}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all group"
  >
    <div className="p-1.5 bg-white dark:bg-gray-700 rounded-md shadow-sm group-hover:shadow-none transition-shadow">
       <Icon size={14} />
    </div>
    <span className="text-sm font-medium">{label}</span>
    <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
  </Link>
);