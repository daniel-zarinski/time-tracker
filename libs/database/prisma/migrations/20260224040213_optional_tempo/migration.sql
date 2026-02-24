-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_worklog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tempo_worklog_id" INTEGER NOT NULL,
    "jira_worklog_id" INTEGER,
    "issue_key" TEXT,
    "issue_id" INTEGER,
    "time_spent_seconds" INTEGER NOT NULL,
    "billable_seconds" INTEGER NOT NULL DEFAULT 0,
    "started_at" DATETIME NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "author_account_id" TEXT NOT NULL,
    "author_name" TEXT,
    "tempo_created_at" TEXT,
    "tempo_updated_at" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "worklog_issue_key_fkey" FOREIGN KEY ("issue_key") REFERENCES "jira_issue" ("key") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_worklog" ("author_account_id", "author_name", "billable_seconds", "created_at", "description", "id", "issue_id", "issue_key", "jira_worklog_id", "started_at", "tempo_created_at", "tempo_updated_at", "tempo_worklog_id", "time_spent_seconds", "updated_at") SELECT "author_account_id", "author_name", "billable_seconds", "created_at", "description", "id", "issue_id", "issue_key", "jira_worklog_id", "started_at", "tempo_created_at", "tempo_updated_at", "tempo_worklog_id", "time_spent_seconds", "updated_at" FROM "worklog";
DROP TABLE "worklog";
ALTER TABLE "new_worklog" RENAME TO "worklog";
CREATE UNIQUE INDEX "worklog_tempo_worklog_id_key" ON "worklog"("tempo_worklog_id");
CREATE INDEX "worklog_issue_key_idx" ON "worklog"("issue_key");
CREATE INDEX "worklog_tempo_worklog_id_idx" ON "worklog"("tempo_worklog_id");
CREATE INDEX "worklog_author_account_id_idx" ON "worklog"("author_account_id");
CREATE INDEX "worklog_started_at_idx" ON "worklog"("started_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
