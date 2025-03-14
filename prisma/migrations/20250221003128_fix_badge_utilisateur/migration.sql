/*
  Warnings:

  - The primary key for the `badgeutilisateur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `badgeutilisateur` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `badgeutilisateur` DROP FOREIGN KEY `BadgeUtilisateur_badge_id_fkey`;

-- DropForeignKey
ALTER TABLE `badgeutilisateur` DROP FOREIGN KEY `BadgeUtilisateur_utilisateur_id_fkey`;

-- AlterTable
ALTER TABLE `badgeutilisateur` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`utilisateur_id`, `badge_id`);

-- AddForeignKey
ALTER TABLE `BadgeUtilisateur` ADD CONSTRAINT `BadgeUtilisateur_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BadgeUtilisateur` ADD CONSTRAINT `BadgeUtilisateur_badge_id_fkey` FOREIGN KEY (`badge_id`) REFERENCES `Badge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
