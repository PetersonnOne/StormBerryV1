# To-Do & Scheduler Module - TiDB Database Guide

**Date**: January 17, 2024
**Version**: 1.0

## TiDB Schema Overview
This guide covers the database schema and migration steps for the To-Do & Scheduler module using TiDB.

## Database Migration Steps

1. **Update Database Provider**
   ```env
   # Update DATABASE_URL in .env
   DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"
   ```

2. **Run Prisma Migration**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Create and apply migration
   npx prisma migrate dev --name add_todo_scheduler
   ```

## TiDB Schema Details

### Task Model
```sql
CREATE TABLE `Task` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `dueDate` DATETIME(3),
  `completedAt` DATETIME(3),
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `tags` JSON,
  `recurrenceRule` VARCHAR(255),
  `timezone` VARCHAR(100) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `task_user_id_idx`(`userId`),
  INDEX `task_due_date_idx`(`dueDate`)
);
```

### Reminder Model
```sql
CREATE TABLE `Reminder` (
  `id` VARCHAR(191) NOT NULL,
  `taskId` VARCHAR(191) NOT NULL,
  `notifyType` ENUM('email', 'sms', 'push') NOT NULL,
  `notifyOffsetMinutes` INTEGER NOT NULL,
  `sent` BOOLEAN NOT NULL DEFAULT false,
  `scheduledAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `reminder_task_id_idx`(`taskId`),
  INDEX `reminder_scheduled_at_idx`(`scheduledAt`)
);
```

### CalendarEvent Model
```sql
CREATE TABLE `CalendarEvent` (
  `id` VARCHAR(191) NOT NULL,
  `taskId` VARCHAR(191) NOT NULL,
  `provider` ENUM('google', 'microsoft') NOT NULL,
  `externalEventId` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `calendar_event_provider_external_id_key`(`provider`, `externalEventId`),
  INDEX `calendar_event_task_id_idx`(`taskId`)
);
```

## Foreign Key Relationships
```sql
-- Task to User relationship
ALTER TABLE `Task` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Reminder to Task relationship
ALTER TABLE `Reminder` ADD FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CalendarEvent to Task relationship
ALTER TABLE `CalendarEvent` ADD FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
```

## Important Notes
1. TiDB uses MySQL compatibility mode, so all SQL statements follow MySQL syntax
2. Ensure proper indexing for frequently queried fields
3. Use appropriate field types for optimal performance:
   - VARCHAR(191) for IDs (compatible with utf8mb4)
   - DATETIME(3) for timestamp fields (millisecond precision)
   - JSON type for flexible data storage (tags)

## Maintenance Tasks
1. Regularly monitor index usage
2. Set up periodic table statistics updates
3. Implement proper backup procedures

## Troubleshooting
1. If migration fails, check:
   - TiDB connection string format
   - Database user permissions
   - Existing table conflicts
2. For performance issues:
   - Review index usage
   - Check query patterns
   - Monitor table sizes