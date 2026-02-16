package com.reservas.sk.bookings_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BookingsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookingsServiceApplication.class, args);
    }
}







