# Specification: Attendance Tracker (Anti-Cheating)

## 1. Overview
A lightweight web application for tracking attendance during live sessions. It uses a dynamic "Class Code" and various technical checks to ensure only students physically (or virtually) present can successfully register.

## 2. Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **Backend/Database**: Supabase (PostgreSQL).
- **Authentication**: (Optional for students) Admin-only authentication for dashboard access.
- **Deployment**: Vercel.

## 3. Database Schema (Supabase)

### Table: `sessions`
## 3. Database Schema (Supabase)

### Table: `sessions`
Used to manage active attendance windows.
- `id`: uuid (PK)
- `name`: text (e.g., "Math 101 - Week 5")
- `class_code`: text (The secret code students must enter)
- `is_active`: boolean (Default: true)
- `created_at`: timestamptz (Default: now())
- `expires_at`: timestamptz (Optional timeout)
- `user_id`: uuid (FK -> auth.users.id) - To associate sessions with specific instructors.

## 4. Anti-Cheating Logic

### A. Secret Dynamic Code
The admin generates a session and a random or manual "Class Code". This code is shared via the Zoom/Class chat. Submissions without the correct code for the active session are rejected.

### B. IP Uniqueness (Strict Mode)
The system captures the student's public IP address. For each session, only **one** submission is allowed per IP address to prevent a single user from submitting for multiple classmates.

### C. MAC Address / Device Fingerprinting
Since web browsers cannot directly access a hardware MAC address for privacy reasons, we use **Device Fingerprinting**. On the first visit, the app generates a high-entropy unique identifier (Device ID) and stores it in the student's `localStorage`. This ID is used as a proxy for the MAC address to enforce "One Device = One Attendance" per session.

## 5. User Flows

### Admin Flow (Protected)
1. **Login**: Admin must log in via `/login` using Supabase Auth.
2. **Dashboard**: Access only available to authenticated users.
3. **Session Management**: Create, start, and end sessions.
4. **Monitoring**: Real-time attendance list.

### Student Flow (Public)
1. **Scan**: QR code points directly to `/check-in/[session_id]`.
2. **Details**: No login required. Enter Name and the secret "Class Code".
3. **Validation**: IP and Device ID (MAC Proxy) are checked automatically.


## 6. Security (Supabase RLS)
- **Sessions**: Public Read (to check if active), Admin All.
- **Attendance Records**: Public Insert (with validation), Admin Read.
- **Anti-Cheat Validation**: Use a Postgres Function (RPC) to handle the insertion. This function will verify the `class_code`, `is_active`, and uniqueness of IP/Device ID in a single transaction.
