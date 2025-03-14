/*
  Warnings:

  - Added the required column `materiel` to the `Lan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lan` ADD COLUMN `materiel` VARCHAR(191) NOT NULL DEFAULT '';
