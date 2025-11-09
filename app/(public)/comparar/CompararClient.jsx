'use client';

import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/formatters';

export default function CompararClient({ maquinas }) {
    
    // Define as características que queremos comparar, facilitando a manutenção
    const features = [
        { key: 'preco', label: 'Preço', format: formatCurrency },
        { key: 'ano', label: 'Ano' },
        { key: 'horas', label: 'Horas de Uso', format: formatNumber, suffix: ' h' },
        { key: 'condicao', label: 'Condição' },
        { key: 'marca', label: 'Marca' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'potencia_motor', label: 'Potência do Motor' },
        { key: 'transmissao', label: 'Transmissão' },
        { key: 'tracao', label: 'Tração' },
        { key: 'cabine', label: 'Cabine' },
        { key: 'condicao_pneus', label: 'Condição dos Pneus' },
        { key: 'operacao_previa', label: 'Operação Prévia' },
        { key: 'cidade', label: 'Cidade' },
        { key: 'estado', label: 'Estado' },
    ];

    const booleanFeatures = [
        { key: 'ar_condicionado', label: 'Ar Condicionado' },
        { key: 'gps', label: 'GPS' },
        { key: 'piloto_automatico', label: 'Piloto Automático' },
        { key: 'lamina_frontal', label: 'Lâmina Frontal' },
        { key: 'carregador_frontal', label: 'Carregador Frontal' },
        { key: 'unico_dono', label: 'Único Dono' },
    ];

    // Formata valores booleanos para uma exibição mais clara
    const formatBoolean = (value) => value ? 
        <span className="text-green-600 font-semibold">Sim</span> : 
        <span className="text-red-600">Não</span>;

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            {/* Otimização para Dispositivos Móveis: A div permite scroll horizontal da tabela */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Otimização Móvel: Largura mínima e espaçamento responsivos */}
                            <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-base sm:text-lg font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10 min-w-[140px] sm:min-w-[200px]">Característica</th>
                            {maquinas.map(maquina => (
                                <th key={maquina.id} className="px-4 py-3 sm:px-6 sm:py-4 text-left text-base sm:text-lg font-semibold text-gray-600 min-w-[200px] sm:min-w-[250px]">
                                    <Link href={`/anuncio/maquina/${maquina.slug}`} className="hover:text-yellow-600">
                                        {maquina.nome}
                                    </Link>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Imagem */}
                        <tr>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-gray-800 text-sm sm:text-base sticky left-0 bg-white z-10">Imagem</td>
                            {maquinas.map(maquina => (
                                <td key={maquina.id} className="px-4 py-3 sm:px-6 sm:py-4">
                                    <Link href={`/anuncio/maquina/${maquina.slug}`}>
                                        {/* Otimização Móvel: Tamanho da imagem responsivo */}
                                        <img 
                                            src={maquina.imagens[0]?.thumbnailUrl || `https://placehold.co/300x200/e2e8f0/333?text=Sem+Foto`} 
                                            alt={maquina.nome}
                                            className="w-48 h-32 sm:w-60 sm:h-40 object-cover rounded-lg"
                                        />
                                    </Link>
                                </td>
                            ))}
                        </tr>
                        
                        {/* Mapeia e renderiza as características principais */}
                        {features.map(feature => (
                            <tr key={feature.key}>
                                <td className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-gray-800 text-sm sm:text-base sticky left-0 bg-white z-10">{feature.label}</td>
                                {maquinas.map(maquina => (
                                    <td key={maquina.id} className="px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg text-gray-700">
                                        {feature.format ? feature.format(maquina[feature.key]) : maquina[feature.key] || 'Não informado'}
                                        {maquina[feature.key] && feature.suffix ? feature.suffix : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Mapeia e renderiza as características booleanas (Sim/Não) */}
                        {booleanFeatures.map(feature => (
                             <tr key={feature.key}>
                                <td className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-gray-800 text-sm sm:text-base sticky left-0 bg-white z-10">{feature.label}</td>
                                {maquinas.map(maquina => (
                                    <td key={maquina.id} className="px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg text-gray-700">
                                        {formatBoolean(maquina[feature.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Botão de Contato */}
                        <tr>
                            <td className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-gray-800 text-sm sm:text-base sticky left-0 bg-white z-10">Contato</td>
                            {maquinas.map(maquina => (
                                <td key={maquina.id} className="px-4 py-3 sm:px-6 sm:py-4">
                                    {maquina.user.phone ? (
                                        <a 
                                            href={`https://wa.me/${maquina.user.phone.replace(/\D/g, '')}?text=Olá! Vi a máquina ${maquina.nome} no comparativo da AgroMaq e tenho interesse.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 text-sm"
                                        >
                                            Contatar Vendedor
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-500">Não informado</span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

