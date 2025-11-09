import prisma from './prisma';

/**
 * Cria um registo de log para uma ação na plataforma.
 * @param {object} options
 * @param {number} options.actorId - O ID do utilizador (ou admin) que realizou a ação.
 * @param {string} options.actorName - O nome do utilizador.
 * @param {import('@prisma/client').ActivityType} options.action - O tipo de ação.
 * @param {string} [options.targetType] - O tipo do modelo alvo (ex: 'AnuncioMaquina').
 * @param {number | string} [options.targetId] - O ID do registo alvo.
 * @param {string} [options.reason] - Um motivo textual para a ação.
 * @param {object} [options.details] - Um objeto JSON com detalhes extras (ex: { before, after }).
 */
export async function createLog({ actorId, actorName, action, targetType, targetId, reason, details }) {
    try {
        await prisma.activityLog.create({
            data: {
                actorId,
                actorName,
                action,
                targetType,
                targetId: targetId ? String(targetId) : null,
                reason,
                details,
            },
        });
    } catch (error) {
        // A falha ao criar um log não deve quebrar a funcionalidade principal.
        // Apenas registamos o erro no console para depuração futura.
        console.error("Falha ao criar o log de atividade:", error);
    }
}

