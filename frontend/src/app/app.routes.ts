import { Routes } from '@angular/router';
import { autenticadoGuard, visitanteGuard } from './core/auth.guards';

export const routes: Routes = [
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
      { path: 'financeiro', title: 'Financeiro | EventSync', loadComponent: () => import('./features/em-breve').then((m) => m.EmBreve), data: { titulo: 'Gestão financeira' } },
      { path: 'configuracoes', title: 'Configurações | EventSync', loadComponent: () => import('./features/configuracoes/configuracoes').then((m) => m.Configuracoes) },
      { path: 'perfil', title: 'Perfil | EventSync', loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil) },
      { path: '', pathMatch: 'full', redirectTo: 'eventos' },
    ],
  },
  { path: '**', redirectTo: '' },
];
