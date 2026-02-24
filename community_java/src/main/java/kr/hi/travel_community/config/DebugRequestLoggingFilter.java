package kr.hi.travel_community.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Debug instrumentation: logs PUT requests to /api/admin/* to debug-6f4c79.log
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DebugRequestLoggingFilter extends OncePerRequestFilter {

    private static final String LOG_PATH = "debug-6f4c79.log";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        if ("PUT".equalsIgnoreCase(method) && uri != null && uri.contains("/api/admin/")) {
            // #region agent log
            try {
                String data = "{\"method\":\"" + method + "\",\"uri\":\"" + (uri != null ? uri.replace("\"", "\\\"") : "") + "\"}";
                String line = "{\"sessionId\":\"6f4c79\",\"location\":\"DebugRequestLoggingFilter\",\"message\":\"Admin PUT request\",\"data\":" + data + ",\"timestamp\":" + System.currentTimeMillis() + ",\"hypothesisId\":\"H1\"}\n";
                File base = new File(System.getProperty("user.dir", "."));
                File logFile = base.getParentFile() != null ? new File(base.getParentFile(), LOG_PATH) : new File(LOG_PATH);
                try (FileOutputStream fos = new FileOutputStream(logFile, true)) {
                    fos.write(line.getBytes(StandardCharsets.UTF_8));
                }
            } catch (Exception ignored) {}
            // #endregion
        }
        filterChain.doFilter(request, response);
    }
}
