<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241216012322 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Elimina esta línea, porque la tabla ya existe:
        // $this->addSql('CREATE TABLE empleado ...');
    
        // Deja solo la creación de la tabla `user` si es necesario
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL COMMENT \'(DC2Type:json)\', password VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    
        // También puedes dejar el Foreign Key si la tabla `user` existe
        $this->addSql('ALTER TABLE empleado ADD CONSTRAINT FK_D9D9BF52DB38439E FOREIGN KEY (usuario_id) REFERENCES user (id)');
    }
    

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE empleado DROP FOREIGN KEY FK_D9D9BF52DB38439E');
        $this->addSql('DROP TABLE empleado');
        $this->addSql('DROP TABLE user');
    }
}
