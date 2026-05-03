# Staff Attendance App

A React Native Expo app for staff attendance tracking with punch in/out functionality, profile management, and attendance dashboard.

## Features

- **Staff Login**: Secure login with phone number and password
- **Punch In/Out**: Record work hours with timestamps
- **Attendance Dashboard**: View today's punch times and shift information
- **Staff Profile**: Complete staff information including salary, designation, and shift details
- **Monthly Attendance**: View attendance statistics for current month
- **Secure Token Storage**: Uses Expo SecureStore for token persistence
- **Real-time Sync**: Integrates with backend API for live attendance updates

## Project Structure

```
StaffApp/
├── App.tsx                          # Main entry point
├── src/
│   ├── screens/                     # Screen components
│   │   ├── LoginScreen.tsx          # Staff login screen
│   │   ├── DashboardScreen.tsx      # Attendance dashboard & punch in/out
│   │   └── ProfileScreen.tsx        # Staff profile & stats
│   ├── services/                    # API services
│   │   └── api.ts                   # Axios API client & endpoints
│   ├── store/                       # Zustand stores
│   │   └── authStore.ts             # Auth state management
│   ├── navigation/                  # Navigation setup
│   │   └── RootNavigator.tsx        # Stack & tab navigation
│   └── components/                  # Reusable components (future)
├── app.json                         # Expo configuration
├── tsconfig.json                    # TypeScript configuration
├── babel.config.js                  # Babel configuration
└── package.json                     # Dependencies

```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator
- Backend API running on local network

### Installation

1. **Clone and navigate to StaffApp**:

   ```bash
   cd StaffApp
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure API URL**:
   - Copy `.env.example` to `.env`
   - Update `EXPO_PUBLIC_API_URL` to your backend API URL

   ```bash
   # Example for local development
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
   ```

4. **Start the app**:

   ```bash
   npm start
   ```

5. **Choose platform**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for web browser

## Login Credentials

Use credentials of staff members created in AdminPanel:

```
Phone: Staff member's phone number
Password: Staff password
```

### Demo Account

If demo account exists in backend:

```
Phone: 9876543210
Password: password123
```

## Key Screens

### Login Screen

- Phone number input
- Password input
- Secure token storage
- Error handling with alerts

### Dashboard Screen

- Welcome message with staff name
- Today's attendance status
  - Current status (marked/unmarked)
  - Punch in time
  - Punch out time
- Shift information display
  - Shift name
  - Shift start time
  - Shift end time
- **Punch In Button** (Green)
  - Records current timestamp
  - Marks attendance as "work"
  - Disables after punch in
- **Punch Out Button** (Orange)
  - Records punch out timestamp
  - Only available after punch in
  - Disables after punch out
- Pull-to-refresh for real-time updates

### Profile Screen

- Staff avatar and name
- Personal information
  - Phone number
  - Email
  - Username
- Employment details
  - Designation
  - Monthly salary
  - Leave allowance
- Shift information
- Current month attendance summary
  - Present days (green)
  - Absent days (red)
  - Holiday days (yellow)
  - Half days (blue)
- Logout button

## API Integration

### Authentication

**Login Endpoint**: `POST /auth/login`

```typescript
Request: {
  phone: string;
  password: string;
}

Response: {
  token: string;
  staff: StaffRecord;
}
```

### Attendance Operations

**Punch In**: `POST /staff/:id/punch-in`

- Records current timestamp as `punchIn`
- Marks status as "work"
- Returns updated staff record

**Punch Out**: `POST /staff/:id/punch-out`

- Records current timestamp as `punchOut`
- Updates attendance record
- Returns updated staff record

**Get Attendance**: `GET /staff/:id`

- Fetches complete staff profile
- Includes all attendance records
- Returns ShiftTiming details

## State Management

Uses **Zustand** for lightweight state management:

```typescript
interface AuthStore {
  token: string | null;
  staff: Staff | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setStaff: (staff: Staff | null) => void;
  logout: () => void;
}
```

Authentication token is persisted in Expo SecureStore for app restart resilience.

## Data Models

### ShiftTiming

```typescript
{
  name: "Morning" | "Evening" | "Night" | "Custom";
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}
```

### Staff

```typescript
{
  id: string;
  name: string;
  username: string;
  designation: string;
  email: string;
  phone: string;
  salaryMonthly: number;
  shiftTiming: ShiftTiming;
  attendanceRecords: Array<{
    date: string;
    status: "work" | "absent" | "holiday" | "halfDay";
    punchIn?: string;
    punchOut?: string;
  }>;
}
```

## Configuration

### Environment Variables

Create `.env` file in project root:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

**Note**: The `EXPO_PUBLIC_` prefix makes this variable accessible in the app. Update IP/port to match your backend API.

## Development

### Run Development Server

```bash
npm start
```

### Build for iOS

```bash
npm run ios
```

### Build for Android

```bash
npm run android
```

### Run on Web

```bash
npm run web
```

## Security Features

- **Secure Token Storage**: JWT tokens stored in Expo SecureStore
- **Automatic Logout**: Logged out on 401 Unauthorized responses
- **Bearer Token Authentication**: All API requests include auth token
- **Password Masking**: Password inputs use `secureTextEntry`

## Error Handling

- Network error alerts
- Invalid credentials feedback
- Punch in/out failure messages
- Retry mechanisms with pull-to-refresh

## Dependencies

| Package             | Purpose                |
| ------------------- | ---------------------- |
| `expo`              | React Native framework |
| `expo-router`       | File-based routing     |
| `react-native`      | Cross-platform UI      |
| `@react-navigation` | Navigation & routing   |
| `zustand`           | State management       |
| `axios`             | HTTP client            |
| `date-fns`          | Date formatting        |
| `expo-secure-store` | Secure token storage   |

## Troubleshooting

### API Connection Issues

- Verify backend is running
- Check IP address in `.env`
- Ensure device can reach backend IP
- Check firewall settings

### Punch In/Out Not Working

- Verify staff member is created in AdminPanel
- Check backend logs for errors
- Ensure valid authentication token
- Verify internet connection

### Login Fails

- Confirm phone number format matches backend
- Verify password is correct
- Check backend authentication endpoints
- Review backend auth.controller logs

## Future Enhancements

- [ ] Biometric authentication (fingerprint/face)
- [ ] Offline punch recording with sync
- [ ] Attendance history view
- [ ] Leave request functionality
- [ ] Push notifications for shift reminders
- [ ] QR code based punch in/out
- [ ] Geolocation verification
- [ ] Document upload for leave approvals

## License

Private - tableQR Staff Management System
