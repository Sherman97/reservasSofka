CREATE TABLE IF NOT EXISTS reservation_handover_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  space_id INT NOT NULL,
  user_id INT NOT NULL,
  staff_id INT NOT NULL,
  action VARCHAR(30) NOT NULL,
  novelty TEXT NULL,
  event_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_handover_reservation (reservation_id),
  KEY idx_handover_space (space_id),
  KEY idx_handover_user (user_id),
  KEY idx_handover_staff (staff_id),
  KEY idx_handover_action_event_at (action, event_at),

  CONSTRAINT fk_handover_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_handover_space
    FOREIGN KEY (space_id) REFERENCES spaces(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_handover_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_handover_staff
    FOREIGN KEY (staff_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

