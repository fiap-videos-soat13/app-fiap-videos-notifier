CREATE TABLE "processed_events" (
	"event_id" uuid NOT NULL,
	"consumer_name" varchar(128) NOT NULL,
	"event_type" varchar(128) NOT NULL,
	"video_job_id" uuid NOT NULL,
	"processed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "processed_events_event_consumer_idx" ON "processed_events" USING btree ("event_id","consumer_name");
