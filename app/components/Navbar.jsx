'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
// Assumindo que estes componentes já existem e estão estilizados
import { Dropdown, NavLink, ResponsiveNavLink } from './LayoutComponents'; 

// --- NOVO: Componente do Logo com SVG para melhor performance e acessibilidade ---
const Logo = () => (
    <Link href="/" className="text-2xl font-bold text-gray-900 flex items-center group">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 mr-2 text-green-600 group-hover:animate-bounce" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M18 6L18 10" />
            <path d="M7 18c-2.2 0-4-1.8-4-4v-4c0-2.2 1.8-4 4-4h10c2.2 0 4 1.8 4 4v4c0 2.2-1.8 4-4 4H7z" />
            <circle cx="7" cy="18" r="3" />
            <circle cx="17" cy="18" r="3" />
        </svg>
        <span>Agro<span className="text-yellow-500">Maq</span></span>
    </Link>
);


export default function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;

    const pathname = usePathname();
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="shrink-0 flex items-center">
                            <Logo />
                        </div>
                        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                            <NavLink href="/" active={pathname === '/'}>Página Inicial</NavLink>
                            <NavLink href="/blog" active={pathname.startsWith('/blog')}>Blog AgroMaq</NavLink>
                            {user && (
                                <>
                                    <NavLink href="/dashboard" active={pathname.startsWith('/dashboard')}>O Meu Painel</NavLink>
                                    {/* <NavLink href="/wallet" active={pathname === '/wallet'}>Minha Carteira</NavLink> */}
                                    {user.role === 'ADMIN' && (
                                        <NavLink href="/admin/dashboard" active={pathname.startsWith('/admin')}>Administração</NavLink>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="hidden sm:flex sm:items-center sm:ms-6">
                        <Link href="/anunciar/maquina" className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-sm mr-6">
                            Anuncie Agora
                        </Link>
                        {user ? (
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button type="button" className="inline-flex items-center px-3 py-2 border border-transparent text-base leading-4 font-medium rounded-md text-gray-600 bg-white hover:text-gray-800 focus:outline-none transition ease-in-out duration-150">
                                                {user.name}
                                                <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href="/dashboard">O Meu Painel</Dropdown.Link>
                                        <Dropdown.Link href="/profile">Perfil</Dropdown.Link>
                                        <button onClick={() => signOut({ callbackUrl: '/' })} className={'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out'}>
                                            Sair
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link href="/login" className="text-base font-semibold text-gray-600 hover:text-gray-900">Entrar</Link>
                                <Link href="/register" className="text-base font-semibold text-gray-600 hover:text-gray-900">Registar</Link>
                            </div>
                        )}
                    </div>
                    
                    {/* --- Menu Hamburger para Dispositivos Móveis --- */}
                    <div className="-me-2 flex items-center sm:hidden">
                       <button 
                            onClick={() => setShowingNavigationDropdown((p) => !p)} 
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            aria-controls="mobile-menu"
                            aria-expanded={showingNavigationDropdown}
                        >
                            <span className="sr-only">Abrir menu principal</span>
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Painel do Menu para Dispositivos Móveis --- */}
            <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden border-t border-gray-200`} id="mobile-menu">
                <div className="pt-2 pb-3 space-y-1">
                    <ResponsiveNavLink href="/" active={pathname === '/'}>Página Inicial</ResponsiveNavLink>
                    <ResponsiveNavLink href="/blog" active={pathname.startsWith('/blog')}>Blog AgroMaq</ResponsiveNavLink>
                     {user && (
                        <>
                            <ResponsiveNavLink href="/dashboard" active={pathname.startsWith('/dashboard')}>O Meu Painel</ResponsiveNavLink>
                            {user.role === 'ADMIN' && (
                                <ResponsiveNavLink href="/admin/dashboard" active={pathname.startsWith('/admin')}>Administração</ResponsiveNavLink>
                            )}
                        </>
                    )}
                </div>
                
                {/* Opções do Utilizador no Menu Móvel */}
                <div className="pt-4 pb-1 border-t border-gray-200">
                    {user ? (
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>
                    ) : (
                        <div className="px-4">
                             <Link href="/anunciar/maquina" className="w-full text-center block bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-sm mb-4">
                                Anuncie Agora
                            </Link>
                        </div>
                    )}
                    <div className="mt-3 space-y-1">
                        {user ? (
                             <>
                                <ResponsiveNavLink href="/profile">Perfil</ResponsiveNavLink>
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="block w-full text-start ps-3 pe-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out">
                                    Sair
                                </button>
                            </>
                        ) : (
                             <>
                                <ResponsiveNavLink href="/login">Entrar</ResponsiveNavLink>
                                <ResponsiveNavLink href="/register">Registar</ResponsiveNavLink>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
