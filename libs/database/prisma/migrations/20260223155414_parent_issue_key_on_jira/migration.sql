/*
  Warnings:

  - You are about to drop the column `parentIssueId` on the `jira_issue` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jira_issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issue_type" TEXT NOT NULL,
    "assignee_email" TEXT,
    "priority" TEXT NOT NULL,
    "epic_key" TEXT,
    "parent_issue_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "jira_issue_parent_issue_key_fkey" FOREIGN KEY ("parent_issue_key") REFERENCES "jira_issue" ("key") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_jira_issue" ("assignee_email", "created_at", "epic_key", "id", "issue_type", "key", "priority", "status", "summary", "updated_at") SELECT "assignee_email", "created_at", "epic_key", "id", "issue_type", "key", "priority", "status", "summary", "updated_at" FROM "jira_issue";
DROP TABLE "jira_issue";
ALTER TABLE "new_jira_issue" RENAME TO "jira_issue";
CREATE UNIQUE INDEX "jira_issue_key_key" ON "jira_issue"("key");
CREATE UNIQUE INDEX "jira_issue_parent_issue_key_key" ON "jira_issue"("parent_issue_key");
CREATE INDEX "jira_issue_parent_issue_key_idx" ON "jira_issue"("parent_issue_key");
CREATE INDEX "jira_issue_key_idx" ON "jira_issue"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
