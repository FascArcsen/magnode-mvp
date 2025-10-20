-- CreateTable
CREATE TABLE "platform_connections" (
    "connection_id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "platform_type" TEXT NOT NULL,
    "platform_name" TEXT NOT NULL,
    "status" TEXT DEFAULT 'inactive',
    "last_sync_at" DATETIME,
    "next_sync_at" DATETIME,
    "total_records_synced" INTEGER DEFAULT 0,
    "total_audit_logs_created" INTEGER DEFAULT 0,
    "sync_frequency_minutes" INTEGER DEFAULT 60,
    "auth_config" JSONB NOT NULL,
    "connector_config" JSONB NOT NULL,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "raw_platform_data" (
    "raw_data_id" TEXT NOT NULL PRIMARY KEY,
    "connection_id" TEXT,
    "endpoint_id" TEXT,
    "data_source" TEXT,
    "raw_payload" JSONB NOT NULL,
    "processed" BOOLEAN DEFAULT false,
    "mapped_to_audit_log" BOOLEAN DEFAULT false,
    "audit_log_ids" TEXT,
    "processing_errors" JSONB,
    "extracted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "record_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sync_results" (
    "sync_id" TEXT NOT NULL PRIMARY KEY,
    "connection_id" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    "status" TEXT,
    "duration_ms" INTEGER,
    "stats" JSONB,
    "errors" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "llm_assisted_configs" (
    "config_id" TEXT NOT NULL PRIMARY KEY,
    "connection_id" TEXT,
    "llm_provider" TEXT,
    "model_used" TEXT,
    "prompt_sent" TEXT,
    "llm_response" JSONB,
    "generated_config" JSONB,
    "validation_status" TEXT,
    "error_logs" JSONB,
    "prompt_tokens" INTEGER,
    "completion_tokens" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "oauth_tokens" (
    "token_id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_type" TEXT,
    "expires_at" DATETIME,
    "scope" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_source" TEXT NOT NULL,
    "user_id" TEXT,
    "metadata" TEXT NOT NULL,
    "raw_event_data" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_run_logs" (
    "run_id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "records_processed" INTEGER NOT NULL,
    "error_message" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" DATETIME NOT NULL,
    "duration_ms" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "entity_nodes" (
    "node_id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL,
    "relevance" REAL NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "relations_map" (
    "relation_id" TEXT NOT NULL PRIMARY KEY,
    "source_node" TEXT NOT NULL,
    "target_node" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    "context_label" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "page_configs" (
    "page_id" TEXT NOT NULL PRIMARY KEY,
    "org_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "layout" JSONB,
    "parameters" JSONB,
    "related_nodes" JSONB,
    "generated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

-- CreateIndex
CREATE INDEX "platform_connections_org_id_idx" ON "platform_connections"("org_id");

-- CreateIndex
CREATE INDEX "platform_connections_platform_type_idx" ON "platform_connections"("platform_type");

-- CreateIndex
CREATE INDEX "platform_connections_status_idx" ON "platform_connections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "platform_connections_org_id_platform_name_key" ON "platform_connections"("org_id", "platform_name");

-- CreateIndex
CREATE INDEX "raw_platform_data_connection_id_idx" ON "raw_platform_data"("connection_id");

-- CreateIndex
CREATE INDEX "raw_platform_data_record_type_idx" ON "raw_platform_data"("record_type");

-- CreateIndex
CREATE INDEX "raw_platform_data_mapped_to_audit_log_idx" ON "raw_platform_data"("mapped_to_audit_log");

-- CreateIndex
CREATE INDEX "sync_results_connection_id_idx" ON "sync_results"("connection_id");

-- CreateIndex
CREATE INDEX "sync_results_status_idx" ON "sync_results"("status");

-- CreateIndex
CREATE INDEX "llm_assisted_configs_connection_id_idx" ON "llm_assisted_configs"("connection_id");

-- CreateIndex
CREATE INDEX "oauth_tokens_org_id_idx" ON "oauth_tokens"("org_id");

-- CreateIndex
CREATE INDEX "oauth_tokens_provider_idx" ON "oauth_tokens"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_tokens_org_id_provider_key" ON "oauth_tokens"("org_id", "provider");

-- CreateIndex
CREATE INDEX "audit_logs_org_id_idx" ON "audit_logs"("org_id");

-- CreateIndex
CREATE INDEX "audit_logs_connection_id_idx" ON "audit_logs"("connection_id");

-- CreateIndex
CREATE INDEX "audit_logs_event_type_idx" ON "audit_logs"("event_type");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "entity_nodes_org_id_idx" ON "entity_nodes"("org_id");

-- CreateIndex
CREATE INDEX "entity_nodes_type_idx" ON "entity_nodes"("type");

-- CreateIndex
CREATE INDEX "relations_map_source_node_idx" ON "relations_map"("source_node");

-- CreateIndex
CREATE INDEX "relations_map_target_node_idx" ON "relations_map"("target_node");

-- CreateIndex
CREATE INDEX "page_configs_org_id_idx" ON "page_configs"("org_id");

-- CreateIndex
CREATE INDEX "page_configs_type_idx" ON "page_configs"("type");

-- CreateIndex
CREATE INDEX "dashboards_org_id_idx" ON "dashboards"("org_id");

-- CreateIndex
CREATE INDEX "report_org_id_idx" ON "report"("org_id");

-- CreateIndex
CREATE INDEX "report_type_idx" ON "report"("type");
