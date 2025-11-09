/**
 * Formata um número ou BigInt como moeda brasileira (BRL) no formato completo.
 * @param {number | string | bigint | null | undefined} value O valor em CENTAVOS.
 * @returns {string} O valor formatado (ex: "R$ 20.000.000.000,00").
 */
export function formatCurrency(value) {
    if (value === null || value === undefined || value === '') return 'Valor a consultar';

    try {
        // Converte o valor de centavos para reais.
        const numericValue = Number(BigInt(value)) / 100;

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue);

    } catch (error) {
        console.error("Erro ao formatar moeda:", error);
        return "Valor inválido";
    }
}

/**
 * Formata um número com separadores de milhar.
 * @param {number | string | null | undefined} value O valor a ser formatado.
 * @returns {string} O número formatado (ex: "1.234") ou uma string vazia.
 */
export function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '';
    const number = String(value).replace(/\D/g, '');
    if (number === '') return '';
    return new Intl.NumberFormat('pt-BR').format(number);
}

/**
 * Formata um número de telefone no padrão brasileiro (XX) XXXXX-XXXX.
 * @param {string | null | undefined} phone O número de telefone.
 * @returns {string} O telefone formatado ou uma string vazia.
 */
export function formatPhone(phone) {
    if (!phone) return '';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 11) return phone;
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7)}`;
}

