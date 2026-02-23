-- CreateTable
CREATE TABLE "worklog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tempo_worklog_id" INTEGER NOT NULL,
    "jira_worklog_id" INTEGER,
    "issue_key" TEXT NOT NULL,
    "issue_id" INTEGER NOT NULL,
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
    CONSTRAINT "worklog_issue_key_fkey" FOREIGN KEY ("issue_key") REFERENCES "jira_issue" ("key") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issue_key" TEXT NOT NULL,
    "time_spent_seconds" INTEGER NOT NULL,
    "started_at" DATETIME NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sync_status" TEXT NOT NULL DEFAULT 'local',
    "sync_error" TEXT,
    "worklog_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "time_entry_issue_key_fkey" FOREIGN KEY ("issue_key") REFERENCES "jira_issue" ("key") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "time_entry_worklog_id_fkey" FOREIGN KEY ("worklog_id") REFERENCES "worklog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "worklog_tempo_worklog_id_key" ON "worklog"("tempo_worklog_id");

-- CreateIndex
CREATE INDEX "worklog_issue_key_idx" ON "worklog"("issue_key");

-- CreateIndex
CREATE INDEX "worklog_tempo_worklog_id_idx" ON "worklog"("tempo_worklog_id");

-- CreateIndex
CREATE INDEX "worklog_author_account_id_idx" ON "worklog"("author_account_id");

-- CreateIndex
CREATE INDEX "worklog_started_at_idx" ON "worklog"("started_at");

-- CreateIndex
CREATE UNIQUE INDEX "time_entry_worklog_id_key" ON "time_entry"("worklog_id");

-- CreateIndex
CREATE INDEX "time_entry_issue_key_idx" ON "time_entry"("issue_key");

-- CreateIndex
CREATE INDEX "time_entry_sync_status_idx" ON "time_entry"("sync_status");

-- CreateIndex
CREATE INDEX "time_entry_started_at_idx" ON "time_entry"("started_at");
