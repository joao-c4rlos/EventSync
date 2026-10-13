package br.com.eventsync.financeiro;

import br.com.eventsync.financeiro.FinanceiroDtos.LancamentoRequest;
import br.com.eventsync.financeiro.FinanceiroDtos.LancamentoResponse;
import br.com.eventsync.financeiro.FinanceiroDtos.ResumoMensal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/financeiro")
@RequiredArgsConstructor
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @GetMapping("/resumo")
    public ResumoMensal resumo(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) YearMonth mes) {
        return financeiroService.resumo(idDo(jwt), mesOuAtual(mes));
    }

    @GetMapping("/lancamentos")
    public List<LancamentoResponse> listar(@AuthenticationPrincipal Jwt jwt,
                                           @RequestParam(required = false) YearMonth mes,
                                           @RequestParam(required = false) Long eventoId) {
        return financeiroService.listar(idDo(jwt), mesOuAtual(mes), eventoId);
    }

    @PostMapping("/lancamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public LancamentoResponse criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody LancamentoRequest req) {
        return financeiroService.criar(idDo(jwt), req);
    }

    @PutMapping("/lancamentos/{id}")
    public LancamentoResponse atualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                        @Valid @RequestBody LancamentoRequest req) {
        return financeiroService.atualizar(idDo(jwt), id, req);
    }

    @PatchMapping("/lancamentos/{id}/status")
    public LancamentoResponse alterarStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                            @Valid @RequestBody StatusRequest req) {
        return financeiroService.alterarStatus(idDo(jwt), id, req.status());
    }

    @DeleteMapping("/lancamentos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        financeiroService.excluir(idDo(jwt), id);
    }

    public record StatusRequest(@NotNull(message = "Informe o status.") StatusLancamento status) {
    }

    private static YearMonth mesOuAtual(YearMonth mes) {
        return mes != null ? mes : YearMonth.now();
    }

    private static Long idDo(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
