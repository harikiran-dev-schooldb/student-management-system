// src/components/StudentsList.tsx
"use client"; // Ensure this component is rendered on the client

import React, { useEffect, useState } from 'react';
import { useSchoolSlug } from './hooks/getschool';

// Define the type for a student
interface Student {
    id: number;
    name: string;
    grade: string;
    mobileNumber: string;
    dateOfBirth: string; // Add any other properties you need
    address: string; // Add any other properties you need
}

const StudentsList = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const schoolId = useSchoolSlug();

    const fetchStudents = async () => {
        if (!schoolId) return;
        try {
            const response = await fetch(`/api/v1/tenants/${schoolId}/students`);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data: Student[] = await response.json();
            setStudents(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</div>;

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
                <tr style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Id</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Grade</th>
                    {/* <th style={{ padding: '8px', border: '1px solid #ddd' }}>Mobile Number</th> */}
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date of Birth</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Address</th>
                </tr>
            </thead>
            <tbody>
                {students.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '8px' }}>{student.id}</td>
                        <td style={{ padding: '8px' }}>{student.name}</td>
                        <td style={{ padding: '8px' }}>{student.grade}</td>
                        {/* <td style={{ padding: '8px' }}>{student.mobileNumber}</td> */}
                        <td style={{ padding: '8px' }}>{new Date(student.dateOfBirth).toLocaleDateString()}</td>
                        <td style={{ padding: '8px' }}>{student.address}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default StudentsList;
