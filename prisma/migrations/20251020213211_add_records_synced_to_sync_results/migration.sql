-- AlterTable
ALTER TABLE "sync_results" ADD COLUMN "incremental" BOOLEAN DEFAULT false;
ALTER TABLE "sync_results" ADD COLUMN "records_synced" INTEGER DEFAULT 0;
