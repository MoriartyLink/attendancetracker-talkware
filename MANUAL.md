# Attendance Tracker - User Manual

## 1. Initial Setup

### Step 1: Supabase Configuration
1. Log in to your [Supabase Dashboard](https://app.supabase.com/).
2. **Database Schema**: Open the **SQL Editor**, paste the content of `supabase.sql`, and click **Run**. This creates the tables and the `submit_attendance` function.
3. **Authentication**: Go to **Authentication** -> **Users** and click **Add User** to create an account for yourself (the Instructor).

### Step 2: Environment Variables
Ensure `.env.local` has your details:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Run the App
```bash
npm install
npm run dev
```

---

## 2. Instructor Workflow (Admin)

### Login
- Navigate to the **Home Page** and click **For Instructors**.
- You will be redirected to the **Login Page** (`/login`).
- Enter your Supabase credentials to access the dashboard.

### Managing Sessions
- **Create**: Enter a name and code to start a session. It will be linked to your account.
- **Real-Time Tracking**: Open a session to see the QR code and a live list of attendees.
- **Security Info**: The dashboard shows each student's **IP Address** and **Device ID (MAC Proxy)**.

---

## 3. Student Workflow (Public)

1. **Scan**: Student scans the QR code (no login required).
2. **Check-in**: Student enters their **Full Name** and the **Secret Class Code** you shared.
3. **Validation**: The system automatically captures their IP and Device ID to prevent cheating.

---

## 4. Anti-Cheating Features

### Dynamic Class Code
Students cannot submit without the specific code you provide during the class session.

### IP Address Locking
Only **one** submission is allowed per IP address. If a student tries to submit for a friend on the same network, it will be blocked.

### MAC Address Proxy (Device Fingerprinting)
Web browsers cannot see hardware MAC addresses. Instead, we use a unique **Device Fingerprint** stored in the browser. 
- Even if a student uses a VPN to change their IP, the system identifies the device.
- If they try to submit a second time using the same phone/laptop, the system rejects it.

### Secure Database Logic
The anti-cheating checks are performed in a **Single Transaction** inside the database (using a PostgreSQL RPC). This ensures that even if two people click "Submit" at the exact same millisecond, only the first one is accepted.
