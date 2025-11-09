"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    
    const [infoMessage, setInfoMessage] = useState('');
    const [infoError, setInfoError] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [isInfoLoading, setIsInfoLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setFormData({
                name: session.user.name || '',
                email: session.user.email || '',
                phone: session.user.phone || '', // Agora o telefone virá da sessão
            });
        }
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [session, status, router]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsInfoLoading(true);
        setInfoMessage('');
        setInfoError('');

        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            setInfoMessage('Perfil atualizado com sucesso!');
            await update({ ...session, user: { ...session.user, ...formData } });
        } else {
            setInfoError(result.error || 'Falha ao atualizar o perfil.');
        }
        setIsInfoLoading(false);
    };
    
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        setPasswordMessage('');
        setPasswordError('');

        if (passwordData.newPassword.length < 8) {
            setPasswordError('A nova senha deve ter pelo menos 8 caracteres.');
            setIsPasswordLoading(false);
            return;
        }

        const response = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData),
        });

        const result = await response.json();
        if (response.ok) {
            setPasswordMessage('Senha alterada com sucesso!');
            setPasswordData({ currentPassword: '', newPassword: '' });
        } else {
            setPasswordError(result.error || 'Falha ao alterar a senha.');
        }
        setIsPasswordLoading(false);
    };

    if (status === "loading") {
        return <p className="text-center mt-8">A carregar...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">O Meu Perfil</h1>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Informações da Conta</h2>
                {infoMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">{infoMessage}</div>}
                {infoError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{infoError}</div>}
                <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <button type="submit" disabled={isInfoLoading} className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition duration-300 disabled:bg-gray-400">
                            {isInfoLoading ? 'A guardar...' : 'Guardar Alterações'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md mt-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Alterar Senha</h2>
                {passwordMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">{passwordMessage}</div>}
                {passwordError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{passwordError}</div>}
                <form onSubmit={handlePasswordUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="currentPassword">Senha Atual</label>
                            <input type="password" name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                        </div>
                        <div>
                            <label htmlFor="newPassword">Nova Senha</label>
                            <input type="password" name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <button type="submit" disabled={isPasswordLoading} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
                            {isPasswordLoading ? 'A alterar...' : 'Alterar Senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
