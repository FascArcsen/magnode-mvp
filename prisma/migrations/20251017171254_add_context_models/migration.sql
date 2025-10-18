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
