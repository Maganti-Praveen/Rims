import { useState, useEffect } from 'react';
import API from '../api/axios';

const useAcademicYears = () => {
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await API.get('/academic-years');
                setAcademicYears((data.data || []).map((y) => y.label));
            } catch {
                // Fallback to hardcoded if API fails
                setAcademicYears(['2020-21', '2021-22', '2022-23', '2023-24', '2024-25', '2025-26', '2026-27']);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { academicYears, loading };
};

export default useAcademicYears;
