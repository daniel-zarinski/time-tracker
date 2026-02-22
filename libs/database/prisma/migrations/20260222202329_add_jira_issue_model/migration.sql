-- CreateTable
CREATE TABLE "JiraIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "epicKey" TEXT,
    "parentIssueId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "JiraIssue_key_key" ON "JiraIssue"("key");
