import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mapeamento dos nossos IDs para os códigos da API externa (exemplo)
const API_CODE_MAP = {
    DOLAR: 'USD-BRL',
    OURO: 'GOLD', // Supondo que a API tenha um código para ouro
};

// Função para simular a variação de commodities agrícolas
const simulateVariation = (price) => {
    const variation = (Math.random() - 0.5) * 5; // Variação aleatória entre -2.5% e +2.5%
    const newPrice = price * (1 + variation / 100);
    return { price: newPrice, variation };
};


export async function GET(request) {
    // --- Segurança ---
    // Protege a rota para que só possa ser acionada com uma chave secreta
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 });
    }

    console.log('A iniciar a tarefa de atualização de cotações...');

    try {
        // 1. Buscar cotações da API externa (Dólar como exemplo real)
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        if (!response.ok) {
            throw new Error('Falha ao buscar dados da API externa');
        }
        const externalData = await response.json();

        const updates = [];

        // 2. Atualiza o Dólar com dados reais
        const dolarData = externalData[API_CODE_MAP.DOLAR];
        if (dolarData) {
            updates.push(
                prisma.commodityPrice.update({
                    where: { id: 'DOLAR' },
                    data: {
                        price: parseFloat(dolarData.bid),
                        variation: parseFloat(dolarData.pctChange),
                    },
                })
            );
             console.log('Dólar atualizado:', dolarData.bid);
        }

        // 3. Simula a atualização para as outras commodities
        const commoditiesToSimulate = ['BOI_GORDO', 'SOJA', 'MILHO', 'CAFE', 'OURO'];
        const currentPrices = await prisma.commodityPrice.findMany({
            where: { id: { in: commoditiesToSimulate } },
        });

        for (const commodity of currentPrices) {
            const { price, variation } = simulateVariation(commodity.price);
            updates.push(
                prisma.commodityPrice.update({
                    where: { id: commodity.id },
                    data: { price, variation },
                })
            );
            console.log(`${commodity.name} atualizado (simulado):`, price.toFixed(2));
        }
        
        // 4. Executa todas as atualizações na base de dados
        await Promise.all(updates);

        console.log('Tarefa de atualização de cotações concluída com sucesso.');
        return NextResponse.json({ message: 'Cotações atualizadas com sucesso.' });

    } catch (error) {
        console.error('Erro na tarefa de atualização de cotações:', error);
        return NextResponse.json({ error: 'Falha ao atualizar cotações.' }, { status: 500 });
    }
}
