"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

const FormInput = ({ id, name, type, placeholder, value, onChange, error }) => (
    <div>
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <input
            id={id}
            name={name}
            type={type}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:bg-white focus:outline-none border-transparent"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage('Conta criada com sucesso! Por favor, faça login.');
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setApiError('');
        setSuccessMessage('');

        const result = await signIn('credentials', {
            redirect: false,
            email: formData.email,
            password: formData.password,
        });

        if (result.error) {
            setApiError('Email ou senha incorretos.');
            setIsLoading(false);
        } else {
            const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
            // MUDANÇA: Usamos router.replace em vez de router.push.
            // O 'replace' substitui a entrada no histórico de navegação,
            // o que impede que o utilizador volte para a página de login com o botão "Voltar"
            // e limpa a URL de parâmetros desnecessários.
            router.replace(callbackUrl);
        }
    };

    return (
        <section className="relative flex flex-col md:flex-row h-screen items-center">
            <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.pexels.com/photos/158827/field-corn-air-frisch-158827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <div className="relative w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center z-10">
                <div className="w-full h-100 bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-xl md:text-2xl font-bold leading-tight mt-4 text-gray-800">Entrar na sua conta</h1>
                    
                    {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md text-sm mt-4 text-center">{successMessage}</p>}
                    
                    <form className="mt-6" onSubmit={handleSubmit}>
                        <FormInput id="email" name="email" type="email" placeholder="Endereço de Email" value={formData.email} onChange={handleChange} />
                        <FormInput id="password" name="password" type="password" placeholder="Senha" value={formData.password} onChange={handleChange} />
                        
                        {apiError && <p className="text-red-500 text-sm mt-4 text-center">{apiError}</p>}

                        <button type="submit" disabled={isLoading} className="w-full block bg-yellow-500 hover:bg-yellow-400 focus:bg-yellow-400 text-white font-semibold rounded-lg px-4 py-3 mt-6 transition duration-300 disabled:bg-gray-400">
                            {isLoading ? 'A entrar...' : 'Entrar'}
                        </button>
                    </form>
                    <hr className="my-6 border-gray-300 w-full" />
                    <p className="mt-4 text-center text-gray-600">
                        Não tem uma conta?{' '}
                        <Link href="/register" className="text-yellow-500 hover:text-yellow-700 font-semibold">
                            Crie uma agora
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
