ALTER TABLE "subjects" ADD COLUMN "code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_code_unique" UNIQUE("code");