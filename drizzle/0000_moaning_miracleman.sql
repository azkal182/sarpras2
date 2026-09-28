CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "divisions_event_slug_unique" UNIQUE("event_id","slug")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"event_date" date NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"from_division_id" uuid NOT NULL,
	"to_division_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"location" text,
	"deadline_offset_days" integer,
	"note" text,
	"is_fulfilled" boolean DEFAULT false NOT NULL,
	"fulfilled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "requests_quantity_positive" CHECK ("requests"."quantity" > 0),
	CONSTRAINT "requests_deadline_range" CHECK ("requests"."deadline_offset_days" is null or "requests"."deadline_offset_days" between 0 and 365),
	CONSTRAINT "requests_different_divisions" CHECK ("requests"."from_division_id" <> "requests"."to_division_id")
);
--> statement-breakpoint
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_from_division_id_divisions_id_fk" FOREIGN KEY ("from_division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_to_division_id_divisions_id_fk" FOREIGN KEY ("to_division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "divisions_event_idx" ON "divisions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "events_active_idx" ON "events" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "events_only_one_active_idx" ON "events" ("is_active") WHERE "is_active" = true;--> statement-breakpoint
CREATE INDEX "requests_event_idx" ON "requests" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "requests_from_division_idx" ON "requests" USING btree ("from_division_id");--> statement-breakpoint
CREATE INDEX "requests_to_division_idx" ON "requests" USING btree ("to_division_id");--> statement-breakpoint
CREATE INDEX "requests_status_idx" ON "requests" USING btree ("is_fulfilled");
