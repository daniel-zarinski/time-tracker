-- CreateTable
CREATE TABLE "jira_status_category" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "color_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "jira_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "jira_status_category_name_fkey" FOREIGN KEY ("category_name") REFERENCES "jira_status_category" ("name") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "jira_status_category_key_key" ON "jira_status_category"("key");

-- CreateIndex
CREATE INDEX "jira_status_category_name_idx" ON "jira_status"("category_name");
