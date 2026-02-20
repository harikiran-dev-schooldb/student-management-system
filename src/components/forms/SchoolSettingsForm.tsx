"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { SchoolInfo } from "@prisma/client";
import {
  Building,
  MapPin,
  Phone,
  Globe,
  Mail,
  Save,
  X,
  Edit2,
  FileText,
  Receipt,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface Props {
  initialData: SchoolInfo | null;
  userRole: string | null;
}

type SchoolFormValues = {
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;

  // Extended fields
  taxId?: string | null;
  receiptHeader?: string | null;
  receiptFooter?: string | null;
};

const SchoolSettingsForm = ({ initialData, userRole }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isAdmin = userRole === "admin";

  const { register, handleSubmit, reset, watch } = useForm<SchoolFormValues>({
    defaultValues: initialData
      ? {
          ...initialData,
          taxId: (initialData as any).taxId ?? "",
          receiptHeader: (initialData as any).receiptHeader ?? "",
          receiptFooter: (initialData as any).receiptFooter ?? "",
        }
      : {
          name: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          logo: "",
          taxId: "",
          receiptHeader: "",
          receiptFooter: "Fees once paid are not refundable.",
        },
  });

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  const logoUrl = watch("logo");

  const onSubmit = async (data: Partial<SchoolInfo>) => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/public/school/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      toast.success("School configuration updated!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error("Error saving school info. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      {/* 1. Dynamic Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Building size={120} />
        </div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
              <Building className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isAdmin ? "School Management" : "School Profile"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {isAdmin
                  ? "Configure institutional branding & metadata"
                  : "Official contact and identity details"}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="group flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Edit2 size={18} />
                  <span className="font-semibold">Edit Configuration</span>
                </button>
              ) : (
                <div className="flex gap-2 animate-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset(initialData || {});
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md disabled:opacity-50 font-semibold active:scale-95"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Info */}
        <div className="xl:col-span-2 space-y-6">
          <Section
            cardTitle="Identity Details"
            icon={<FileText size={20} className="text-blue-500" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Official School Name"
                name="name"
                register={register}
                disabled={!isEditing}
                icon={<Building size={18} />}
                placeholder="Enter school name"
              />
              <InputGroup
                label="Tax / Registration ID"
                name="taxId"
                register={register}
                disabled={!isEditing}
                icon={<FileText size={18} />}
                placeholder="e.g. REG-123456"
              />
              <div className="md:col-span-2">
                <InputGroup
                  label="Public Logo URL"
                  name="logo"
                  register={register}
                  disabled={!isEditing}
                  icon={<ImageIcon size={18} />}
                  placeholder="https://your-cloud-storage.com/logo.png"
                />
              </div>
            </div>
          </Section>

          <Section
            cardTitle="Contact Information"
            icon={<MapPin size={20} className="text-orange-500" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Phone Number"
                name="phone"
                register={register}
                disabled={!isEditing}
                icon={<Phone size={18} />}
              />
              <InputGroup
                label="Official Email"
                name="email"
                register={register}
                disabled={!isEditing}
                icon={<Mail size={18} />}
              />
              <div className="md:col-span-2">
                <InputGroup
                  label="Website Link"
                  name="website"
                  register={register}
                  disabled={!isEditing}
                  icon={<Globe size={18} />}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                  Campus Address
                </label>
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-4 text-gray-400"
                    size={18}
                  />
                  <textarea
                    {...register("address")}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                    placeholder="Full physical address..."
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT COLUMN: Branding & Configuration */}
        <div className="space-y-6">
          {/* Logo Preview Section */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center justify-center text-center shadow-sm relative group">
            <div className="absolute top-4 right-4">
              {initialData?.website && (
                <a
                  href={initialData.website}
                  target="_blank"
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
              Live Branding Preview
            </h3>
            <div className="relative w-40 h-40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950/50 group-hover:border-indigo-300 transition-colors">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <ImageIcon size={48} className="text-gray-300" />
              )}
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {watch("name") || "School Name"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Official Institutional Logo
              </p>
            </div>
          </div>

          <Section
            cardTitle="Receipts & Printing"
            icon={<Receipt size={20} className="text-emerald-500" />}
          >
            <div className="space-y-5">
              <InputGroup
                label="Header Text"
                name="receiptHeader"
                register={register}
                disabled={!isEditing}
                icon={<Building size={18} />}
              />
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">
                  Receipt Footer Note
                </label>
                <textarea
                  {...register("receiptFooter")}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-70"
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </form>
  );
};

// --- Polished Sub-Components ---

const Section = ({
  cardTitle,
  icon,
  children,
}: {
  cardTitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
    <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3 bg-gray-50/30 dark:bg-white/5">
      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        {icon}
      </div>
      <h2 className="font-bold text-gray-800 dark:text-white tracking-tight">
        {cardTitle}
      </h2>
    </div>
    <div className="p-6 flex-1">{children}</div>
  </div>
);

interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  name: keyof SchoolFormValues;
  register: UseFormRegister<SchoolFormValues>;
  disabled: boolean;
  placeholder?: string;
}

const InputGroup = ({
  label,
  icon,
  name,
  register,
  disabled,
  placeholder,
}: InputGroupProps) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest leading-none">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        {...register(name)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all outline-none text-sm font-medium
          ${
            disabled
              ? "border-transparent bg-gray-50/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 cursor-not-allowed"
              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
          }
        `}
      />
    </div>
  </div>
);

export default SchoolSettingsForm;
