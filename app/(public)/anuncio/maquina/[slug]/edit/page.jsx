import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import EditMaquinaForm from './EditMaquinaForm'; // Assumindo que o seu formulário se chama assim

// Função para obter os dados do anúncio no servidor
async function getAnuncio(slug, userId) {
    const anuncio = await prisma.anuncioMaquina.findUnique({
        where: { slug },
        include: { imagens: true },
    });

    // Segurança: Verifica se o anúncio existe e pertence ao utilizador logado
    if (!anuncio || anuncio.userId !== userId) {
        return null;
    }

    return anuncio;
}

// A página principal (Server Component)
export default async function EditAnuncioMaquinaPage({ params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const userId = parseInt(session.user.id, 10);
    const anuncio = await getAnuncio(params.slug, userId);

    if (!anuncio) {
        notFound();
    }
    
    // --- CORREÇÃO ---
    // Convertemos o BigInt do preço para uma string antes de o passar
    // para o Client Component, para evitar erros de serialização.
    const anuncioParaCliente = {
        ...anuncio,
        preco: anuncio.preco.toString(),
    };
    
    return <EditMaquinaForm maquina={anuncioParaCliente} />;
}
