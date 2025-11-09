'use client';

import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import Link, { LinkProps } from 'next/link';

// --- Dropdown ---

// Tipos para o contexto do Dropdown
interface DropdownContextType {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleOpen: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

// Hook customizado para usar o contexto de forma segura
const useDropdown = () => {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error('useDropdown must be used within a Dropdown provider');
    }
    return context;
};

// Componente Principal do Dropdown
const Dropdown: FC<{ children: ReactNode }> & {
    Trigger: FC<{ children: ReactNode }>;
    Content: FC<{ align?: 'left' | 'right'; width?: string; children: ReactNode }>;
    Link: FC<LinkProps & { className?: string; children: ReactNode }>;
} = ({ children }) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((previousState) => !previousState);

    return (
        <DropdownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropdownContext.Provider>
    );
};

// Subcomponente Trigger
const Trigger: FC<{ children: ReactNode }> = ({ children }) => {
    const { toggleOpen } = useDropdown();
    return <div onClick={toggleOpen}>{children}</div>;
};

// Subcomponente Content
const Content: FC<{ align?: 'left' | 'right'; width?: string; children: ReactNode }> = ({ align = 'right', width = '48', children }) => {
    const { open, setOpen } = useDropdown();
    if (!open) return null;

    const alignmentClasses = align === 'left' ? 'origin-top-left start-0' : 'origin-top-right end-0';
    const widthClass = `w-${width}`;

    return (
        <div 
            className={`absolute z-50 mt-2 ${widthClass} rounded-md shadow-lg ${alignmentClasses}`} 
            onClick={() => setOpen(false)}
        >
            <div className="rounded-md ring-1 ring-black ring-opacity-5 py-1 bg-white">{children}</div>
        </div>
    );
};

// Subcomponente DropdownLink
const DropdownLink: FC<LinkProps & { className?: string; children: ReactNode }> = ({ className = '', children, ...props }) => (
    <Link {...props} className={`block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out ${className}`}>
        {children}
    </Link>
);

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

// --- NavLink ---

interface NavLinkProps extends LinkProps {
    active?: boolean;
    children: ReactNode;
}

export const NavLink: FC<NavLinkProps> = ({ active = false, children, ...props }) => (
    <Link {...props} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${active ? 'border-yellow-400 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {children}
    </Link>
);

// --- ResponsiveNavLink ---

export const ResponsiveNavLink: FC<NavLinkProps> = ({ active = false, children, ...props }) => (
    <Link {...props} className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 ${active ? 'border-yellow-400 text-yellow-700 bg-yellow-50' : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'} text-base font-medium focus:outline-none transition duration-150 ease-in-out`}>
        {children}
    </Link>
);

export { Dropdown };
