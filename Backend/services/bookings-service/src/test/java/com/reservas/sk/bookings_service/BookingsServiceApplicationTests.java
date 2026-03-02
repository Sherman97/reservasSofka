package com.reservas.sk.bookings_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:bookings_ctx;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "app.jwt.secret=test-secret-key-for-bookings-service-1234567890-abcdef"
})
class BookingsServiceApplicationTests {
    @Test
    void contextLoads() {
    }
}




