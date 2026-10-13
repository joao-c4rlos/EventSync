package br.com.eventsync.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, Long> {

    Optional<TokenRedefinicaoSenha> findByTokenHash(String tokenHash);
}
