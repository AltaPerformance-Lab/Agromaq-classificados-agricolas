'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon, UserPlusIcon } from '@heroicons/react/24/solid';

const Paginator = ({ currentPage, totalPages }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const createPageUrl = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        return `/admin/users?${params.toString()}`;
    };

    return (
        <nav className="flex items-center justify-center space-x-2">
            {pages.map(page => (
                <Link key={page} href={createPageUrl(page)} className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === page ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    {page}
                </Link>
            ))}
        </nav>
    );
};

export default function UsersClient({ initialUsers, totalPages, currentPage }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (search) {
                params.set('search', search);
            } else {
                params.delete('search');
            }
            params.set('page', '1');
            router.push(`/admin/users?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, router, searchParams]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Utilizadores</h1>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar por nome ou email..."
                    className="w-full md:w-2/3 lg:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Registo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {initialUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/users/${user.id}`} className="text-yellow-600 hover:text-yellow-900">
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && <div className="p-4"><Paginator currentPage={currentPage} totalPages={totalPages} /></div>}
            </div>
        </div>
    );
}
