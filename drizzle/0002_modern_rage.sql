CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`imageUrl` text,
	`category` varchar(64) NOT NULL DEFAULT 'mindset',
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `digital_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'guide',
	`imageUrl` text,
	`fileKey` text,
	`fileUrl` text,
	`fileName` varchar(255),
	`badge` varchar(64),
	`published` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `digital_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `digital_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`stripePaymentIntentId` varchar(128),
	`downloadToken` varchar(128) NOT NULL,
	`downloadedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `digital_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `digital_purchases_downloadToken_unique` UNIQUE(`downloadToken`)
);
