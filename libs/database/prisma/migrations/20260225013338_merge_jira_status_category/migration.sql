/*
  Warnings:

  - You are about to drop the `jira_status_category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "jira_status_category_key_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "jira_status_category";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jira_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category_name" TEXT,
    "category_key" TEXT,
    "color_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_jira_status" ("category_name", "created_at", "id", "name", "updated_at") SELECT "category_name", "created_at", "id", "name", "updated_at" FROM "jira_status";
DROP TABLE "jira_status";
ALTER TABLE "new_jira_status" RENAME TO "jira_status";
CREATE INDEX "jira_status_category_name_idx" ON "jira_status"("category_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
