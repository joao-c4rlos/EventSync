package br.com.eventsync.dashboard;

import br.com.eventsync.dashboard.DashboardDtos.Indicadores;
import br.com.eventsync.dashboard.DashboardDtos.InscricoesPorPeriodo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/indicadores")
    public Indicadores indicadores(@AuthenticationPrincipal Jwt jwt) {
        return dashboardService.indicadores(Long.valueOf(jwt.getSubject()));
    }

    @GetMapping("/inscricoes")
    public InscricoesPorPeriodo inscricoes(@AuthenticationPrincipal Jwt jwt,
                                           @RequestParam(defaultValue = "6") int meses,
                                           @RequestParam(required = false) List<Long> eventoIds) {
        return dashboardService.inscricoesPorMes(Long.valueOf(jwt.getSubject()), meses, eventoIds);
    }
}
