"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

const screenshots = [
  {
    src: "/screenshots/admin-dashboard.png",
    title: "Admin Dashboard",
    caption: "Complete overview of students, teachers, attendance, and fees",
  },
  {
    src: "/screenshots/attendance.png",
    title: "Attendance Management",
    caption: "Teachers and admins can mark attendance without delays",
  },
  {
    src: "/screenshots/students.png",
    title: "Student Management",
    caption: "Centralized student profiles with academic and fee records",
  },
  {
    src: "/screenshots/fees.png",
    title: "Fees Management",
    caption: "Clear tracking of paid and pending fees",
  },
];

export default function ScreenshotCarousel() {
  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{ delay: 3000 }}
      spaceBetween={24}
      slidesPerView={1}
      loop
      breakpoints={{
        768: { slidesPerView: 2 },
      }}
    >
      {screenshots.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <img
              src={item.src}
              alt={item.title}
              className="rounded-md mb-4"
            />
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.caption}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
