"use client";

import React, { useState } from 'react';

export default function ImageGallery({ imagens, altText }) {
    const [mainImage, setMainImage] = useState(imagens.find(img => img.isPrincipal) || imagens[0]);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

    if (!imagens || imagens.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">Nenhuma imagem disponível</p>
            </div>
        );
    }

    return (
        <>
            <div>
                <div className="mb-4 cursor-zoom-in" onClick={() => setIsZoomModalOpen(true)}>
                    <img 
                        src={mainImage.url} 
                        alt={altText} 
                        className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-md"
                    />
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {imagens.map((image) => (
                        <button 
                            key={image.id} 
                            onClick={() => setMainImage(image)} 
                            className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition ${mainImage.id === image.id ? 'border-yellow-500' : 'border-transparent'}`}
                        >
                            <img 
                                src={image.thumbnailUrl}
                                alt={`Miniatura de ${altText}`} 
                                className="h-20 w-28 object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {isZoomModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsZoomModalOpen(false)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white text-4xl"
                        onClick={() => setIsZoomModalOpen(false)}
                    >
                        &times;
                    </button>
                    <img 
                        src={mainImage.url} 
                        alt={altText} 
                        className="max-w-[90vw] max-h-[90vh] rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
