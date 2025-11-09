-- Este script concede todas as permissões necessárias ao nosso utilizador 'user'.
-- O '*' significa "em todas as bases de dados e todas as tabelas".
-- O '%' significa "de qualquer host".
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%';
