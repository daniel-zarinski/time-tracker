/*
  Warnings:

  - You are about to drop the `JiraIssue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JiraIssue";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "jira_issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "epicKey" TEXT,
    "parentIssueId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "jira_issue_parentIssueId_fkey" FOREIGN KEY ("parentIssueId") REFERENCES "jira_issue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "jira_issue_key_key" ON "jira_issue"("key");

-- CreateIndex
CREATE UNIQUE INDEX "jira_issue_parentIssueId_key" ON "jira_issue"("parentIssueId");

-- CreateIndex
CREATE INDEX "jira_issue_parentIssueId_idx" ON "jira_issue"("parentIssueId");

-- CreateIndex
CREATE INDEX "jira_issue_key_idx" ON "jira_issue"("key");
