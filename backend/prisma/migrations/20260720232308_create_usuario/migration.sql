/*
  Warnings:

  - The `perfil` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'FUNCIONARIO');

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "perfil",
ADD COLUMN     "perfil" "Perfil" NOT NULL DEFAULT 'FUNCIONARIO';
