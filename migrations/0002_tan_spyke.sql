CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`hero_eyebrow` text,
	`hero_heading` text,
	`hero_body_md` text,
	`hero_cta_label` text,
	`hero_cta_href` text,
	`developer_title` text,
	`developer_name` text,
	`developer_badge` text,
	`bio_md` text,
	`contact_email` text,
	`contact_phone` text,
	`contact_location` text,
	`developer_media_key` text,
	`background_media_key` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
