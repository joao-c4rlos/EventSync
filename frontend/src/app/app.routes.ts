import { Routes } from '@angular/router';
import { autenticadoGuard, visitanteGuard } from './core/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'eventos' },
  {
    path: 'e/:slug',
    title: 'Inscrição | EventSync',
    loadComponent: () => import('./features/publico/evento-publico').then((m) => m.EventoPublicoPage),
  },
  {
    path: '',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./features/auth/auth-layout').then((m) => m.AuthLayout),
    children: [
      { path: 'login', title: 'Entrar | EventSync', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },
      { path: 'cadastro', title: 'Cadastro | EventSync', loadComponent: () => import('./features/auth/cadastro').then((m) => m.Cadastro) },
      { path: 'esqueci-senha', title: 'Recuperar senha | EventSync', loadComponent: () => import('./features/auth/esqueci-senha').then((m) => m.EsqueciSenha) },
      { path: 'redefinir-senha', title: 'Nova senha | EventSync', loadComponent: () => import('./features/auth/redefinir-senha').then((m) => m.RedefinirSenha) },
    ],
  },
  {
    path: '',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      { path: 'dashboard', title: 'Dashboard | EventSync', loadComponent: () => import('./features/em-breve').then((m) => m.EmBreve), data: { titulo: 'Dashboard' } },
      { path: 'eventos', title: 'Eventos | EventSync', loadComponent: () => import('./features/eventos/eventos').then((m) => m.Eventos) },
      { path: 'eventos/novo', title: 'Novo evento | EventSync', loadComponent: () => import('./features/eventos/evento-form').then((m) => m.EventoForm) },
      { path: 'eventos/:id', title: 'Evento | EventSync', loadComponent: () => import('./features/eventos/evento-detalhe').then((m) => m.EventoDetalhe) },
      { path: 'eventos/:id/editar', title: 'Editar evento | EventSync', loadComponent: () => import('./features/eventos/evento-form').then((m) => m.EventoForm) },
      { path: 'financeiro', title: 'Financeiro | EventSync', loadComponent: () => import('./features/financeiro/financeiro').then((m) => m.Financeiro) },
      { path: 'configuracoes', title: 'Configurações | EventSync', loadComponent: () => import('./features/configuracoes/configuracoes').then((m) => m.Configuracoes) },
      { path: 'perfil', title: 'Perfil | EventSync', loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil) },
    ],
  },
  { path: '**', redirectTo: 'eventos' },
];
