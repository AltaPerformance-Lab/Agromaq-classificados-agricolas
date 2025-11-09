'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// --- FUNÇÃO DE MÁSCARA DE MOEDA ---
const maskCurrency = (value) => {
    if (!value && value !== 0) return '';
    const onlyDigits = String(value).replace(/\D/g, '');
    if (onlyDigits === '') return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(onlyDigits) / 100);
};

// --- COMPONENTES DE UI ---
const FormSection = ({ title, children, gridCols = "md:grid-cols-3" }) => (
    <fieldset className="border-t border-gray-200 pt-6">
        <legend className="text-base font-semibold leading-6 text-gray-900">{title}</legend>
        <div className={`mt-6 grid grid-cols-1 ${gridCols} gap-x-6 gap-y-6`}>
            {children}
        </div>
    </fieldset>
);

const FormField = ({ label, name, as = 'input', ...props }) => {
    const Component = as;
    return (
        <div className={props.colSpan || ''}>
            <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
            <div className="mt-2">
                <Component
                    id={name}
                    name={name}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6 bg-white"
                    {...props}
                />
            </div>
        </div>
    );
};

const CheckboxField = ({ label, name, checked, onChange }) => (
    <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
            <input id={name} name={name} type="checkbox" checked={!!checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600" />
        </div>
        <div className="text-sm leading-6">
            <label htmlFor={name} className="font-medium text-gray-900">{label}</label>
        </div>
    </div>
);

// --- OPÇÕES PARA OS SELECTS ---
const condicaoOptions = [ { value: 'Novo', label: 'Novo' }, { value: 'Semi-novo', label: 'Semi-novo' }, { value: 'Usado', label: 'Usado' }];
const topografiaOptions = [ { value: 'Plana', label: 'Plana' }, { value: 'Levemente Ondulada', label: 'Levemente Ondulada' }, { value: 'Ondulada', label: 'Ondulada' }, { value: 'Montanhosa', label: 'Montanhosa' }];

// --- COMPONENTE PRINCIPAL ---
export default function AnuncioEditFormAdmin({ anuncio, type }) {
    const router = useRouter();
    
    if (!anuncio) {
        return <div className="text-center p-8">A carregar dados do anúncio...</div>;
    }

    const [formData, setFormData] = useState({ ...anuncio, title: anuncio.nome || anuncio.titulo, price: maskCurrency(anuncio.preco) });
    const [images, setImages] = useState(anuncio.imagens || []);
    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(data => setStates(data.map(uf => ({ value: uf.sigla, label: uf.nome }))));
    }, []);

    useEffect(() => {
        if (formData.estado) {
            setIsLoadingCities(true);
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`)
                .then(res => res.json())
                .then(data => setCities(data.map(city => ({ value: city.nome, label: city.nome }))))
                .finally(() => setIsLoadingCities(false));
        }
    }, [formData.estado]);

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        let finalValue = inputType === 'checkbox' ? checked : value;

        if (name === 'price') {
            finalValue = maskCurrency(value);
        }
        
        setFormData(prev => {
            const newState = { ...prev, [name]: finalValue };
            if (name === 'estado' && prev.estado !== finalValue) {
                newState.cidade = '';
                setCities([]);
            }
            return newState;
        });
    };
    
    const handleDeleteImage = async (imageId) => {
        const reason = prompt("Por favor, introduza o motivo para apagar esta imagem (será registado no log).");
        if (!reason) {
            toast.error("A eliminação foi cancelada. É necessário um motivo.");
            return;
        }

        const promise = fetch(`/api/admin/anuncios/${anuncio.id}/images/${imageId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, reason }),
        });

        toast.promise(promise, {
            loading: 'A apagar imagem...',
            success: (res) => {
                if (!res.ok) throw new Error('Falha ao apagar a imagem.');
                setImages(prev => prev.filter(img => img.id !== imageId));
                return 'Imagem apagada com sucesso!';
            },
            error: (err) => err.message,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const dataToSend = { 
            ...formData, 
            type,
            price: formData.price.replace(/\D/g, ''),
            brand: formData.marca,
            year: formData.ano,
            description: formData.descricao
        };

        const promise = fetch(`/api/admin/anuncios/${anuncio.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
        });

        toast.promise(promise, {
            loading: 'A guardar alterações...',
            success: async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Falha ao guardar.');
                }
                router.push('/admin/anuncios');
                router.refresh();
                return 'Anúncio atualizado com sucesso!';
            },
            error: (err) => err.message,
        });

        promise.finally(() => setIsLoading(false));
    };

    return (
        <>
            <Toaster position="top-right" />
            <form onSubmit={handleSubmit} className="space-y-12 bg-white p-8 rounded-lg shadow">
                
                {/* --- CAMPOS COMUNS --- */}
                <FormSection title="Informações Gerais">
                    <FormField label={type === 'maquina' ? "Nome / Modelo" : "Título do Anúncio"} name="title" value={formData.title} onChange={handleChange} colSpan="md:col-span-3" />
                    <FormField label="Preço (R$)" name="price" value={formData.price} onChange={handleChange} />
                     <FormField as="select" label="Estado" name="estado" value={formData.estado} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {states.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </FormField>
                     <FormField as="select" label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} disabled={isLoadingCities || !formData.estado}>
                        <option value="">{isLoadingCities ? 'A carregar...' : 'Selecione...'}</option>
                        {cities.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </FormField>
                </FormSection>

                {/* --- CAMPOS DE MÁQUINA --- */}
                {type === 'maquina' && (
                    <>
                        <FormSection title="Detalhes da Máquina">
                            <FormField label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} />
                            <FormField label="Marca" name="marca" value={formData.marca} onChange={handleChange} />
                            <FormField label="Ano" name="ano" value={formData.ano} onChange={handleChange} type="number" />
                            <FormField label="Horas de Uso" name="horas" value={formData.horas} onChange={handleChange} type="number" />
                            <FormField as="select" label="Condição" name="condicao" value={formData.condicao} onChange={handleChange}>
                                <option value="">Selecione...</option>
                                {condicaoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </FormField>
                            <FormField label="Potência (cv)" name="potencia_motor" value={formData.potencia_motor} onChange={handleChange} />
                            <FormField label="Transmissão" name="transmissao" value={formData.transmissao} onChange={handleChange} />
                            <FormField label="Tração" name="tracao" value={formData.tracao} onChange={handleChange} />
                            <FormField label="Cabine" name="cabine" value={formData.cabine} onChange={handleChange} />
                            <FormField label="Operação Prévia" name="operacao_previa" value={formData.operacao_previa} onChange={handleChange} />
                            <FormField label="Condição dos Pneus" name="condicao_pneus" value={formData.condicao_pneus} onChange={handleChange} />
                            <FormField label="Pneus Dianteiros" name="pneus_dianteiros" value={formData.pneus_dianteiros} onChange={handleChange} />
                            <FormField label="Pneus Traseiros" name="pneus_traseiros" value={formData.pneus_traseiros} onChange={handleChange} />
                        </FormSection>
                        <FormSection title="Opcionais" gridCols="md:grid-cols-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                <CheckboxField label="Ar Condicionado" name="ar_condicionado" checked={formData.ar_condicionado} onChange={handleChange} />
                                <CheckboxField label="Lâmina Frontal" name="lamina_frontal" checked={formData.lamina_frontal} onChange={handleChange} />
                                <CheckboxField label="Carregador Frontal" name="carregador_frontal" checked={formData.carregador_frontal} onChange={handleChange} />
                                <CheckboxField label="GPS" name="gps" checked={formData.gps} onChange={handleChange} />
                                <CheckboxField label="Piloto Automático" name="piloto_automatico" checked={formData.piloto_automatico} onChange={handleChange} />
                                <CheckboxField label="Único Dono" name="unico_dono" checked={formData.unico_dono} onChange={handleChange} />
                            </div>
                        </FormSection>
                    </>
                )}
                
                {/* --- CAMPOS DE FAZENDA --- */}
                {type === 'fazenda' && (
                     <>
                        <FormSection title="Detalhes da Fazenda">
                            <FormField label="Área Total (ha)" name="area_total_hectares" value={formData.area_total_hectares} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="Área de Lavoura (ha)" name="area_lavoura_hectares" value={formData.area_lavoura_hectares} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="Área de Pastagem (ha)" name="area_pastagem_hectares" value={formData.area_pastagem_hectares} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="Área de Reserva (ha)" name="area_reserva_hectares" value={formData.area_reserva_hectares} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="Tipo de Solo" name="tipo_solo" value={formData.tipo_solo} onChange={handleChange} />
                            <FormField as="select" label="Topografia" name="topografia" value={formData.topografia} onChange={handleChange}>
                               <option value="">Selecione...</option>
                               {topografiaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </FormField>
                        </FormSection>
                        <FormSection title="Benfeitorias" gridCols="md:grid-cols-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                               <CheckboxField label="Casa Sede" name="possui_casa_sede" checked={formData.possui_casa_sede} onChange={handleChange} />
                               <CheckboxField label="Curral" name="possui_curral" checked={formData.possui_curral} onChange={handleChange} />
                               <CheckboxField label="Recursos Hídricos" name="possui_recursos_hidricos" checked={formData.possui_recursos_hidricos} onChange={handleChange} />
                            </div>
                             <FormField as="textarea" label="Outras Benfeitorias" name="benfeitorias" value={formData.benfeitorias} onChange={handleChange} rows={4} colSpan="md:col-span-3" />
                        </FormSection>
                    </>
                )}
                
                <FormSection title="Descrição e Informações Adicionais" gridCols="md:grid-cols-1">
                    <FormField as="textarea" label="Descrição" name="descricao" value={formData.descricao} onChange={handleChange} rows={5} />
                    <FormField as="textarea" label="Informações Adicionais" name="informacoes_adicionais" value={formData.informacoes_adicionais} onChange={handleChange} rows={3} />
                </FormSection>

                {/* --- NOVA SEÇÃO DE GESTÃO DE IMAGENS --- */}
                <FormSection title="Gerir Imagens do Anúncio" gridCols="md:grid-cols-1">
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                         {images.map((image) => (
                             <div key={image.id} className="relative group">
                                 <img src={image.thumbnailUrl || image.url} alt="Imagem do anúncio" className="w-full h-28 object-cover rounded-md" />
                                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                     <button 
                                        type="button" 
                                        onClick={() => handleDeleteImage(image.id)} 
                                        className="bg-red-600 text-white rounded-full p-2 leading-none hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Apagar imagem"
                                    >
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                 </div>
                             </div>
                         ))}
                     </div>
                </FormSection>
                
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
                    <button type="button" onClick={() => router.back()} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:bg-yellow-300">
                        {isLoading ? 'A Guardar...' : 'Guardar Alterações'}
                    </button>
                </div>
            </form>
        </>
    );
}

