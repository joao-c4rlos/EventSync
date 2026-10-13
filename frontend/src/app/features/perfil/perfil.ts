import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { Sexo, Usuario } from '../../core/models';
import { UsuarioService } from '../../core/usuario.service';
import { Avatar } from '../../shared/avatar';

const TELEFONE = /^$|^[0-9()+\- ]{8,20}$/;

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, Avatar],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly usuarios = inject(UsuarioService);
  protected readonly usuario = inject(AuthService).usuario;

  protected readonly sexos: { valor: Sexo; rotulo: string }[] = [
    { valor: 'FEMININO', rotulo: 'Feminino' },
    { valor: 'MASCULINO', rotulo: 'Masculino' },
    { valor: 'OUTRO', rotulo: 'Outro' },
    { valor: 'NAO_INFORMADO', rotulo: 'Prefiro não informar' },
  ];

  protected readonly form = inject(FormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    telefone: ['', Validators.pattern(TELEFONE)],
    celular: ['', Validators.pattern(TELEFONE)],
    email: ['', [Validators.required, Validators.email]],
    dataNascimento: [''],
    sexo: [null as Sexo | null],
    cidade: ['', Validators.maxLength(100)],
  });

  protected readonly salvando = signal(false);
  protected readonly mensagem = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  ngOnInit(): void {
    const atual = this.usuario();
    if (atual) this.preencher(atual);
    this.usuarios.meusDados().subscribe((u) => this.preencher(u));
  }

  protected invalido(campo: 'nome' | 'telefone' | 'celular' | 'email'): boolean {
    const controle = this.form.controls[campo];
    return controle.touched && controle.invalid;
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensagem.set({ tipo: 'erro', texto: 'Revise os campos destacados.' });
      return;
    }

    const v = this.form.getRawValue();
    this.salvando.set(true);
    this.mensagem.set(null);

    this.usuarios
      .atualizarPerfil({
        nome: v.nome ?? '',
        email: v.email ?? '',
        telefone: v.telefone ?? '',
        celular: v.celular ?? '',
        dataNascimento: v.dataNascimento || null,
        sexo: v.sexo,
        cidade: v.cidade ?? '',
      })
      .subscribe({
        next: (u) => {
          this.preencher(u);
          this.mensagem.set({ tipo: 'sucesso', texto: 'Alterações salvas com sucesso.' });
          this.salvando.set(false);
        },
        error: (e) => {
          this.mensagem.set({ tipo: 'erro', texto: mensagemDeErro(e, 'Não foi possível salvar.') });
          this.salvando.set(false);
        },
      });
  }

  private preencher(u: Usuario): void {
    this.form.reset({
      nome: u.nome,
      telefone: u.telefone ?? '',
      celular: u.celular ?? '',
      email: u.email,
      dataNascimento: u.dataNascimento ?? '',
      sexo: u.sexo,
      cidade: u.cidade ?? '',
    });
  }
}
