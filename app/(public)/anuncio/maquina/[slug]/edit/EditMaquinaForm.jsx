'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// --- FUNÇÃO DE FORMATAÇÃO DE MOEDA ---
const formatCurrency = (value) => {
    if (!value) return '';
    const onlyDigits = String(value).replace(/\D/g, '');
    if (onlyDigits === '') return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(onlyDigits) / 100);
};

// --- COMPONENTES DE UI INTERNOS ---
const FormSection = ({ title, children, gridCols = "md:grid-cols-3" }) => (
    <fieldset className="space-y-6 pt-6 first-of-type:pt-0">
        <legend className="text-lg font-medium text-gray-900 border-b pb-2 w-full">{title}</legend>
        <div className={`grid grid-cols-1 ${gridCols} gap-6 pt-4`}>
            {children}
        </div>
    </fieldset>
);

const FormField = ({ label, name, value, onChange, as = 'input', options = [], disabled = false, colSpan = "md:col-span-1", ...props }) => {
    const Component = as;
    // ATUALIZAÇÃO: Adicionada a classe 'border' e 'bg-gray-50' para melhorar a visibilidade
    const commonClasses = "mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 shadow-sm focus:border-yellow-500 focus:ring-yellow-500";
    
    if (Component === 'select') {
        return (
            <div className={colSpan}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <select id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className={commonClasses} {...props}>
                    <option value="">{disabled ? 'A carregar...' : 'Selecione...'}</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
        );
    }
    return (
        <div className={colSpan}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <Component id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className={commonClasses} {...props}/>
        </div>
    );
};

const CheckboxField = ({ label, name, checked, onChange }) => (
    <label className="flex items-center space-x-2">
        {/* ATUALIZAÇÃO: Adicionada a classe 'border' para consistência visual */}
        <input type="checkbox" name={name} checked={!!checked} onChange={onChange} className="rounded border border-gray-300 text-yellow-600 shadow-sm focus:ring-yellow-500" />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);


// --- OPÇÕES PARA OS SELECTS (sem alterações) ---
const condicaoOptions = [ { value: 'Novo', label: 'Novo' }, { value: 'Semi-novo', label: 'Semi-novo' }, { value: 'Usado', label: 'Usado' }];
const topografiaOptions = [ { value: 'Plana', label: 'Plana' }, { value: 'Levemente Ondulada', label: 'Levemente Ondulada' }, { value: 'Ondulada', label: 'Ondulada' }, { value: 'Montanhosa', label: 'Montanhosa' }];

// --- COMPONENTE PRINCIPAL ---
export default function AnuncioEditFormAdmin({ anuncio, type }) {
    const router = useRouter();
    
    if (!anuncio) {
        return <div className="text-center p-8">A carregar dados do anúncio...</div>;
    }

    const [formData, setFormData] = useState({
      ...anuncio,
      price: formatCurrency(anuncio.preco),
      title: anuncio.nome || anuncio.titulo
    });
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
        const initialEstado = anuncio.estado;
        if (initialEstado) {
            setIsLoadingCities(true);
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${initialEstado}/municipios`)
                .then(res => res.json())
                .then(data => {
                    setCities(data.map(city => ({ value: city.nome, label: city.nome })));
                    setFormData(prev => ({...prev, estado: initialEstado}));
                })
                .finally(() => setIsLoadingCities(false));
        }
    }, [anuncio.estado]);

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        const val = inputType === 'checkbox' ? checked : value;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: val };
            if (name === 'estado') {
                newState.cidade = '';
                setCities([]);
                if (val) {
                    setIsLoadingCities(true);
                    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${val}/municipios`)
                        .then(res => res.json())
                        .then(data => setCities(data.map(city => ({ value: city.nome, label: city.nome }))))
                        .finally(() => setIsLoadingCities(false));
                }
            }
            return newState;
        });
    };
    
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: formatCurrency(value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const dataToSend = { ...formData, type };
        dataToSend.price = String(dataToSend.price).replace(/\D/g, '');

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
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
                
                {/* --- SEÇÃO DE MÁQUINAS --- */}
                {type === 'maquina' && (
                    <>
                        <FormSection title="Informações da Máquina">
                            <FormField label="Nome / Modelo" name="title" value={formData.title} onChange={handleChange} />
                            <FormField label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} />
                            <FormField label="Marca" name="brand" value={formData.brand} onChange={handleChange} />
                            <FormField label="Ano" name="year" value={formData.year} onChange={handleChange} type="number" />
                            <FormField label="Horas de Uso" name="horas" value={formData.horas} onChange={handleChange} type="number" />
                            <FormField as="select" label="Condição" name="condicao" value={formData.condicao} onChange={handleChange} options={condicaoOptions} />
                        </FormSection>
                        <FormSection title="Detalhes Técnicos">
                            <FormField label="Potência (cv)" name="potencia_motor" value={formData.potencia_motor} onChange={handleChange} />
                            <FormField label="Transmissão" name="transmissao" value={formData.transmissao} onChange={handleChange} />
                            <FormField label="Tração" name="tracao" value={formData.tracao} onChange={handleChange} />
                            <FormField label="Cabine" name="cabine" value={formData.cabine} onChange={handleChange} />
                            <FormField label="Operação Prévia" name="operacao_previa" value={formData.operacao_previa} onChange={handleChange} colSpan="md:col-span-2" />
                        </FormSection>
                         <FormSection title="Pneus">
                            <FormField label="Condição dos Pneus" name="condicao_pneus" value={formData.condicao_pneus} onChange={handleChange} />
                            <FormField label="Pneus Dianteiros" name="pneus_dianteiros" value={formData.pneus_dianteiros} onChange={handleChange} />
                            <FormField label="Pneus Traseiros" name="pneus_traseiros" value={formData.pneus_traseiros} onChange={handleChange} />
                        </FormSection>
                        <FormSection title="Opcionais" gridCols="md:grid-cols-3">
                            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
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

                {/* --- SEÇÃO DE FAZENDAS --- */}
                {type === 'fazenda' && (
                    <>
                        <FormSection title="Informações da Fazenda">
                            <FormField label="Título do Anúncio" name="title" value={formData.title} onChange={handleChange} colSpan="md:col-span-3" />
                            <FormField label="Área Total (ha)" name="area_total_hectares" value={formData.area_total_hectares} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="Área de Lavoura (ha)" name="area_lavoura_hectares" value={formData.area_lavoura_hectares} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="Área de Pastagem (ha)" name="area_pastagem_hectares" value={formData.area_pastagem_hectares} onChange={handleChange} type="number" step="0.1" />
                             <FormField label="Área de Reserva (ha)" name="area_reserva_hectares" value={formData.area_reserva_hectares} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="Tipo de Solo" name="tipo_solo" value={formData.tipo_solo} onChange={handleChange} />
                            <FormField as="select" label="Topografia" name="topografia" value={formData.topografia} onChange={handleChange} options={topografiaOptions} />
                        </FormSection>
                        <FormSection title="Benfeitorias" gridCols="md:grid-cols-3">
                             <div className="md:col-span-3 grid grid-cols-3 gap-4">
                                <CheckboxField label="Casa Sede" name="possui_casa_sede" checked={formData.possui_casa_sede} onChange={handleChange} />
                                <CheckboxField label="Curral" name="possui_curral" checked={formData.possui_curral} onChange={handleChange} />
                                <CheckboxField label="Recursos Hídricos" name="possui_recursos_hidricos" checked={formData.possui_recursos_hidricos} onChange={handleChange} />
                            </div>
                            <FormField as="textarea" label="Outras Benfeitorias" name="benfeitorias" value={formData.benfeitorias} onChange={handleChange} rows={4} colSpan="md:col-span-3" />
                        </FormSection>
                    </>
                )}
                
                {/* --- SEÇÃO COMUM --- */}
                <FormSection title="Preço e Localização">
                    <FormField label="Preço (R$)" name="price" value={formData.price} onChange={handlePriceChange} />
                    <FormField as="select" label="Estado" name="estado" value={formData.estado} onChange={handleChange} options={states} />
                    <FormField as="select" label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} options={cities} disabled={isLoadingCities || !formData.estado} />
                </FormSection>

                <FormSection title="Descrição Detalhada" gridCols="md:grid-span-1">
                    <FormField as="textarea" label="Descrição" name="description" value={formData.description} onChange={handleChange} rows={5} colSpan="md:col-span-3" />
                    <FormField as="textarea" label="Informações Adicionais" name="informacoes_adicionais" value={formData.informacoes_adicionais} onChange={handleChange} rows={3} colSpan="md:col-span-3" />
                </FormSection>
                
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button type="button" onClick={() => router.back()} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:bg-yellow-300">
                        {isLoading ? 'A Guardar...' : 'Guardar Alterações'}
                    </button>
                </div>
            </form>
        </>
    );
}

