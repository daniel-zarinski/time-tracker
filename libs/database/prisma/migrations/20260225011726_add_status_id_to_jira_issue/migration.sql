-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jira_issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jira_id" INTEGER,
    "key" TEXT,
    "summary" TEXT,
    "status" TEXT,
    "status_id" TEXT,
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
INSERT INTO "new_jira_issue" ("assignee_email", "created_at", "epic_key", "id", "issue_type", "jira_id", "key", "parent_issue_key", "priority", "status", "summary", "synced_at", "updated_at") SELECT "assignee_email", "created_at", "epic_key", "id", "issue_type", "jira_id", "key", "parent_issue_key", "priority", "status", "summary", "synced_at", "updated_at" FROM "jira_issue";
DROP TABLE "jira_issue";
ALTER TABLE "new_jira_issue" RENAME TO "jira_issue";
CREATE UNIQUE INDEX "jira_issue_jira_id_key" ON "jira_issue"("jira_id");
CREATE UNIQUE INDEX "jira_issue_key_key" ON "jira_issue"("key");
CREATE INDEX "jira_issue_parent_issue_key_idx" ON "jira_issue"("parent_issue_key");
CREATE INDEX "jira_issue_key_idx" ON "jira_issue"("key");
CREATE INDEX "jira_issue_status_id_idx" ON "jira_issue"("status_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
