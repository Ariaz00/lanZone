-- DropForeignKey
ALTER TABLE `lan` DROP FOREIGN KEY `LAN_organisateur_id_fkey`;

-- AddForeignKey
ALTER TABLE `Lan` ADD CONSTRAINT `Lan_organisateur_id_fkey` FOREIGN KEY (`organisateur_id`) REFERENCES `Utilisateur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
