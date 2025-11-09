'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export function ModerationModal({ isOpen, onClose, onConfirm, anuncioTitle, action, isLoading }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setReason('');
                setError('');
            }, 300);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (action === 'suspend' && reason.trim().length < 10) {
            setError('O motivo deve ter pelo menos 10 caracteres.');
            return;
        }
        setError('');
        onConfirm(reason);
    };

    const isSuspendAction = action === 'suspend';
    const title = isSuspendAction ? 'Suspender Anúncio' : 'Reativar Anúncio';
    const buttonText = isSuspendAction ? 'Confirmar Suspensão' : 'Sim, Reativar';
    const buttonClass = isSuspendAction ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-40" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">{title}</Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Você está prestes a {isSuspendAction ? 'suspender' : 'reativar'} o anúncio: <span className="font-bold">{anuncioTitle}</span>.
                                    </p>
                                    {isSuspendAction && (
                                        <div className="mt-4">
                                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo da Suspensão (obrigatório)</label>
                                            <textarea
                                                id="reason"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                rows={4}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                                                placeholder="Ex: O preço do anúncio está incorreto, o anunciante não responde, etc."
                                            />
                                            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2" onClick={onClose} disabled={isLoading}>
                                        Cancelar
                                    </button>
                                    <button type="button" className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonClass}`} onClick={handleConfirm} disabled={isLoading}>
                                        {isLoading ? 'Processando...' : buttonText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

