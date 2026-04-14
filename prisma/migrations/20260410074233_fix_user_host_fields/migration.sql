/*
  Warnings:

  - You are about to drop the column `profileImage` on the `Host` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Host` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Host" DROP COLUMN "profileImage",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "pictureUrl" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "pictureUrl" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Host_username_key" ON "Host"("username");
