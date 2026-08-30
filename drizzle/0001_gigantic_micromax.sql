CREATE TABLE `productReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productHandle` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(160),
	`body` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `review_user_product_unique` UNIQUE(`userId`,`productHandle`)
);
--> statement-breakpoint
CREATE TABLE `wishlistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productHandle` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlistItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlist_user_product_unique` UNIQUE(`userId`,`productHandle`)
);
--> statement-breakpoint
CREATE INDEX `review_product_status_idx` ON `productReviews` (`productHandle`,`status`);--> statement-breakpoint
CREATE INDEX `wishlist_user_idx` ON `wishlistItems` (`userId`);