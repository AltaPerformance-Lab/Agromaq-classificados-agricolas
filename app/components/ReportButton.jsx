'use client';

import { useState } from 'react';
import { FlagIcon } from '@heroicons/react/24/outline';

// --- Componente Modal ---
const ReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason) {
            alert('Por favor, selecione um motivo.');
            return;
        }
        onSubmit({ reason, message });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Denunciar Anúncio</h3>
                <div className="space-y-4">
                    <select 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Selecione um motivo...</option>
                        <option value="PRECO_FALSO">Preço Falso ou Enganoso</option>
                        <option value="ITEM_VENDIDO">Item já foi vendido</option>
                        <option value="FOTOS_INADEQUADAS">Fotos Inadequadas ou Falsas</option>
                        <option value="TENTATIVA_GOLPE">Tentativa de Golpe</option>
                        <option value="OUTRO">Outro</option>
                    </select>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Forneça mais detalhes (opcional)"
                        className="w-full p-2 border border-gray-300 rounded-lg h-24"
                    />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Enviar Denúncia
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Componente do Botão ---
export default function ReportButton({ anuncioId }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleReportSubmit = ({ reason, message }) => {
        console.log('Denúncia enviada:', { anuncioId, reason, message });
        // Aqui viria a lógica para enviar a denúncia para a sua API
        alert('A sua denúncia foi enviada para a nossa equipa de moderação. Obrigado!');
        setIsModalOpen(false);
    };

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-red-600 hover:underline mt-4"
            >
                <FlagIcon className="h-4 w-4 mr-2" />
                Denunciar este anúncio
            </button>
            <ReportModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleReportSubmit}
            />
        </>
    );
}
