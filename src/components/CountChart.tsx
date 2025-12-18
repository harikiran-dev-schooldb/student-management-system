"use client";
import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const CountChart = ({ male, female }: { male: number; female: number }) => {
    const data = [
        { name: "Total", count: male + female, fill: "white" },
        { name: "Female", count: male, fill: "#FAE27C" },
        { name: "Male", count: female, fill: "#C3EBFA" },
    ];

    return (
        <div className="relative w-full h-[75%]">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="100%"
                    barSize={28}
                    data={data}
                >
                    <RadialBar
                        background={{ fill: "#1f2937" }} // Dark background for bars
                        dataKey="count"
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <img
                src="/maleFemale.png"
                alt=""
                width={70}
                height={70}
                className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            />
        </div>
    );
};

export default CountChart;
