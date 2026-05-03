# Staff App Integration Guide

## Overview

The StaffApp is a React Native Expo application built for staff to track their attendance with punch in/out functionality. It integrates with the existing tableQR backend API.

## Quick Start

### Step 1: Install Dependencies

```bash
cd StaffApp
npm install
```

### Step 2: Configure API URL

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and update the API URL to match your backend:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_IP>:5000/api
```

**Finding your IP**:

- **Mac**: Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: Run `ipconfig`
- Use the local network IP (typically 192.168.x.x or 10.x.x.x)

### Step 3: Start the App

```bash
npm start
```

Then:

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for web browser

## Backend Setup Required

The backend must have:

1. ✅ Staff created in AdminPanel with phone number and password
2. ✅ Shift timing configured for each staff
3. ✅ Staff login endpoint: `POST /auth/staff/login`
4. ✅ Punch in endpoint: `POST /staff/:id/punch-in`
5. ✅ Punch out endpoint: `POST /staff/:id/punch-out`
6. ✅ Get staff endpoint: `GET /staff/:id`

## Features

### 1. Staff Login

- Phone number + password authentication
- Secure token storage using Expo SecureStore
- Auto-login on app restart if token exists

**To test login**:

1. Create a staff member in AdminPanel with phone number (e.g., 9876543210) and password
2. Use that phone and password in the app login screen

### 2. Attendance Dashboard

- **Today's Status**: Shows if staff is marked for work
- **Punch Times**: Displays actual punch in/out times
- **Shift Information**: Current shift timing details
- **Punch In Button**: Records arrival time (green, available until punched in)
- **Punch Out Button**: Records departure time (orange, only available after punch in)
- **Pull-to-Refresh**: Updated attendance data

### 3. Staff Profile

- Complete staff information display
- Employment details (salary, designation, leaves)
- Shift timing information
- Monthly attendance statistics
- Logout button

## API Endpoints Required

### Authentication

**Staff Login**:

```
POST /auth/staff/login
Headers: Content-Type: application/json

Request:
{
  "phone": "9876543210",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "staff": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "john123",
    "designation": "Waiter",
    "email": "john@example.com",
    "phone": "9876543210",
    "shiftTiming": {
      "name": "Morning",
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "salaryMonthly": 25000,
    "attendanceRecords": [...]
  }
}
```

### Attendance

**Punch In**:

```
POST /staff/:id/punch-in
Headers: Authorization: Bearer <token>

Response:
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "attendanceRecords": [
    {
      "date": "2026-05-03T00:00:00Z",
      "status": "work",
      "punchIn": "2026-05-03T09:15:00Z",
      "punchOut": null
    }
  ]
}
```

**Punch Out**:

```
POST /staff/:id/punch-out
Headers: Authorization: Bearer <token>

Response:
{
  "id": "507f1f77bcf86cd799439011",
  "attendanceRecords": [
    {
      "date": "2026-05-03T00:00:00Z",
      "status": "work",
      "punchIn": "2026-05-03T09:15:00Z",
      "punchOut": "2026-05-03T17:45:00Z"
    }
  ]
}
```

**Get Staff**:

```
GET /staff/:id
Headers: Authorization: Bearer <token>

Response: Staff object with all details
```

## Testing

### Create Test Staff

1. Go to AdminPanel (Staff page)
2. Click "Add Staff Member"
3. Fill in details:
   - Name: Test Staff
   - Username: teststаff
   - Password: password123
   - Phone: 9876543210
   - Designation: Waiter
   - Shift: Morning (09:00 - 17:00)
4. Save

### Test Login

1. Open StaffApp
2. Enter phone: 9876543210
3. Enter password: password123
4. Click Login

### Test Punch In/Out

1. After login, go to Dashboard
2. Click "Punch In" button (should turn green and show checkmark)
3. Click "Punch Out" button (should turn orange and show checkmark)
4. Refresh to see updated times

### Verify in AdminPanel

1. Go to Staff page
2. Click Eye icon on the test staff member
3. View attendance calendar to see punch times recorded

## Troubleshooting

### Cannot Connect to Backend

**Problem**: "Network Error" or "Connection refused"

**Solution**:

1. Verify backend is running: `npm run dev` in Backend folder
2. Check IP address matches: `EXPO_PUBLIC_API_URL`
3. On mobile device/emulator, ensure it can reach the IP
4. Check firewall isn't blocking port 5000

### Login Fails

**Problem**: "Invalid phone or password"

**Solution**:

1. Verify staff exists in AdminPanel
2. Check phone number matches exactly
3. Verify password is correct (case-sensitive)
4. Ensure staff member has a valid role (cashier/manager/admin)

### Punch In/Out Not Working

**Problem**: Buttons don't respond or show error

**Solution**:

1. Verify authentication token is valid
2. Check backend logs for errors
3. Ensure staff ID matches
4. Try logout and login again
5. Check internet connectivity

### App Crashes on Login

**Problem**: App crashes after clicking login

**Solution**:

1. Check backend response format matches expected types
2. Verify all required fields in staff object
3. Check console logs in Expo: press `i` and check logs
4. Restart Expo: `npm start`

## Development Notes

### Architecture

```
Login → Dashboard (Punch In/Out) → Profile
  ↓
  └─ Zustand Store (Auth state)
       ↓
       └─ Axios API client
            ↓
            └─ Backend API
```

### Key Files

- `App.tsx`: Main entry point and initialization
- `src/navigation/RootNavigator.tsx`: Navigation between screens based on auth state
- `src/screens/`: UI screens (Login, Dashboard, Profile)
- `src/services/api.ts`: Axios client and API endpoints
- `src/store/authStore.ts`: Zustand auth store

### Add New Features

1. **New API endpoint**: Add to `src/services/api.ts`
2. **New screen**: Create in `src/screens/` and add to navigation
3. **Update state**: Modify `src/store/authStore.ts` if needed

## Environment Variables

| Variable              | Required | Example                         |
| --------------------- | -------- | ------------------------------- |
| `EXPO_PUBLIC_API_URL` | Yes      | `http://192.168.1.100:5000/api` |

## Security

- ✅ Passwords stored securely with bcrypt on backend
- ✅ JWT tokens stored in Expo SecureStore
- ✅ Bearer token authentication for all API calls
- ✅ Auto-logout on 401 Unauthorized
- ✅ Password fields use secureTextEntry

## Performance

- **Zustand**: Lightweight state management
- **Axios**: HTTP client with interceptors
- **Expo SecureStore**: Native secure storage
- **React Navigation**: Native navigation performance

## Future Enhancements

- [ ] Biometric authentication (face/fingerprint)
- [ ] Offline punch recording with sync
- [ ] QR code based punch in
- [ ] Geolocation verification
- [ ] Push notifications for shift reminders
- [ ] Leave request feature
- [ ] Attendance export

## Support

For issues or questions:

1. Check troubleshooting section
2. Review backend logs: `npm run dev` in Backend folder
3. Check app console logs in Expo
4. Verify API URL and network connectivity
