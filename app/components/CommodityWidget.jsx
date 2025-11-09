import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

// Componente para exibir as cotações com um design moderno
export default function CommodityWidget({ prices }) {
    if (!prices || prices.length === 0) {
        return null;
    }

    return (
        <div className="my-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Cotações do Mercado</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {prices.map(price => (
                    <div key={price.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
                        <p className="text-sm font-semibold text-gray-900 text-center">{price.name}</p>
                        <p className="text-xl font-bold text-gray-800 text-center my-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price.price)}
                        </p>
                        <div className={`flex items-center justify-center text-sm font-bold ${price.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {price.variation >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                            <span>{price.variation.toFixed(2)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
