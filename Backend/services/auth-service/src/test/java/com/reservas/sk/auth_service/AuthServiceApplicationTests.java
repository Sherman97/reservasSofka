package com.reservas.sk.auth_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:auth_ctx;MODE=MySQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"app.jwt.secret=test-secret-key-for-auth-service-1234567890-abcdef"
})
class AuthServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}

