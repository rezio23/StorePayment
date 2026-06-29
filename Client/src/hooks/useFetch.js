import { useEffect, useState } from 'react';

export function useFetch(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) {
        setLoading(false);
        return;
        }

        const controller = new AbortController();

        const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            });

            if (!response.ok) {
            throw new Error(response.statusText || 'Request failed');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            if (err.name !== 'AbortError') {
            setError(err.message);
            }
        } finally {
            setLoading(false);
        }
        };

        fetchData();

        return () => controller.abort();
    }, [url]);

    return { data, loading, error };
}
