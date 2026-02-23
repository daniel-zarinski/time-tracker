/*
  Warnings:

  - You are about to drop the column `createdAt` on the `jira_issue` table. All the data in the column will be lost.
  - You are about to drop the column `epicKey` on the `jira_issue` table. All the data in the column will be lost.
  - You are about to drop the column `issueType` on the `jira_issue` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `jira_issue` table. All the data in the column will be lost.
  - Added the required column `issue_type` to the `jira_issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `jira_issue` table without a default value. This is not possible if the table is not empty.

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
    "parentIssueId" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "jira_issue_parentIssueId_fkey" FOREIGN KEY ("parentIssueId") REFERENCES "jira_issue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_jira_issue" ("id", "key", "parentIssueId", "priority", "status", "summary") SELECT "id", "key", "parentIssueId", "priority", "status", "summary" FROM "jira_issue";
DROP TABLE "jira_issue";
ALTER TABLE "new_jira_issue" RENAME TO "jira_issue";
CREATE UNIQUE INDEX "jira_issue_key_key" ON "jira_issue"("key");
CREATE UNIQUE INDEX "jira_issue_parentIssueId_key" ON "jira_issue"("parentIssueId");
CREATE INDEX "jira_issue_parentIssueId_idx" ON "jira_issue"("parentIssueId");
CREATE INDEX "jira_issue_key_idx" ON "jira_issue"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
