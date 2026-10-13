package br.com.eventsync.usuario;

import br.com.eventsync.common.RegraNegocioException;
import br.com.eventsync.usuario.UsuarioDtos.AlterarSenhaRequest;
import br.com.eventsync.usuario.UsuarioDtos.PerfilRequest;
import br.com.eventsync.usuario.UsuarioDtos.PreferenciasRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final Set<String> IDIOMAS = Set.of("pt-BR");

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Usuario buscar(Long id) {
        return usuarios.findById(id)
                .orElseThrow(() -> RegraNegocioException.naoEncontrado("Usuário não encontrado."));
    }

    @Transactional
    public Usuario atualizarPerfil(Long id, PerfilRequest req) {
        Usuario usuario = buscar(id);
        String email = req.email().trim().toLowerCase(Locale.ROOT);

        usuarios.findByEmailIgnoreCase(email)
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw RegraNegocioException.conflito("Este e-mail já está em uso por outra conta.");
                });

        usuario.setNome(req.nome().trim());
        usuario.setEmail(email);
        usuario.setTelefone(vazioParaNulo(req.telefone()));
        usuario.setCelular(vazioParaNulo(req.celular()));
        usuario.setDataNascimento(req.dataNascimento());
        usuario.setSexo(req.sexo());
        usuario.setCidade(vazioParaNulo(req.cidade()));
        return usuario;
    }

    @Transactional
    public void alterarSenha(Long id, AlterarSenhaRequest req) {
        Usuario usuario = buscar(id);
        if (!passwordEncoder.matches(req.senhaAtual(), usuario.getSenhaHash())) {
            throw RegraNegocioException.invalido("A senha atual está incorreta.");
        }
        usuario.setSenhaHash(passwordEncoder.encode(req.novaSenha()));
    }

    @Transactional
    public Usuario atualizarPreferencias(Long id, PreferenciasRequest req) {
        if (!IDIOMAS.contains(req.idioma())) {
            throw RegraNegocioException.invalido("Idioma não suportado.");
        }
        try {
            ZoneId.of(req.fusoHorario());
        } catch (DateTimeException e) {
            throw RegraNegocioException.invalido("Fuso horário inválido.");
        }

        Usuario usuario = buscar(id);
        usuario.setIdioma(req.idioma());
        usuario.setFusoHorario(req.fusoHorario());
        if (req.tema() != null) {
            usuario.setTema(req.tema());
        }
        return usuario;
    }

    @Transactional
    public Usuario alterarPlano(Long id, Plano plano) {
        Usuario usuario = buscar(id);
        usuario.setPlano(plano);
        return usuario;
    }

    @Transactional
    public void excluirConta(Long id, String senha) {
        Usuario usuario = buscar(id);
        if (!passwordEncoder.matches(senha, usuario.getSenhaHash())) {
            throw RegraNegocioException.invalido("Senha incorreta.");
        }
        usuarios.delete(usuario);
    }

    private static String vazioParaNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
