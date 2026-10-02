-- ========================================================
-- BRAIN DUMP - AI PLANNER DATABASE SCHEMA (POSTGRESQL)
-- File: schema.sql (Direct SQL for PostgreSQL / Supabase / Neon)
-- ========================================================

-- 1. Bảng Người dùng & Tài khoản đăng nhập
CREATE TABLE IF NOT EXISTS "User" (
    "id" VARCHAR(36) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(50) DEFAULT '🧑‍💻',
    "streakDays" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng lịch cố định (Thời khóa biểu, sinh hoạt cá nhân)
CREATE TABLE IF NOT EXISTS "FixedSchedule" (
    "id" VARCHAR(36) PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL, -- 1: Thứ Hai -> 7: Chủ Nhật
    "startTime" VARCHAR(10) NOT NULL, -- '08:00'
    "endTime" VARCHAR(10) NOT NULL,   -- '11:30'
    "color" VARCHAR(20) DEFAULT '#3b82f6',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Task lớn (Deadline cần hoàn thành)
CREATE TABLE IF NOT EXISTS "Task" (
    "id" VARCHAR(36) PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(100),
    "deadline" TIMESTAMP NOT NULL,
    "priority" VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    "status" VARCHAR(20) DEFAULT 'TODO',     -- TODO, IN_PROGRESS, DONE
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Khối công việc chi tiết do AI chia nhỏ & xếp lịch
CREATE TABLE IF NOT EXISTS "Subtask" (
    "id" VARCHAR(36) PRIMARY KEY,
    "taskId" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "stepOrder" INTEGER DEFAULT 1,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    "durationMin" INTEGER DEFAULT 45,
    "actualMin" INTEGER DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'TODO', -- TODO, DONE, MISSED
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_task" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE
);

-- 5. Bảng Lịch sử hội thoại với Trợ lý AI
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" VARCHAR(36) PRIMARY KEY,
    "role" VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
    "content" TEXT NOT NULL,
    "metadata" TEXT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
