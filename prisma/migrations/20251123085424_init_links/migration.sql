/*
  Warnings:

  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Link";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "last_clicked" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "links_code_key" ON "links"("code");

-- CreateIndex
CREATE INDEX "links_code_idx" ON "links"("code");
