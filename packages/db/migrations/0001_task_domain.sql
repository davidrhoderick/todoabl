CREATE TABLE `lists` (
  `color` text,
  `created_at` integer NOT NULL,
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `updated_at` integer NOT NULL,
  `user_id` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `lists_user_id_idx` ON `lists` (`user_id`);
--> statement-breakpoint
CREATE TABLE `tasks` (
  `completed_at` integer,
  `created_at` integer NOT NULL,
  `deadline_at` integer,
  `id` text PRIMARY KEY NOT NULL,
  `latitude` real,
  `list_id` text NOT NULL,
  `longitude` real,
  `notes` text,
  `parent_task_id` text,
  `reminder_at` integer,
  `start_at` integer,
  `state` text NOT NULL,
  `title` text NOT NULL,
  `updated_at` integer NOT NULL,
  `user_id` text NOT NULL,
  FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`parent_task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tasks_list_id_idx` ON `tasks` (`list_id`);
--> statement-breakpoint
CREATE INDEX `tasks_parent_task_id_idx` ON `tasks` (`parent_task_id`);
--> statement-breakpoint
CREATE INDEX `tasks_user_id_idx` ON `tasks` (`user_id`);
--> statement-breakpoint
CREATE TABLE `task_updates` (
  `body` text NOT NULL,
  `created_at` integer NOT NULL,
  `id` text PRIMARY KEY NOT NULL,
  `task_id` text NOT NULL,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `task_updates_task_id_idx` ON `task_updates` (`task_id`);
