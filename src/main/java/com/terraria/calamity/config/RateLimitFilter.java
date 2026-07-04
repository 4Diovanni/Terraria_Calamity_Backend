package com.terraria.calamity.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Limita requisições por IP: 5/min em /api/v1/auth/**, 60/min nas demais rotas
 * /api/v1/**. Em memória (single-instance) via Bucket4j. Roda antes do
 * JwtAuthenticationFilter para rejeitar cedo, sem validar token ou tocar no banco.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_CAPACITY_PER_MINUTE = 5;
    private static final int DEFAULT_CAPACITY_PER_MINUTE = 60;

    private final ConcurrentHashMap<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> defaultBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = resolveClientIp(request);
        boolean isAuthRoute = request.getRequestURI().startsWith("/api/v1/auth/");

        Bucket bucket = isAuthRoute
                ? authBuckets.computeIfAbsent(clientIp, ip -> newBucket(AUTH_CAPACITY_PER_MINUTE))
                : defaultBuckets.computeIfAbsent(clientIp, ip -> newBucket(DEFAULT_CAPACITY_PER_MINUTE));

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            filterChain.doFilter(request, response);
            return;
        }

        long waitSeconds = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill()) + 1;
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"status\":429,\"message\":\"Muitas requisições. Tente novamente em instantes.\"}");
    }

    private Bucket newBucket(int capacityPerMinute) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacityPerMinute)
                .refillGreedy(capacityPerMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        // Não confiar em X-Forwarded-For: é fornecido pelo cliente e pode ser
        // forjado para girar de IP a cada requisição e furar o rate limit.
        // getRemoteAddr() reflete a conexão TCP real (ou o proxy confiável,
        // se um dia for necessário resolver IP real atrás de LB, isso deve
        // ser feito via configuração explícita de proxy confiável, não aqui).
        return request.getRemoteAddr();
    }
}
