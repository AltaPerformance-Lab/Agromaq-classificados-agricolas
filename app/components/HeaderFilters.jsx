'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const formatInputAsCurrency = (value) => {
    if (!value) return '';
    const digitsOnly = String(value).replace(/\D/g, '');
    if (digitsOnly === '') return '';
    const number = Number(digitsOnly) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

const formatInputAsNumber = (value, allowDecimals = false) => {
    if (value === null || value === undefined) return '';
    let cleanValue = String(value).replace(/[^\d,]/g, '');
    const parts = cleanValue.split(',');
    if (parts.length > 2) {
        cleanValue = parts[0] + ',' + parts.slice(1).join('');
    }
    let [integerPart, decimalPart] = cleanValue.split(',');
    integerPart = integerPart.replace(/\./g, '');
    const formattedInteger = new Intl.NumberFormat('pt-BR').format(Number(integerPart));
    if (allowDecimals && decimalPart !== undefined) {
        return `${formattedInteger},${decimalPart.slice(0, 2)}`;
    }
    if (allowDecimals && cleanValue.endsWith(',')) {
        return `${formattedInteger},`;
    }
    return formattedInteger;
};


export default function HeaderFilters() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isMounted, setIsMounted] = useState(false);
    
    const [activeCategory, setActiveCategory] = useState('maquinas');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [formData, setFormData] = useState({});
    
    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [isLoadingCidades, setIsLoadingCidades] = useState(false);

    const yearOptions = Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => new Date().getFullYear() - i);
    const tipos = ['Trator', 'Colheitadeira', 'Pulverizador', 'Semeadora', 'Plantadeira', 'Distribuidor de Fertilizantes', 'Escavadeira', 'Pá Carregadeira', 'Retroescavadeira', 'Motoniveladora', 'Rolo Compactador', 'Caminhão Basculante', 'Caminhão Pipa', 'Caminhão Munck', 'Cavalo Mecânico', 'Carreta Graneleira', 'Carreta Carga Seca', 'Carreta Tanque', 'Carreta Prancha', 'Outro'].sort();
    const marcas = ['Agrale', 'Case IH', 'Fendt', 'Jacto', 'John Deere', 'Massey Ferguson', 'New Holland', 'Stara', 'Valtra', 'Caterpillar', 'Komatsu', 'JCB', 'Hyundai', 'Doosan', 'Liebherr', 'DAF', 'Ford', 'Guerra', 'Iveco', 'Librelato', 'MAN', 'Mercedes-Benz', 'Randon', 'Scania', 'Volvo', 'Volkswagen', 'Outra'].sort();

    useEffect(() => {
        setIsMounted(true);
        setActiveCategory(pathname.startsWith('/fazendas') ? 'fazendas' : 'maquinas');
        
        const initialFormData = {};
        for (const [key, value] of searchParams.entries()) {
            if (key === 'preco_min' || key === 'preco_max') {
                initialFormData[key] = formatInputAsCurrency(value);
            } else if (key === 'horas_min' || key === 'horas_max') {
                initialFormData[key] = formatInputAsNumber(value, false);
            } else if (key === 'area_min' || key === 'area_max') {
                 initialFormData[key] = formatInputAsNumber(String(value).replace('.',','), true);
            } else {
                initialFormData[key] = value;
            }
        }
        setFormData(initialFormData);

        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
          .then(res => res.json())
          .then(setEstados);
    }, [searchParams, pathname]);

    useEffect(() => {
        const estadoUF = formData.estado;
        if (estadoUF) {
            setIsLoadingCidades(true);
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoUF}/municipios?orderBy=nome`)
                .then(res => res.json())
                .then(setCidades)
                .finally(() => setIsLoadingCidades(false));
        } else {
            setCidades([]);
        }
    }, [formData.estado]);

    useEffect(() => {
        if (!isMounted) return;

        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) {
                if (key.includes('preco') || key.includes('horas')) {
                    params.set(key, String(value).replace(/\D/g, ''));
                } else if (key.includes('area')) {
                    const urlValue = String(value).replace(/\./g, '').replace(',', '.');
                    params.set(key, urlValue);
                }
                else {
                    params.set(key, value);
                }
            }
        });
        
        const debounce = setTimeout(() => {
            const queryString = params.toString();
            router.push(queryString ? `${pathname}?${queryString}` : pathname);
        }, 500);

        return () => clearTimeout(debounce);
    }, [formData, pathname, router, isMounted]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: formatInputAsCurrency(value) }));
    };

    const handleIntegerChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: formatInputAsNumber(value, false) }));
    };

     const handleDecimalChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: formatInputAsNumber(value, true) }));
    };

    const handleEstadoChange = (e) => {
        setFormData(prev => ({ ...prev, estado: e.target.value, cidade: '' }));
    };

    const handleCategoryChange = (newCategory) => {
        if (newCategory === 'maquinas') {
            router.push('/');
        } else {
            router.push('/fazendas');
        }
    };

    const handleClearFilters = () => {
        if (activeCategory === 'maquinas') {
            router.push('/');
        } else {
            router.push('/fazendas');
        }
    };

    const handleSaveSearch = async () => {
        if (!session) {
            router.push('/login');
            return;
        }
        const nome = prompt('Por favor, dê um nome para o seu alerta de busca:');
        if (!nome || nome.trim() === '') {
            alert('O nome do alerta é obrigatório.');
            return;
        }
        
        const activeFilters = { ...formData, category: activeCategory };
        delete activeFilters.page;

        try {
            const response = await fetch('/api/alertas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, filtros: activeFilters }),
            });

            if (response.ok) {
                alert('Alerta de busca salvo com sucesso!');
                router.push('/dashboard');
            } else {
                const result = await response.json();
                alert(`Erro ao salvar alerta: ${result.error}`);
            }
        } catch (error) {
            alert('Não foi possível conectar ao servidor. Tente novamente.');
        }
    };
    
    const pathsToExclude = [
        '/login',
        '/register',
        '/dashboard',
        '/anunciar',
        '/comparar'
    ];
    
    const shouldHideFilters = pathsToExclude.some(path => pathname.startsWith(path));

    if (!isMounted || shouldHideFilters) {
        return null;
    }

    const isFilterActive = Object.keys(formData).length > 0 && Object.values(formData).some(v => v !== '');

    return (
        <div className="bg-white pt-4 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex border-b">
                    <button onClick={() => handleCategoryChange('maquinas')} className={`py-2 px-4 text-lg font-semibold ${activeCategory === 'maquinas' ? 'border-b-2 border-yellow-500 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Máquinas e Veículos</button>
                    <button onClick={() => handleCategoryChange('fazendas')} className={`py-2 px-4 text-lg font-semibold ${activeCategory === 'fazendas' ? 'border-b-2 border-yellow-500 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Fazendas e Imóveis</button>
                </div>

                {activeCategory === 'maquinas' && (
                     <div className="p-4 sm:p-6">
                         <div className="flex flex-col sm:flex-row gap-4">
                             <input type="text" name="search" value={formData.search || ''} onChange={handleChange} placeholder="Qual máquina você procura?" className="w-full p-3 border border-gray-300 rounded-lg" />
                             <button type="button" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="flex-shrink-0 flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                 {/* --- CORREÇÃO DO SVG --- */}
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                 <span>Filtros</span>
                             </button>
                             {isFilterActive && (
                                <button type="button" onClick={handleClearFilters} className="flex-shrink-0 p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Limpar</button>
                             )}
                         </div>
                         <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showAdvancedFilters ? 'max-h-screen mt-4 pt-4 border-t' : 'max-h-0'}`}>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                 <select name="tipo" value={formData.tipo || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Todos os Tipos</option>{tipos.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                 <select name="marca" value={formData.marca || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Todas as Marcas</option>{marcas.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                 <select name="estado" value={formData.estado || ''} onChange={handleEstadoChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Todos os Estados</option>{estados.map(e => <option key={e.id} value={e.sigla}>{e.nome}</option>)}</select>
                                 <select name="cidade" value={formData.cidade || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" disabled={!formData.estado || isLoadingCidades || cidades.length === 0}><option value="">{isLoadingCidades ? 'A carregar...' : (formData.estado ? 'Todas as Cidades' : 'Selecione um estado')}</option>{cidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                 <select name="ano_min" value={formData.ano_min || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Ano De</option>{yearOptions.map(year => <option key={year} value={year}>{year}</option>)}</select>
                                 <select name="ano_max" value={formData.ano_max || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Ano Até</option>{yearOptions.map(year => <option key={year} value={year}>{year}</option>)}</select>
                                 <input type="text" name="preco_min" value={formData.preco_min || ''} onChange={handlePriceChange} placeholder="Preço Mín." className="w-full p-3 border border-gray-300 rounded-lg" />
                                 <input type="text" name="preco_max" value={formData.preco_max || ''} onChange={handlePriceChange} placeholder="Preço Máx." className="w-full p-3 border border-gray-300 rounded-lg" />
                                 <input type="text" name="horas_min" value={formData.horas_min || ''} onChange={handleIntegerChange} placeholder="Horas Mín." className="w-full p-3 border border-gray-300 rounded-lg" />
                                 <input type="text" name="horas_max" value={formData.horas_max || ''} onChange={handleIntegerChange} placeholder="Horas Máx." className="w-full p-3 border border-gray-300 rounded-lg" />
                             </div>
                         </div>
                     </div>
                )}
                {activeCategory === 'fazendas' && (
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2">
                                <input id="search-fazenda" type="text" name="search" value={formData.search || ''} onChange={handleChange} placeholder="Procurar por Título, Cidade ou Estado" className="w-full p-3 border border-gray-300 rounded-lg" />
                            </div>
                            <input id="preco_min_fazenda" type="text" name="preco_min" value={formData.preco_min || ''} onChange={handlePriceChange} placeholder="Preço Mín." className="w-full p-3 border border-gray-300 rounded-lg" />
                            <input id="preco_max_fazenda" type="text" name="preco_max" value={formData.preco_max || ''} onChange={handlePriceChange} placeholder="Preço Máx." className="w-full p-3 border border-gray-300 rounded-lg" />
                             <div className="flex items-center justify-end">
                                {isFilterActive && (
                                    <button type="button" onClick={handleClearFilters} className="w-full lg:w-auto p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Limpar</button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input id="area_min_fazenda" type="text" name="area_min" value={formData.area_min || ''} onChange={handleDecimalChange} placeholder="Área Mín. (ha)" className="w-full p-3 border border-gray-300 rounded-lg" />
                            <input id="area_max_fazenda" type="text" name="area_max" value={formData.area_max || ''} onChange={handleDecimalChange} placeholder="Área Máx. (ha)" className="w-full p-3 border border-gray-300 rounded-lg" />
                            <select id="estado-fazenda" name="estado" value={formData.estado || ''} onChange={handleEstadoChange} className="w-full p-3 border border-gray-300 rounded-lg"><option value="">Estado</option>{estados.map(e => <option key={e.id} value={e.sigla}>{e.nome}</option>)}</select>
                            <select id="cidade-fazenda" name="cidade" value={formData.cidade || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" disabled={!formData.estado || isLoadingCidades || cidades.length === 0}><option value="">{isLoadingCidades ? 'A carregar...' : (formData.estado ? 'Cidade' : 'Escolha um estado')}</option>{cidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select>
                        </div>
                    </div>
                )}

                {isFilterActive && session?.user && activeCategory === 'maquinas' && (
                    <div className="px-4 sm:px-6 pb-4 border-t pt-4 flex justify-end">
                        <button
                            onClick={handleSaveSearch}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Salvar Busca
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

