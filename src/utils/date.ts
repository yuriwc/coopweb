import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data string para o timezone brasileiro
 * @param dateString - String da data (ISO, timestamp, etc.)
 * @param formatStr - Formato de saída (padrão: dd/MM/yyyy HH:mm)
 * @returns Data formatada no timezone brasileiro
 */
export const formatDateBR = (
  dateString: string | null | undefined, 
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string => {
  if (!dateString) return '-';
  
  try {
    let cleanDateString = dateString;
    
    // Remove timezone annotation like [America/Sao_Paulo] if present
    if (cleanDateString.includes('[') && cleanDateString.includes(']')) {
      cleanDateString = cleanDateString.split('[')[0];
    }
    
    let date: Date;
    
    // Tenta primeiro parseISO para datas ISO (2025-07-10T15:34:25.232-03:00)
    if (cleanDateString.includes('T') || cleanDateString.includes('Z')) {
      date = parseISO(cleanDateString);
    } else {
      // Para outros formatos, usa new Date
      date = new Date(cleanDateString);
    }
    
    // Verifica se a data é válida
    if (!isValid(date)) {
      console.warn('Data inválida:', dateString);
      return '-';
    }
    
    // Como a data já vem com timezone do Brasil (-03:00), 
    // não precisamos converter - apenas formatamos
    return format(date, formatStr, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error, dateString);
    return '-';
  }
};

/**
 * Formata data com segundos
 */
export const formatDateTimeBR = (dateString: string | null | undefined): string => {
  return formatDateBR(dateString, 'dd/MM/yyyy HH:mm:ss');
};

/**
 * Formata apenas a data (sem hora)
 */
export const formatDateOnlyBR = (dateString: string | null | undefined): string => {
  return formatDateBR(dateString, 'dd/MM/yyyy');
};

/**
 * Formata data em formato longo (ex: 10 jul 2025, 15:34)
 */
export const formatDateLongBR = (dateString: string | null | undefined): string => {
  return formatDateBR(dateString, 'dd MMM yyyy, HH:mm');
};

/**
 * Converte timestamp em milliseconds para horário brasileiro (apenas HH:mm)
 * @param timestamp - Timestamp em milliseconds
 * @returns Horário formatado (HH:mm)
 */
export const formatTimestampToTime = (timestamp: number): string => {
  if (!timestamp) return '-';
  
  try {
    const date = new Date(timestamp);
    
    if (!isValid(date)) {
      console.warn('Timestamp inválido:', timestamp);
      return '-';
    }
    
    return format(date, 'HH:mm', { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar timestamp:', error, timestamp);
    return '-';
  }
};