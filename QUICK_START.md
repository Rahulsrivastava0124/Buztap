# Quick Start Guide - tableQR Staff Attendance App

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Backend running locally or on network
- Expo Go app installed on phone (for testing on device)

---

## Step 1: Setup Backend

```bash
cd Backend
npm install

# Create .env file with database and auth config
# Then run:
npm run dev
```

✅ Backend should be running on `http://localhost:5000`

---

## Step 2: Create Test Staff in AdminPanel

```bash
cd AdminPanel
npm install
npm run dev
```

1. Open http://localhost:5173
2. Login with credentials from your AdminPanel
3. Go to **Staff** page
4. Click **+ Add Staff Member**
5. Fill in:
   - Name: `John Doe`
   - Username: `john123`
   - Phone: `9876543210`
   - Password: `password123`
   - Designation: `Waiter`
   - Shift: `Morning (09:00 - 17:00)`
6. Click Save

✅ Test staff created

---

## Step 3: Setup & Run StaffApp

```bash
cd StaffApp
npm install
```

### Configure API URL

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
```

**Find your IP**:

- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`
- Use the local IP (192.168.x.x or 10.x.x.x)

### Start App

```bash
npm start
```

Press `i` for iOS Simulator or `a` for Android Emulator

✅ App ready for testing

---

## Step 4: Test Login

1. On login screen, enter:
   - Phone: `9876543210`
   - Password: `password123`
2. Click **Login**
3. You should see Dashboard with today's punch status

✅ Login successful

---

## Step 5: Test Punch In/Out

**Punch In**:

1. Click green **Punch In** button
2. Wait for confirmation
3. Time should update

**Punch Out**:

1. Click orange **Punch Out** button
2. Wait for confirmation
3. Both times should display

✅ Punch functionality working

---

## Step 6: Verify in AdminPanel

1. Go back to AdminPanel Staff page
2. Click eye icon on John Doe
3. Check attendance calendar
4. Should see marked day with punch times

✅ Full integration working!

---

## 📱 Testing on Real Device

### iOS

```bash
npm run ios
# Or
npm start
# Press 'i'
```

### Android

```bash
npm run android
# Or
npm start
# Press 'a'
```

### Using Expo Go App

1. Run `npm start` in StaffApp
2. Scan QR code with Expo Go app
3. App loads on your phone
4. Test login and punch operations

---

## 🔧 Troubleshooting

### Cannot connect to backend

**Solution**:

1. Check Backend is running: `npm run dev` in Backend folder
2. Verify IP address in `.env` matches your local network
3. On same WiFi network as backend
4. Check firewall isn't blocking port 5000

```bash
# Test connectivity
curl http://YOUR_IP:5000/api/staff
```

### Login fails

**Solution**:

1. Verify phone and password in AdminPanel
2. Check staff exists in database
3. Try with credentials: phone `9876543210`, password `password123`

### Punch buttons don't work

**Solution**:

1. Verify staff logged in successfully
2. Check backend logs for errors
3. Try logging out and back in

### App crashes

**Solution**:

```bash
# Clear cache
npm start
# Select "Clear cache" option

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Project Structure

```
tableQR/
├── Backend/              # Express API
│   └── src/
│       ├── controllers/  # auth, staff, orders, etc.
│       ├── models/       # User, Order, Table, etc.
│       ├── routes/       # API endpoints
│       └── middleware/   # Auth, error handling
├── AdminPanel/           # Staff management dashboard
│   └── src/
│       ├── pages/        # StaffPage, DashboardPage, etc.
│       ├── services/     # API client (api.ts)
│       └── context/      # Auth context
└── StaffApp/            # Mobile attendance app (NEW)
    └── src/
        ├── screens/      # Login, Dashboard, Profile
        ├── navigation/   # Tab and stack navigation
        ├── services/     # API client
        ├── store/        # Zustand auth store
        └── components/   # Reusable components
```

---

## 🔑 Key Endpoints

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/auth/staff/login`     | Staff login            |
| POST   | `/staff/:id/punch-in`   | Record punch in        |
| POST   | `/staff/:id/punch-out`  | Record punch out       |
| GET    | `/staff/:id`            | Get staff details      |
| GET    | `/staff/:id/attendance` | Get attendance history |

---

## 📝 Important Notes

✅ **All systems created**: Backend API, AdminPanel UI, StaffApp mobile app
✅ **Secure authentication**: JWT tokens, bcrypt passwords
✅ **Persistent sessions**: Tokens stored securely on device
✅ **Real-time sync**: Punch times saved to database immediately
✅ **Cross-platform**: Works on iOS, Android, and web

⚠️ **Next Steps**:

1. Test thoroughly on devices
2. Configure production API URL when deploying
3. Create asset files (icons, splash screen)
4. Set up CI/CD for automated builds

---

## 🆘 Need Help?

1. **Backend errors**: Check `Backend/logs/` or terminal output
2. **AdminPanel issues**: Check browser console (F12)
3. **StaffApp crashes**: Check Expo terminal or `npm start` output

Check documentation:

- [Backend README](Backend/README.md)
- [AdminPanel README](AdminPanel/README.md)
- [StaffApp README](StaffApp/README.md)
- [StaffApp Integration Guide](StaffApp/INTEGRATION.md)
- [StaffApp Testing Guide](StaffApp/TESTING.md)

---

## 🎉 Success Indicators

When everything is working:

- ✅ Login with staff credentials on mobile app
- ✅ Punch In button records timestamp
- ✅ Punch Out button records departure time
- ✅ Data visible in AdminPanel calendar
- ✅ Can logout and session persists on restart
- ✅ All times show in correct format (HH:MM)

**Congratulations! Your staff attendance system is ready! 🚀**
