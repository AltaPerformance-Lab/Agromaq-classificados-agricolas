import prisma from '@/lib/prisma';
import UsersClient from './UsersClient'; // O nosso novo componente de cliente

const PAGE_SIZE = 15;

// Busca os utilizadores no servidor com filtros e paginação
async function getUsers(searchParams) {
    const page = parseInt(searchParams.page || '1', 10);
    const query = searchParams.search || '';

    const where = query ? {
        OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
        ],
    } : {};

    const users = await prisma.user.findMany({
        where,
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
    });

    const totalUsers = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

    return { users, totalPages, currentPage: page };
}

export default async function UsersIndexPage({ searchParams }) {
    const { users, totalPages, currentPage } = await getUsers(searchParams);

    return (
        <UsersClient
            initialUsers={users}
            totalPages={totalPages}
            currentPage={currentPage}
        />
    );
}
