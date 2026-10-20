CREATE TABLE `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`participant` text NOT NULL,
	`selections` text NOT NULL,
	`experience` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`room`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `responses_room_participant` ON `responses` (`room`,`participant`);--> statement-breakpoint
CREATE INDEX `responses_room_created` ON `responses` (`room`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`host_hash` text NOT NULL,
	`slide` integer DEFAULT 0 NOT NULL,
	`poll_open` integer DEFAULT 1 NOT NULL,
	`blackout` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
