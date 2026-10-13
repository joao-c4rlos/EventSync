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

export interface ProblemaApi {
  detail?: string;
  campos?: Record<string, string>;
}
