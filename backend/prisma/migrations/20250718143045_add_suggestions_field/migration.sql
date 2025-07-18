/*
  Warnings:

  - You are about to drop the column `suggestedFix` on the `PullRequest` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `number` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pullRequestId_fkey";

-- AlterTable
ALTER TABLE "PullRequest" DROP COLUMN "suggestedFix",
ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "suggestions" TEXT;

-- DropTable
DROP TABLE "Comment";
