'use client';

import { useState } from 'react';
import { FlagIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';


// --- Componente Modal para Denúncia ---
function ReportModal({ anuncio, isOpen, onClose }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Lógica para enviar a denúncia para a sua API (a ser criada)
        console.log({
            anuncioId: anuncio.id,
            anuncioType: 'Fazenda', // Ou 'Maquina'
            reason,
        });

        // Simula o envio
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert('A sua denúncia foi enviada com sucesso. A nossa equipa irá analisá-la em breve.');
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Denunciar Anúncio</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Ajude-nos a manter a comunidade segura. Por favor, descreva por que este anúncio (`{anuncio.titulo}`) parece inadequado.
                </p>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Ex: Suspeita de fraude, preço irreal, informações falsas..."
                        required
                    />
                    <div className="mt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400">
                            {isSubmitting ? 'A Enviar...' : 'Enviar Denúncia'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Componente Principal de Ações ---
export default function AnuncioActions({ anuncio, vendedor }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="space-y-4">
                 <a 
                    href={`https://wa.me/55${vendedor.phone.replace(/\D/g, '')}?text=Olá, tenho interesse no seu anúncio '${anuncio.titulo}' que vi na AgroMaq.`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                >
                    Entrar em Contato
                </a>

                <div className="text-center">
                    <p className="text-sm text-gray-700">Vendido por:</p>
                    <div className="flex items-center justify-center space-x-2">
                        <p className="font-semibold text-gray-900">{vendedor.name}</p>
                        {vendedor.isVerified && <ShieldCheckIcon className="h-5 w-5 text-blue-500" title="Vendedor Verificado" />}
                    </div>
                </div>

                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-red-600 group transition-colors"
                >
                    <FlagIcon className="h-4 w-4 mr-2" />
                    Denunciar este anúncio
                </button>
            </div>

            <ReportModal anuncio={anuncio} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
