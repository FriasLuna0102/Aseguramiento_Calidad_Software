package org.example.gestion_inventario.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestPropertySource("classpath:application-test.properties")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testPublicLoginAccess() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "username": "admin",
                          "password": "admin123"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void testUnauthorizedProductAccess() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(""));
    }


    @Test
    void testAuthorizedProductAccess() throws Exception {
        String token = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "username": "admin",
                          "password": "admin123"
                        }
                        """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String jwt = token.replaceAll(".*\"token\"\\s*:\\s*\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/products")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
    }
}
