/*
  Warnings:

  - You are about to alter the column `status_id` on the `jira_issue` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `jira_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `jira_status` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jira_issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jira_id" INTEGER,
    "key" TEXT,
    "summary" TEXT,
    "status" TEXT,
    "status_id" INTEGER,
    "issue_type" TEXT,
    "assignee_email" TEXT,
    "priority" TEXT,
    "epic_key" TEXT,
    "parent_issue_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "synced_at" DATETIME,
    CONSTRAINT "jira_issue_parent_issue_key_fkey" FOREIGN KEY ("parent_issue_key") REFERENCES "jira_issue" ("key") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "jira_issue_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "jira_status" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_jira_issue" ("assignee_email", "created_at", "epic_key", "id", "issue_type", "jira_id", "key", "parent_issue_key", "priority", "status", "status_id", "summary", "synced_at", "updated_at") SELECT "assignee_email", "created_at", "epic_key", "id", "issue_type", "jira_id", "key", "parent_issue_key", "priority", "status", "status_id", "summary", "synced_at", "updated_at" FROM "jira_issue";
DROP TABLE "jira_issue";
ALTER TABLE "new_jira_issue" RENAME TO "jira_issue";
CREATE UNIQUE INDEX "jira_issue_jira_id_key" ON "jira_issue"("jira_id");
CREATE UNIQUE INDEX "jira_issue_key_key" ON "jira_issue"("key");
CREATE INDEX "jira_issue_parent_issue_key_idx" ON "jira_issue"("parent_issue_key");
CREATE INDEX "jira_issue_key_idx" ON "jira_issue"("key");
CREATE INDEX "jira_issue_status_id_idx" ON "jira_issue"("status_id");
CREATE TABLE "new_jira_status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category_name" TEXT,
    "category_key" TEXT,
    "color_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_jira_status" ("category_key", "category_name", "color_name", "created_at", "id", "name", "updated_at") SELECT "category_key", "category_name", "color_name", "created_at", "id", "name", "updated_at" FROM "jira_status";
DROP TABLE "jira_status";
ALTER TABLE "new_jira_status" RENAME TO "jira_status";
CREATE INDEX "jira_status_category_name_idx" ON "jira_status"("category_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
