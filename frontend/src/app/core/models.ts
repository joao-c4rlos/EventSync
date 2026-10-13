export type Sexo = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';
export type Tema = 'CLARO' | 'ESCURO';
export type Plano = 'GRATUITO' | 'PROFISSIONAL' | 'EMPRESARIAL';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  celular: string | null;
  dataNascimento: string | null;
  sexo: Sexo | null;
  cidade: string | null;
  fotoUrl: string | null;
  idioma: string;
  fusoHorario: string;
  tema: Tema;
  plano: Plano;
}

export interface AuthResponse {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}

export type TipoEvento = 'SHOW' | 'CONFERENCIA' | 'CASAMENTO' | 'TREINAMENTO' | 'OUTRO';
export type StatusEvento = 'RASCUNHO' | 'PUBLICADO' | 'ENCERRADO' | 'CANCELADO';

export interface Evento {
  id: number;
  titulo: string;
  tipo: TipoEvento;
  status: StatusEvento;
  slug: string;
  dataInicio: string;
  dataFim: string | null;
  horaInicio: string;
  horaFim: string | null;
  local: string;
  capacidade: number;
  descricao: string | null;
  gastoPrevisto: number;
  receitaPrevista: number;
  lucroPrevisto: number;
  inscritos: number;
}

export interface EventoPayload {
  titulo: string;
  tipo: TipoEvento;
  dataInicio: string;
  dataFim: string | null;
  horaInicio: string;
  horaFim: string | null;
  local: string;
  capacidade: number;
  descricao: string | null;
  gastoPrevisto: number;
  receitaPrevista: number;
}

export interface Inscricao {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  criadoEm: string;
}

export interface EventoPublico {
  titulo: string;
  tipo: TipoEvento;
  status: StatusEvento;
  dataInicio: string;
  dataFim: string | null;
  horaInicio: string;
  horaFim: string | null;
  local: string;
  descricao: string | null;
  organizador: string;
  vagasRestantes: number;
  inscricoesAbertas: boolean;
}

export type TipoLancamento = 'GASTO' | 'RECEBIMENTO';
export type StatusLancamento = 'PENDENTE' | 'CONCLUIDO';

export interface Lancamento {
  id: number;
  descricao: string;
  tipo: TipoLancamento;
  status: StatusLancamento;
  valor: number;
  data: string;
  eventoId: number | null;
  eventoTitulo: string | null;
}

export interface LancamentoPayload {
  descricao: string;
  tipo: TipoLancamento;
  status: StatusLancamento;
  valor: number;
  data: string;
  eventoId: number | null;
}

export interface PontoSerie {
  data: string;
  valor: number;
}

export interface ResumoMensal {
  mes: string;
  gastoRealizado: number;
  gastoTotal: number;
  recebido: number;
  receitaTotal: number;
  lucroPrevisto: number;
  lucroReal: number;
  aReceberFimDoMes: number;
  receitaPrevistaProximoMes: number;
  gastosPendentes: number;
  serieGasto: PontoSerie[];
  serieRecebido: PontoSerie[];
  serieLucroPrevisto: PontoSerie[];
  serieLucroReal: PontoSerie[];
}

export interface ProblemaApi {
  detail?: string;
  campos?: Record<string, string>;
}
