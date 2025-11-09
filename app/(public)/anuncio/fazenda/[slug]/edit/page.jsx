import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
// **CORREÇÃO:** Importa o formulário do local centralizado e correto.
import EditFazendaForm from '@/app/components/EditFazendaForm';

// Função para obter os dados do anúncio no servidor
async function getAnuncio(slug, userId) {
    const anuncio = await prisma.anuncioFazenda.findUnique({
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
export default async function EditAnuncioFazendaPage({ params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const userId = parseInt(session.user.id, 10);
    const anuncio = await getAnuncio(params.slug, userId);

    if (!anuncio) {
        notFound();
    }
    
    // Converte o BigInt do preço para uma string antes de o passar
    // para o Client Component, para evitar erros de serialização.
    const anuncioParaCliente = {
        ...anuncio,
        preco: anuncio.preco.toString(),
    };
    
    return <EditFazendaForm fazenda={anuncioParaCliente} />;
}

