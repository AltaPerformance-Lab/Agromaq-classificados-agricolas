"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Função para formatar o número de telefone com uma máscara
const formatPhone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    return value.slice(0, 15);
};

// Componente para um campo de formulário reutilizável
const FormInput = ({ id, name, type, placeholder, value, onChange, error, maxLength }) => (
    <div>
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <input
            id={id}
            name={name}
            type={type}
            required
            className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:bg-white focus:outline-none ${error ? 'border-red-500' : 'border-transparent'}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setApiError('');

        const apiUrl = '/api/users';
        // ADICIONADO PARA DEBUG: Verifique o console do navegador para confirmar a URL.
        console.log(`A enviar dados de registo para: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setApiError(data.error || 'Ocorreu um erro ao criar a conta.');
                }
            } else {
                router.push('/login?registered=true');
            }
        } catch (error) {
            setApiError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative flex flex-col md:flex-row h-screen items-center">
            {/* Imagem de Fundo */}
            <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.pexels.com/photos/158827/field-corn-air-frisch-158827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>

            {/* Formulário */}
            <div className="relative w-full md:max-w-md lg:max-w-full md:mx-auto md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center z-10">
                <div className="w-full h-100 bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-xl md:text-2xl font-bold leading-tight mt-4 text-gray-800">Crie a sua conta</h1>
                    <form className="mt-6" onSubmit={handleSubmit}>
                        <FormInput id="name" name="name" type="text" placeholder="Nome Completo" value={formData.name} onChange={handleChange} error={errors.name?.[0]} />
                        <FormInput id="email" name="email" type="email" placeholder="Endereço de Email" value={formData.email} onChange={handleChange} error={errors.email?.[0]} />
                        <FormInput id="phone" name="phone" type="tel" placeholder="Telefone (Ex: (11) 98765-4321)" value={formData.phone} onChange={handleChange} error={errors.phone?.[0]} maxLength={15} />
                        <FormInput id="password" name="password" type="password" placeholder="Senha" value={formData.password} onChange={handleChange} error={errors.password?.[0]} />
                        
                        {apiError && <p className="text-red-500 text-sm mt-4 text-center">{apiError}</p>}

                        <button type="submit" disabled={isLoading} className="w-full block bg-yellow-500 hover:bg-yellow-400 focus:bg-yellow-400 text-white font-semibold rounded-lg px-4 py-3 mt-6 transition duration-300 disabled:bg-gray-400">
                            {isLoading ? 'A criar conta...' : 'Criar Conta'}
                        </button>
                    </form>
                    <hr className="my-6 border-gray-300 w-full" />
                    <p className="mt-4 text-center text-gray-600">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="text-yellow-500 hover:text-yellow-700 font-semibold">
                            Faça Login
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
