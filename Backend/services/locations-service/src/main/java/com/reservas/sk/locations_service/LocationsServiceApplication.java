package com.reservas.sk.locations_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class LocationsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LocationsServiceApplication.class, args);
    }
}






