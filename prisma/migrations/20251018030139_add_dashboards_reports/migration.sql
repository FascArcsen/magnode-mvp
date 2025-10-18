-- CreateTable
CREATE TABLE "dashboards" (
    "dashboard_id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "layout_config" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "report" (
    "report_id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "dashboard_id" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data_source" TEXT NOT NULL,
    "query_config" JSONB NOT NULL,
    "visualization" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "report_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards" ("dashboard_id") ON DELETE SET NULL ON UPDATE CASCADE
);
