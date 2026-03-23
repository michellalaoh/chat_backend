CREATE TABLE "message_receipts" (
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_receipts_message_id_user_id_pk" PRIMARY KEY("message_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;