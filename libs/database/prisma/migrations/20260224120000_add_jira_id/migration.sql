-- AlterTable
ALTER TABLE "jira_issue" ADD COLUMN "jira_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "jira_issue_jira_id_key" ON "jira_issue"("jira_id");
