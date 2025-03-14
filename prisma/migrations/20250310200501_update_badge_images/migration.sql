/*
  Warnings:

  - The primary key for the `badgeutilisateur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `BadgeUtilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `badge` MODIFY `image_url` VARCHAR(191) NOT NULL DEFAULT '/assets/img/default.png';

-- AlterTable
ALTER TABLE `badgeutilisateur` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
