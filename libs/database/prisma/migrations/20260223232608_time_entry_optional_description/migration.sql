-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_time_entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issue_key" TEXT NOT NULL,
    "time_spent_seconds" INTEGER,
    "started_at" DATETIME NOT NULL,
    "description" TEXT,
    "sync_status" TEXT NOT NULL DEFAULT 'LOCAL',
    "sync_error" TEXT,
    "worklog_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "time_entry_issue_key_fkey" FOREIGN KEY ("issue_key") REFERENCES "jira_issue" ("key") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "time_entry_worklog_id_fkey" FOREIGN KEY ("worklog_id") REFERENCES "worklog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_time_entry" ("created_at", "description", "id", "issue_key", "started_at", "sync_error", "sync_status", "time_spent_seconds", "updated_at", "worklog_id") SELECT "created_at", "description", "id", "issue_key", "started_at", "sync_error", "sync_status", "time_spent_seconds", "updated_at", "worklog_id" FROM "time_entry";
DROP TABLE "time_entry";
ALTER TABLE "new_time_entry" RENAME TO "time_entry";
CREATE UNIQUE INDEX "time_entry_worklog_id_key" ON "time_entry"("worklog_id");
CREATE INDEX "time_entry_issue_key_idx" ON "time_entry"("issue_key");
CREATE INDEX "time_entry_sync_status_idx" ON "time_entry"("sync_status");
CREATE INDEX "time_entry_started_at_idx" ON "time_entry"("started_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
