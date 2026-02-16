"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function FeatureCarousel() {
  const features = [
    {
      title: "Admin Dashboard",
      text: "Real-time overview of students, teachers, attendance, and finances.",
    },
    {
      title: "Attendance Management",
      text: "Teachers and admins can record attendance without delays.",
    },
    {
      title: "Marks & Results",
      text: "Accurate academic records with faster result preparation.",
    },
    {
      title: "Fees Management",
      text: "Transparent tracking of paid and pending fees.",
    },
    {
      title: "Reports & Insights",
      text: "Export-ready reports for audits and management reviews.",
    },
  ];

  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={1}
      breakpoints={{
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {features.map((feature, index) => (
        <SwiperSlide key={index}>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-indigo-600">
              {feature.title}
            </h3>
            <p className="mt-2 text-gray-700">
              {feature.text}
            </p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
