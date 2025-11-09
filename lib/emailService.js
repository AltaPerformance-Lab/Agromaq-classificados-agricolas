// ATENÇÃO: Este é um serviço de e-mail simulado.
// Para produção, você deve integrar um provedor de e-mail real como Resend, SendGrid, etc.

const sendEmail = ({ to, subject, body }) => {
    console.log("--- SIMULAÇÃO DE ENVIO DE E-MAIL ---");
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Corpo: ${body}`);
    console.log("------------------------------------");
    // Aqui iria a lógica real de envio de e-mail
    return Promise.resolve();
};

export const sendAnnouncementSuspendedEmail = (user, anuncio, reason) => {
    return sendEmail({
        to: user.email,
        subject: `Aviso Importante Sobre o Seu Anúncio: ${anuncio.titulo || anuncio.nome}`,
        body: `Olá ${user.name},\n\nO seu anúncio "${anuncio.titulo || anuncio.nome}" foi suspenso temporariamente pela nossa moderação.\n\nMotivo: ${reason}\n\Por favor, revise as nossas políticas ou entre em contato para mais detalhes.\n\nAtenciosamente,\nEquipa AgroMaq`,
    });
};

export const sendAnnouncementReactivatedEmail = (user, anuncio) => {
    return sendEmail({
        to: user.email,
        subject: `Boas Notícias! O seu anúncio está ativo novamente.`,
        body: `Olá ${user.name},\n\nO seu anúncio "${anuncio.titulo || anuncio.nome}" foi reativado e já está visível para todos na plataforma.\n\nAtenciosamente,\nEquipa AgroMaq`,
    });
};

// TODO: Implementar outras funções de e-mail (anúncio criado, atualizado, etc.)
