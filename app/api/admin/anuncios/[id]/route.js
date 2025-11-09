import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// --- FUNÇÃO PARA CRIAR SLUG (ADAPTADA DA SUA API DE CRIAÇÃO) ---
function slugify(text) {
    if (!text) return '';
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(p, c => b.charAt(a.indexOf(c)))
      .replace(/&/g, '-e-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
}

// --- FUNÇÃO DE AJUDA PARA CORRIGIR O ERRO BigInt ---
function makeSerializable(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    for (const key in obj) {
        if (typeof obj[key] === 'bigint') {
            obj[key] = obj[key].toString();
        } else if (typeof obj[key] === 'object') {
            obj[key] = makeSerializable(obj[key]);
        }
    }
    return obj;
}

// --- PATCH: LIDA COM A EDIÇÃO DE CONTEÚDO ---
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const anuncioId = parseInt(params.id, 10);
    if (isNaN(anuncioId)) {
        return NextResponse.json({ error: 'ID do anúncio inválido.' }, { status: 400 });
    }
    
    try {
        const body = await request.json();
        const { type, ...contentData } = body;
        const model = type === 'maquina' ? prisma.anuncioMaquina : prisma.anuncioFazenda;

        const dataToUpdate = {};

        // --- ATUALIZAÇÃO DE SLUG ---
        if (contentData.title) {
            const selectFields = type === 'maquina' ? { nome: true } : { titulo: true };
            const currentAnuncio = await model.findUnique({
                where: { id: anuncioId },
                select: selectFields,
            });
            
            const currentTitle = currentAnuncio?.nome || currentAnuncio?.titulo;

            if (currentTitle !== contentData.title) {
                let newSlug = slugify(contentData.title);
                const count = await model.count({ where: { slug: { startsWith: newSlug }, id: { not: anuncioId } } });
                if (count > 0) {
                    newSlug = `${newSlug}-${count + 1}`;
                }
                dataToUpdate.slug = newSlug;
            }
        }

        // --- MAPEAMENTO DE CAMPOS COMUNS ---
        if (contentData.title !== undefined) {
            if (type === 'maquina') dataToUpdate.nome = contentData.title;
            if (type === 'fazenda') dataToUpdate.titulo = contentData.title;
        }
        if (contentData.price !== undefined) dataToUpdate.preco = BigInt(String(contentData.price).replace(/\D/g, ''));
        if (contentData.estado !== undefined) dataToUpdate.estado = contentData.estado;
        if (contentData.cidade !== undefined) dataToUpdate.cidade = contentData.cidade;
        if (contentData.descricao !== undefined) dataToUpdate.descricao = contentData.descricao;
        
        // --- MAPEAMENTO DE CAMPOS ESPECÍFICOS ---
        if (type === 'maquina') {
            // CORREÇÃO: Este campo só existe para máquinas
            if (contentData.informacoes_adicionais !== undefined) dataToUpdate.informacoes_adicionais = contentData.informacoes_adicionais;

            if (contentData.tipo !== undefined) dataToUpdate.tipo = contentData.tipo;
            if (contentData.marca !== undefined) dataToUpdate.marca = contentData.marca;
            if (contentData.ano !== undefined) dataToUpdate.ano = parseInt(contentData.ano, 10) || null;
            if (contentData.horas !== undefined) dataToUpdate.horas = parseInt(contentData.horas, 10) || null;
            if (contentData.condicao !== undefined) dataToUpdate.condicao = contentData.condicao;
            if (contentData.potencia_motor !== undefined) dataToUpdate.potencia_motor = contentData.potencia_motor;
            if (contentData.transmissao !== undefined) dataToUpdate.transmissao = contentData.transmissao;
            if (contentData.tracao !== undefined) dataToUpdate.tracao = contentData.tracao;
            if (contentData.cabine !== undefined) dataToUpdate.cabine = contentData.cabine;
            if (contentData.operacao_previa !== undefined) dataToUpdate.operacao_previa = contentData.operacao_previa;
            if (contentData.condicao_pneus !== undefined) dataToUpdate.condicao_pneus = contentData.condicao_pneus;
            if (contentData.pneus_dianteiros !== undefined) dataToUpdate.pneus_dianteiros = contentData.pneus_dianteiros;
            if (contentData.pneus_traseiros !== undefined) dataToUpdate.pneus_traseiros = contentData.pneus_traseiros;
            if (contentData.ar_condicionado !== undefined) dataToUpdate.ar_condicionado = Boolean(contentData.ar_condicionado);
            if (contentData.lamina_frontal !== undefined) dataToUpdate.lamina_frontal = Boolean(contentData.lamina_frontal);
            if (contentData.carregador_frontal !== undefined) dataToUpdate.carregador_frontal = Boolean(contentData.carregador_frontal);
            if (contentData.gps !== undefined) dataToUpdate.gps = Boolean(contentData.gps);
            if (contentData.piloto_automatico !== undefined) dataToUpdate.piloto_automatico = Boolean(contentData.piloto_automatico);
            if (contentData.unico_dono !== undefined) dataToUpdate.unico_dono = Boolean(contentData.unico_dono);
        }
        
        if (type === 'fazenda') {
            if (contentData.area_total_hectares !== undefined) dataToUpdate.area_total_hectares = parseFloat(String(contentData.area_total_hectares).replace(',', '.')) || null;
            if (contentData.area_lavoura_hectares !== undefined) dataToUpdate.area_lavoura_hectares = parseFloat(String(contentData.area_lavoura_hectares).replace(',', '.')) || null;
            if (contentData.area_pastagem_hectares !== undefined) dataToUpdate.area_pastagem_hectares = parseFloat(String(contentData.area_pastagem_hectares).replace(',', '.')) || null;
            if (contentData.area_reserva_hectares !== undefined) dataToUpdate.area_reserva_hectares = parseFloat(String(contentData.area_reserva_hectares).replace(',', '.')) || null;
            if (contentData.tipo_solo !== undefined) dataToUpdate.tipo_solo = contentData.tipo_solo;
            if (contentData.topografia !== undefined) dataToUpdate.topografia = contentData.topografia;
            if (contentData.benfeitorias !== undefined) dataToUpdate.benfeitorias = contentData.benfeitorias;
            if (contentData.possui_casa_sede !== undefined) dataToUpdate.possui_casa_sede = Boolean(contentData.possui_casa_sede);
            if (contentData.possui_curral !== undefined) dataToUpdate.possui_curral = Boolean(contentData.possui_curral);
            if (contentData.possui_recursos_hidricos !== undefined) dataToUpdate.possui_recursos_hidricos = Boolean(contentData.possui_recursos_hidricos);
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json({ error: 'Nenhum campo válido para atualizar foi fornecido.' }, { status: 400 });
        }
        
        const [updatedAnuncio] = await prisma.$transaction([
            model.update({ where: { id: anuncioId }, data: dataToUpdate, }),
            prisma.activityLog.create({
                data: {
                    actorId: parseInt(session.user.id, 10),
                    actorName: session.user.name || 'Admin',
                    action: 'ADMIN_EDIT_AD',
                    targetType: type === 'maquina' ? 'AnuncioMaquina' : 'AnuncioFazenda',
                    targetId: anuncioId.toString(),
                    details: { message: `Admin editou o anúncio.`, changedFields: Object.keys(dataToUpdate), },
                },
            }),
        ]);

        return NextResponse.json(makeSerializable(updatedAnuncio));

    } catch (error) {
        console.error("ERRO CRÍTICO NO HANDLER PATCH:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor. Verifique o log do terminal.' }, { status: 500 });
    }
}

// --- DELETE: LIDA COM A EXCLUSÃO LÓGICA ---
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    const anuncioId = parseInt(params.id, 10);
    if (isNaN(anuncioId)) {
        return NextResponse.json({ error: 'ID do anúncio inválido.' }, { status: 400 });
    }
    try {
        const { type } = await request.json();
        const model = type === 'maquina' ? prisma.anuncioMaquina : prisma.anuncioFazenda;

        const [deletedAnuncio] = await prisma.$transaction([
            model.update({
                where: { id: anuncioId },
                data: { deletedAt: new Date(), status: 'SUSPENSO' },
            }),
            prisma.activityLog.create({
                data: {
                    actorId: parseInt(session.user.id, 10),
                    actorName: session.user.name || 'Admin',
                    action: 'DELETE_AD_LOGICAL',
                    targetType: type === 'maquina' ? 'AnuncioMaquina' : 'AnuncioFazenda',
                    targetId: anuncioId.toString(),
                    details: { message: `Anúncio (${type}) movido para a lixeira pelo admin.` },
                },
            }),
        ]);
        return NextResponse.json(makeSerializable(deletedAnuncio));
    } catch (error) {
        console.error("Erro ao apagar anúncio:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
    }
}

