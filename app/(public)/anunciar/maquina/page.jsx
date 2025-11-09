"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Funções Auxiliares e Componentes ---
const formatNumber = (value) => value ? new Intl.NumberFormat('pt-BR').format(String(value).replace(/\D/g, '')) : '';
const formatCurrency = (value) => {
    if (!value) return '';
    const digitsOnly = String(value).replace(/\D/g, '');
    if (digitsOnly === '') return '';
    const numberValue = parseFloat(digitsOnly) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};
const formatPhoneDisplay = (phone) => {
    if (!phone) return 'não definido';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11) return phone;
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

const FormSection = ({ title, children }) => (
    <fieldset className="space-y-6 pt-6">
        <legend className="text-lg font-medium text-gray-900 border-b pb-2 w-full">{title}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {children}
        </div>
    </fieldset>
);
const InputField = ({ label, name, type = 'text', value, onChange, required = false, placeholder, error, colSpan = "md:col-span-1" }) => (
    <div className={colSpan}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 h-10 px-3" />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
);
const SelectField = ({ label, name, value, onChange, required = false, disabled = false, children, error, colSpan = "md:col-span-1" }) => (
     <div className={colSpan}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm h-10">
            {children}
        </select>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
);
const CheckboxField = ({ label, name, checked, onChange }) => (
    <label className="flex items-center space-x-2">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50" />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);


export default function AnunciarMaquinaPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        nome: '', tipo: '', marca: '', ano: '', horas: '', preco: '',
        estado: '', cidade: '', descricao: '', imagens: [], imagem_principal_index: 0,
        condicao: '', potencia_motor: '', transmissao: '', ar_condicionado: false, lamina_frontal: false,
        operacao_previa: '', cabine: '', gps: false, tracao: '', piloto_automatico: false,
        pneus_dianteiros: '', pneus_traseiros: '', condicao_pneus: '', carregador_frontal: false,
        unico_dono: false, informacoes_adicionais: '',
        use_whatsapp: true, terms_agreed: false,
    });
    
    const tipos = ['Trator', 'Colheitadeira', 'Pulverizador', 'Semeadora', 'Plantadeira', 'Distribuidor de Fertilizantes', 'Escavadeira', 'Pá Carregadeira', 'Retroescavadeira', 'Motoniveladora', 'Rolo Compactador', 'Caminhão Basculante', 'Caminhão Pipa', 'Caminhão Munck', 'Cavalo Mecânico', 'Carreta Graneleira', 'Carreta Carga Seca', 'Carreta Tanque', 'Carreta Prancha', 'Outro'].sort();
    const marcas = ['Agrale', 'Case IH', 'Fendt', 'Jacto', 'John Deere', 'Massey Ferguson', 'New Holland', 'Stara', 'Valtra', 'Caterpillar', 'Komatsu', 'JCB', 'Hyundai', 'Doosan', 'Liebherr', 'DAF', 'Ford', 'Guerra', 'Iveco', 'Librelato', 'MAN', 'Mercedes-Benz', 'Randon', 'Scania', 'Volvo', 'Volkswagen', 'Outra'].sort();

    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [isCidadesLoading, setIsCidadesLoading] = useState(false);
    
    const [previews, setPreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const yearOptions = Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        async function fetchEstados() {
            try {
                const estadosRes = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
                setEstados(await estadosRes.json());
            } catch (error) {
                console.error("Falha ao obter estados do IBGE:", error);
            }
        }
        fetchEstados();
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/anunciar/maquina');
        }
    }, [status, router]);

    useEffect(() => {
        if (formData.estado) {
            setIsCidadesLoading(true);
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`)
                .then(res => res.json())
                .then(data => {
                    setCidades(data);
                })
                .catch(error => console.error("Falha ao buscar cidades:", error))
                .finally(() => setIsCidadesLoading(false));
        } else {
            setCidades([]);
        }
    }, [formData.estado]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        let formattedValue = val;
        if (name === 'preco') formattedValue = formatCurrency(val);
        if (name === 'horas') formattedValue = formatNumber(val);
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };
    
    const handleStateChange = (e) => {
        setFormData(prev => ({ ...prev, estado: e.target.value, cidade: '' }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 10);
        setFormData(prev => ({ ...prev, imagens: files, imagem_principal_index: 0 }));
        setPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const handleRemoveImage = (indexToRemove) => {
        const newImagens = formData.imagens.filter((_, index) => index !== indexToRemove);
        const newPreviews = previews.filter((_, index) => index !== indexToRemove);
        setFormData(prev => ({ ...prev, imagens: newImagens, imagem_principal_index: prev.imagem_principal_index >= newImagens.length ? 0 : prev.imagem_principal_index }));
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const data = new FormData();
        
        for (const key in formData) {
            if (key !== 'imagens') {
                data.append(key, formData[key]);
            }
        }

        formData.imagens.forEach((file) => {
            data.append('imagens', file);
        });

        try {
            const response = await fetch('/api/anuncios/maquinas', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    setErrors({ form: result.error || 'Ocorreu um erro ao criar o anúncio.' });
                }
            } else {
                router.push(`/anuncio/maquina/${result.slug}`);
            }
        } catch (error) {
            setErrors({ form: 'Não foi possível conectar ao servidor.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') return <p className="text-center py-12">A carregar...</p>;

    return (
        <div className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg">
                    <div className="p-6 border-b">
                        <h2 className="font-semibold text-2xl text-gray-800 leading-tight">Anunciar Nova Máquina</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        
                        <FormSection title="Informações Básicas">
                            <InputField label="Nome/Modelo do Anúncio" name="nome" value={formData.nome} onChange={handleChange} required colSpan="md:col-span-1" error={errors.nome?.[0]} />
                            <InputField label="Preço" name="preco" value={formData.preco} onChange={handleChange} required placeholder="R$" error={errors.preco?.[0]} />
                        </FormSection>

                        <FormSection title="Detalhes Técnicos">
                            <SelectField label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} required error={errors.tipo?.[0]}>
                                <option value="">Selecione</option>
                                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                            </SelectField>
                            <SelectField label="Marca" name="marca" value={formData.marca} onChange={handleChange} required error={errors.marca?.[0]}>
                                <option value="">Selecione</option>
                                {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                            </SelectField>
                             <SelectField label="Ano" name="ano" value={formData.ano} onChange={handleChange} required error={errors.ano?.[0]}>
                                <option value="">Selecione</option>
                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </SelectField>
                            <SelectField label="Condição" name="condicao" value={formData.condicao} onChange={handleChange} error={errors.condicao?.[0]}>
                                <option value="">Selecione</option>
                                {['Novo', 'Seminovo', 'Usado'].map(c => <option key={c} value={c}>{c}</option>)}
                            </SelectField>
                            <InputField label="Horas de Uso" name="horas" value={formData.horas} onChange={handleChange} required error={errors.horas?.[0]} />
                            <InputField label="Potência (cv)" name="potencia_motor" value={formData.potencia_motor} onChange={handleChange} error={errors.potencia_motor?.[0]} />
                            <InputField label="Transmissão" name="transmissao" value={formData.transmissao} onChange={handleChange} error={errors.transmissao?.[0]} />
                            <SelectField label="Tração" name="tracao" value={formData.tracao} onChange={handleChange} error={errors.tracao?.[0]}>
                                <option value="">Selecione</option>
                                {['4x2', '4x4', '6x4'].map(t => <option key={t} value={t}>{t}</option>)}
                            </SelectField>
                            <SelectField label="Cabine" name="cabine" value={formData.cabine} onChange={handleChange} error={errors.cabine?.[0]}>
                                <option value="">Selecione</option>
                                {['Aberta', 'Fechada'].map(c => <option key={c} value={c}>{c}</option>)}
                            </SelectField>
                            <InputField label="Operação Prévia" name="operacao_previa" value={formData.operacao_previa} onChange={handleChange} placeholder="Ex: Agricultura" error={errors.operacao_previa?.[0]} />
                            <InputField label="Condição dos Pneus" name="condicao_pneus" value={formData.condicao_pneus} onChange={handleChange} error={errors.condicao_pneus?.[0]} />
                            <InputField label="Pneus Dianteiros" name="pneus_dianteiros" value={formData.pneus_dianteiros} onChange={handleChange} error={errors.pneus_dianteiros?.[0]} />
                            <InputField label="Pneus Traseiros" name="pneus_traseiros" value={formData.pneus_traseiros} onChange={handleChange} error={errors.pneus_traseiros?.[0]} />
                        </FormSection>

                        <FormSection title="Opcionais">
                            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                <CheckboxField label="Ar Condicionado" name="ar_condicionado" checked={formData.ar_condicionado} onChange={handleChange} />
                                <CheckboxField label="Lâmina Frontal" name="lamina_frontal" checked={formData.lamina_frontal} onChange={handleChange} />
                                <CheckboxField label="Carregador Frontal" name="carregador_frontal" checked={formData.carregador_frontal} onChange={handleChange} />
                                <CheckboxField label="GPS" name="gps" checked={formData.gps} onChange={handleChange} />
                                <CheckboxField label="Piloto Automático" name="piloto_automatico" checked={formData.piloto_automatico} onChange={handleChange} />
                                <CheckboxField label="Único Dono" name="unico_dono" checked={formData.unico_dono} onChange={handleChange} />
                            </div>
                        </FormSection>

                        <FormSection title="Localização, Descrição e Imagens">
                            <SelectField label="Estado (UF)" name="estado" value={formData.estado} onChange={handleStateChange} required error={errors.estado?.[0]}>
                                 <option value="">{estados.length === 0 ? 'A carregar...' : 'Selecione'}</option>
                                {estados.map(e => <option key={e.id} value={e.sigla}>{e.nome}</option>)}
                            </SelectField>
                            <SelectField label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} required disabled={!formData.estado || isCidadesLoading} error={errors.cidade?.[0]}>
                                <option value="">{isCidadesLoading ? 'A carregar...' : (formData.estado ? 'Selecione a cidade' : 'Selecione um estado')}</option>
                                {cidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                            </SelectField>
                            <div className="md:col-span-2">
                                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                                <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="informacoes_adicionais" className="block text-sm font-medium text-gray-700">Informações Adicionais</label>
                                <textarea id="informacoes_adicionais" name="informacoes_adicionais" value={formData.informacoes_adicionais} onChange={handleChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="imagens" className="block text-sm font-medium text-gray-700">Fotos (até 10)</label>
                                <input id="imagens" type="file" multiple accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/>
                                {errors.imagens && <p className="mt-2 text-sm text-red-600">{errors.imagens[0]}</p>}
                            </div>
                             {previews.length > 0 && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600 mb-2">Clique para definir como principal.</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img src={preview} onClick={() => setFormData(prev => ({...prev, imagem_principal_index: index}))} alt={`Preview ${index}`} className={`w-full h-24 object-cover rounded-md cursor-pointer border-4 ${formData.imagem_principal_index === index ? 'border-yellow-500' : 'border-transparent'}`} />
                                                {formData.imagem_principal_index === index && <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs rounded-full px-2 py-1">Principal</div>}
                                                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </FormSection>

                        <fieldset className="space-y-4 pt-6 border-t">
                            <legend className="text-lg font-medium text-gray-900">Contato e Publicação</legend>
                            <CheckboxField label={`Usar o meu WhatsApp (${formatPhoneDisplay(session?.user?.phone)}) como contato.`} name="use_whatsapp" checked={formData.use_whatsapp} onChange={handleChange} />
                            <CheckboxField label={<span>Estou de acordo com as <a href="#" className="underline">políticas de publicação</a> e sou o único responsável pelo conteúdo deste anúncio.</span>} name="terms_agreed" checked={formData.terms_agreed} onChange={handleChange} />
                            {errors.terms_agreed && <p className="mt-2 text-sm text-red-600">{errors.terms_agreed[0]}</p>}
                        </fieldset>

                        {errors.form && <p className="text-center text-red-600 font-semibold">{errors.form}</p>}

                        <div className="flex items-center justify-end mt-6">
                            <button type="submit" disabled={isLoading || !formData.terms_agreed} className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-sm text-lg disabled:bg-gray-400">
                                {isLoading ? 'A publicar...' : 'Publicar Anúncio'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
