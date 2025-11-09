'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    ChartBarIcon,
    UsersIcon,
    NewspaperIcon,
    CreditCardIcon,
    ArrowLeftOnRectangleIcon,
    MegaphoneIcon,
    BookOpenIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

const Logo = () => (
    <Link href="/" className="text-2xl font-bold text-white flex items-center group mb-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L18 10" /><path d="M7 18c-2.2 0-4-1.8-4-4v-4c0-2.2 1.8-4 4-4h10c2.2 0 4 1.8 4 4v4c0 2.2-1.8 4-4 4H7z" /><circle cx="7" cy="18" r="3" /><circle cx="17" cy="18" r="3" />
        </svg>
        <span>Agro<span className="text-yellow-400">Maq</span></span>
    </Link>
);

const NavItem = ({ href, icon, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors ${isActive ? 'bg-gray-900 text-white' : ''}`}>
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );
};

export default function AdminSidebar({ user }) {
    return (
        <aside className="w-64 bg-gray-800 text-white flex-col hidden sm:flex">
            <div className="p-6">
                <Logo />
            </div>
            <nav className="flex-1 px-4 space-y-2">
                <NavItem href="/admin/dashboard" icon={<ChartBarIcon className="h-6 w-6" />}>Dashboard</NavItem>
                <NavItem href="/admin/anuncios" icon={<NewspaperIcon className="h-6 w-6" />}>Gestão de Anúncios</NavItem>
                <NavItem href="/admin/users" icon={<UsersIcon className="h-6 w-6" />}>Gestão de Utilizadores</NavItem>
                <NavItem href="/admin/blog/novo" icon={<PencilSquareIcon className="h-6 w-6" />}>Criar Artigo</NavItem>
                {/* Adicionar link para a página de gestão de artigos no futuro */}
                {/* <NavItem href="/admin/blog" icon={<BookOpenIcon className="h-6 w-6" />}>Gerir Blog</NavItem> */}
                <NavItem href="/admin/ads" icon={<MegaphoneIcon className="h-6 w-6" />}>Publicidade</NavItem>
            </nav>
            <div className="p-4 border-t border-gray-700">
                 <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                    <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                    <span className="ml-3">Sair</span>
                </button>
            </div>
        </aside>
    );
}