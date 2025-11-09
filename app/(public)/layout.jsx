import Navbar from '@/app/components/Navbar';
import HeaderFilters from '@/app/components/HeaderFilters';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function PublicLayout({ children }) {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    return (
        // --- CORREÇÃO: Estrutura Flex para garantir o rodapé no final ---
        <div className="flex flex-col min-h-screen">
            <Navbar user={user} />
            <HeaderFilters />
            {/* A classe 'flex-grow' faz o conteúdo principal empurrar o rodapé para baixo */}
            <main className="flex-grow">{children}</main>
            <footer className="bg-white border-t mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} AgroMaq. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}

