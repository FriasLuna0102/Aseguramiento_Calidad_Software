package org.example.gestion_inventario.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1) Desactivar CSRF para tu permitir las perticiones al API REST
//                .csrf(csrf -> csrf.disable())
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        // endpoints públicos
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info", "/actuator/prometheus", "/actuator/metrics").permitAll()
                        // todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )

                // 3) Habilitar Basic Auth (podrías cambiar a JWT u OAuth2 más adelante)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // 4) PasswordEncoder para usuarios en memoria o JDBC
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService(PasswordEncoder encoder) {
        // Usuarios en memoria para pruebas
        UserDetails admin = User.withUsername("admin")
                .password(encoder.encode("admin123"))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }
}
