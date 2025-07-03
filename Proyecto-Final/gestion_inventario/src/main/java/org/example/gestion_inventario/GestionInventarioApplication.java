package org.example.gestion_inventario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GestionInventarioApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionInventarioApplication.class, args);

        String DATABASE_URL = System.getenv("SPRING_DATASOURCE_URL");

        if (DATABASE_URL == null || DATABASE_URL.isEmpty()) {
            System.out.println("No se ha configurado la variable de entorno SPRING_DATASOURCE_URL");
        } else {
            System.out.println("Conectando a la base de datos: " + DATABASE_URL);
        }

        String port = System.getenv("APP_PORT");
        if (port == null || port.isEmpty()) {
            System.out.println("No se ha configurado la variable de entorno APP_PORT, usando el puerto por defecto 8080");
        } else {
            System.out.println("La aplicación se está ejecutando en el puerto: " + port);
        }


    }

}
