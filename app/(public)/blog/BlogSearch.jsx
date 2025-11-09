'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function BlogSearch({ initialQuery }) {
    const [query, setQuery] = useState(initialQuery || '');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const debounce = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (query) {
                params.set('q', query);
            } else {
                params.delete('q');
            }
            router.replace(`${pathname}?${params.toString()}`);
        }, 500); // Atraso para evitar buscas a cada letra digitada

        return () => clearTimeout(debounce);
    }, [query, pathname, router, searchParams]);

    return (
        <div className="mb-12">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pesquisar artigos..."
                    className="w-full p-4 pl-12 text-lg border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
}
