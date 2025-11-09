import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AdminSidebar from './AdminSidebar'; // O nosso novo componente de menu lateral

export default async function AdminLayout({ children }) {
    const session = await getServerSession(authOptions);

    // Segurança: Garante que apenas administradores acedam a qualquer página dentro de /admin
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* O menu lateral fixo */}
            <AdminSidebar user={session.user} />

            {/* A área de conteúdo principal que irá mudar */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
