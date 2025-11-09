'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import toast, { Toaster } from 'react-hot-toast';

// --- Componentes de UI ---
const InputField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            id={id}
            className="block w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            {...props}
        />
    </div>
);

const TextAreaField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            id={id}
            rows="4"
            className="block w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
            {...props}
        ></textarea>
    </div>
);

const CheckboxField = ({ label, id, ...props }) => (
    <label htmlFor={id} className="flex items-center space-x-2">
        <input
            id={id}
            type="checkbox"
            className="rounded border-gray-300 text-yellow-600 shadow-sm focus:ring-yellow-500"
            {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);


// --- Formulário Principal ---
export default function EditFazendaForm({ fazenda }) {
    const router = useRouter();
    
    if (!fazenda) {
        return <p className="text-center text-gray-600 p-8">A carregar dados do anúncio...</p>;
    }

    const [formData, setFormData] = useState({
        titulo: fazenda.titulo || '',
        preco: formatCurrency(fazenda.preco) || '',
        descricao: fazenda.descricao || '',
        benfeitorias: fazenda.benfeitorias || '',
        estado: fazenda.estado || '',
        cidade: fazenda.cidade || '',
        area_total_hectares: formatNumber(fazenda.area_total_hectares, true) || '',
        area_lavoura_hectares: formatNumber(fazenda.area_lavoura_hectares, true) || '',
        area_pastagem_hectares: formatNumber(fazenda.area_pastagem_hectares, true) || '',
        area_reserva_hectares: formatNumber(fazenda.area_reserva_hectares, true) || '',
        tipo_solo: fazenda.tipo_solo || '',
        topografia: fazenda.topografia || '',
        possui_casa_sede: fazenda.possui_casa_sede || false,
        possui_curral: fazenda.possui_curral || false,
        possui_recursos_hidricos: fazenda.possui_recursos_hidricos || false,
    });

    const [existingImages, setExistingImages] = useState(fazenda.imagens || []);
    const [newImages, setNewImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handlePriceChange = (e) => {
        setFormData(prev => ({ ...prev, preco: formatCurrency(e.target.value) }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: formatNumber(value, true) }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 10 - existingImages.length);
        setNewImages(files);
    };

    const handleRemoveExistingImage = (imageId) => {
        toast((t) => (
            <div className="flex flex-col items-center gap-2">
              <p>Tem a certeza que quer apagar esta imagem?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setExistingImages(prev => prev.filter(img => img.id !== imageId));
                    setImagesToDelete(prev => [...prev, imageId]);
                    toast.dismiss(t.id);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                >
                  Sim
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-3 rounded"
                >
                  Não
                </button>
              </div>
            </div>
          ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const submissionData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            submissionData.append(key, value);
        });
        
        newImages.forEach(file => {
            submissionData.append('newImages', file);
        });
        
        submissionData.append('imagesToDelete', JSON.stringify(imagesToDelete));

        const promise = fetch(`/api/anuncios/fazendas/${fazenda.slug}`, {
                method: 'PUT',
                body: submissionData,
            });

        toast.promise(promise, {
            loading: 'A atualizar o seu anúncio...',
            success: async (res) => {
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Falha ao atualizar.');
                }
                const result = await res.json();
                router.push(`/anuncio/fazenda/${result.slug}`);
                router.refresh();
                return 'Anúncio atualizado com sucesso!';
            },
            error: (err) => err.message,
        });

        promise.finally(() => setIsSubmitting(false));
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            <h1 className="text-2xl font-bold text-gray-800">Editar Anúncio: {fazenda.titulo}</h1>

                            <fieldset className="space-y-6">
                                <legend className="text-lg font-medium text-gray-900 border-b pb-2 w-full">Informações Principais</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="md:col-span-2"><InputField label="Título do Anúncio" id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required /></div>
                                    <InputField label="Preço" id="preco" name="preco" value={formData.preco} onChange={handlePriceChange} required />
                                </div>
                                <TextAreaField label="Descrição Completa" id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} />
                                <TextAreaField label="Benfeitorias (cercas, galpões, etc.)" id="benfeitorias" name="benfeitorias" value={formData.benfeitorias} onChange={handleChange} />
                            </fieldset>

                            <fieldset className="space-y-6">
                                <legend className="text-lg font-medium text-gray-900 border-b pb-2 w-full">Detalhes da Propriedade</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <InputField label="Estado" id="estado" name="estado" value={formData.estado} onChange={handleChange} />
                                    <InputField label="Cidade" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} />
                                    <InputField label="Tipo de Solo" id="tipo_solo" name="tipo_solo" value={formData.tipo_solo} onChange={handleChange} />
                                    <InputField label="Topografia" id="topografia" name="topografia" value={formData.topografia} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                                    <InputField label="Área Total (ha)" id="area_total_hectares" name="area_total_hectares" value={formData.area_total_hectares} onChange={handleNumberChange} />
                                    <InputField label="Área Lavoura (ha)" id="area_lavoura_hectares" name="area_lavoura_hectares" value={formData.area_lavoura_hectares} onChange={handleNumberChange} />
                                    <InputField label="Área Pastagem (ha)" id="area_pastagem_hectares" name="area_pastagem_hectares" value={formData.area_pastagem_hectares} onChange={handleNumberChange} />
                                    <InputField label="Área Reserva (ha)" id="area_reserva_hectares" name="area_reserva_hectares" value={formData.area_reserva_hectares} onChange={handleNumberChange} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                                   <CheckboxField label="Possui Casa Sede" id="possui_casa_sede" name="possui_casa_sede" checked={formData.possui_casa_sede} onChange={handleChange} />
                                   <CheckboxField label="Possui Curral" id="possui_curral" name="possui_curral" checked={formData.possui_curral} onChange={handleChange} />
                                   <CheckboxField label="Possui Recursos Hídricos" id="possui_recursos_hidricos" name="possui_recursos_hidricos" checked={formData.possui_recursos_hidricos} onChange={handleChange} />
                                </div>
                            </fieldset>
                            
                            <fieldset className="space-y-4">
                                <legend className="text-lg font-medium text-gray-900 border-b pb-2 w-full">Gerir Imagens</legend>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagens Atuais</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                                        {existingImages.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <img src={image.thumbnailUrl || image.url} alt="Imagem da fazenda" className="w-full h-24 object-cover rounded-md" />
                                                <button type="button" onClick={() => handleRemoveExistingImage(image.id)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div>
                                    <label htmlFor="newImages" className="block text-sm font-medium text-gray-700">Adicionar Novas Fotos (até {10 - existingImages.length})</label>
                                    <input id="newImages" name="newImages" type="file" multiple accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
                                </div>
                            </fieldset>

                            <div className="flex items-center justify-end mt-6 space-x-4 border-t pt-6">
                                <button type="button" onClick={() => router.back()} className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 bg-yellow-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-600 disabled:opacity-50">
                                    {isSubmitting ? 'A Atualizar...' : 'Atualizar Anúncio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

