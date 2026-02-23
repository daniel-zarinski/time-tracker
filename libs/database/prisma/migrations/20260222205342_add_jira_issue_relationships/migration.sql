-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JiraIssue" (
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
    CONSTRAINT "JiraIssue_parentIssueId_fkey" FOREIGN KEY ("parentIssueId") REFERENCES "JiraIssue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_JiraIssue" ("createdAt", "epicKey", "id", "issueType", "key", "parentIssueId", "priority", "status", "summary", "updatedAt") SELECT "createdAt", "epicKey", "id", "issueType", "key", "parentIssueId", "priority", "status", "summary", "updatedAt" FROM "JiraIssue";
DROP TABLE "JiraIssue";
ALTER TABLE "new_JiraIssue" RENAME TO "JiraIssue";
CREATE UNIQUE INDEX "JiraIssue_key_key" ON "JiraIssue"("key");
CREATE UNIQUE INDEX "JiraIssue_parentIssueId_key" ON "JiraIssue"("parentIssueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
