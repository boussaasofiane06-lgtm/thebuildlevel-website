ALTER TABLE `digital_products` ADD `productType` enum('pdf','audiobook','video','other') DEFAULT 'pdf' NOT NULL;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `audioUrl` text;--> statement-breakpoint
ALTER TABLE `digital_products` ADD `duration` varchar(32);