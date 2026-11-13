-- Banco usado pelos testes de integração do back-end (eventsync_test)
CREATE DATABASE IF NOT EXISTS eventsync_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON eventsync_test.* TO 'eventsync'@'%';
FLUSH PRIVILEGES;
