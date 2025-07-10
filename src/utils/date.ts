import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

// Timezone do Brasil
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

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
    let date: Date;
    
    // Tenta primeiro parseISO para datas ISO (2025-07-10T15:34:25.232-03:00)
    if (dateString.includes('T') || dateString.includes('Z')) {
      date = parseISO(dateString);
    } else {
      // Para outros formatos, usa new Date
      date = new Date(dateString);
    }
    
    // Verifica se a data é válida
    if (!isValid(date)) {
      console.warn('Data inválida:', dateString);
      return '-';
    }
    
    // Se a data já tem timezone info, converte para Brazil timezone
    // Se não tem, assume que já está no timezone correto
    let zonedDate: Date;
    
    if (dateString.includes('T') && (dateString.includes('-') || dateString.includes('+'))) {
      // Data com timezone info - converte para Brazil timezone
      zonedDate = toZonedTime(date, BRAZIL_TIMEZONE);
    } else {
      // Data sem timezone info - assume que já está no timezone local/correto
      zonedDate = date;
    }
    
    return format(zonedDate, formatStr, { locale: ptBR });
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