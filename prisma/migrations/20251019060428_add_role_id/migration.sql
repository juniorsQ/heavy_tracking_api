/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roleId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_name_key" ON "user_roles"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
