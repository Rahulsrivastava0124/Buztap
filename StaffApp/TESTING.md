# StaffApp Testing Guide

## Pre-Testing Checklist

- [ ] Backend running: `cd Backend && npm run dev`
- [ ] AdminPanel running: `cd AdminPanel && npm run dev`
- [ ] StaffApp dependencies installed: `cd StaffApp && npm install`
- [ ] `.env` file created with correct API URL
- [ ] Test staff created in AdminPanel with phone number
- [ ] Staff has shift timing configured

## Test Scenarios

### Scenario 1: Staff Login

**Goal**: Verify staff can log in with phone and password

**Steps**:

1. Open StaffApp: `cd StaffApp && npm start`
2. Press `i` for iOS or `a` for Android
3. On login screen, enter:
   - Phone: (same as created in AdminPanel)
   - Password: (same as created in AdminPanel)
4. Click Login button

**Expected Results**:

- ✅ Loading indicator appears during request
- ✅ No error message shown
- ✅ Dashboard screen appears after 2-3 seconds
- ✅ Staff name displayed in welcome message
- ✅ Shift timing displayed correctly

**If fails**:

1. Check backend logs for errors
2. Verify phone number format matches exactly
3. Test password is correct (case-sensitive)
4. Check API URL in `.env` is accessible
5. Try clearing app cache: `npm start` > clear cache option

---

### Scenario 2: Punch In

**Goal**: Verify staff can punch in and time is recorded

**Prerequisites**: Staff logged in and on Dashboard

**Steps**:

1. On Dashboard, click "Punch In" button (green)
2. Wait for loading indicator to disappear
3. Observe button changes to checkmark style
4. Pull down to refresh
5. Verify punch time displays under "Punch In"

**Expected Results**:

- ✅ Button becomes disabled after punch in
- ✅ Time shows current timestamp (e.g., 09:15 AM)
- ✅ Status shows "Marked for work"
- ✅ Punch Out button becomes enabled

**If fails**:

1. Check backend logs for punch-in endpoint errors
2. Verify staff ID is being sent correctly
3. Check token is valid (should show in API response)
4. Look for MongoDB connection issues in backend logs

---

### Scenario 3: Punch Out

**Goal**: Verify staff can punch out after punching in

**Prerequisites**: Staff logged in and already punched in

**Steps**:

1. On Dashboard, click "Punch Out" button (orange)
2. Wait for loading indicator to disappear
3. Observe button changes to checkmark style
4. Pull down to refresh
5. Verify punch out time displays

**Expected Results**:

- ✅ Button becomes disabled after punch out
- ✅ Both punch in and punch out times visible
- ✅ Punch Out button remains disabled
- ✅ Punch In button becomes disabled for the day

**If fails**:

1. Verify punch in was recorded (dashboard shows time)
2. Check backend logs for punch-out endpoint errors
3. Try logging out and logging back in to refresh state

---

### Scenario 4: Dashboard Refresh

**Goal**: Verify attendance data refreshes correctly

**Prerequisites**: Staff punched in

**Steps**:

1. On Dashboard, pull down with finger to refresh
2. Wait for loading indicator at top
3. Release to update

**Expected Results**:

- ✅ Loading indicator appears briefly
- ✅ Attendance data updates with latest times
- ✅ No errors shown
- ✅ Smooth animation during refresh

**If fails**:

1. Check network connectivity
2. Verify token hasn't expired
3. Check backend API endpoint is working

---

### Scenario 5: Profile View

**Goal**: Verify staff profile displays all information

**Prerequisites**: Staff logged in

**Steps**:

1. On Dashboard, click bottom tab "Person" icon
2. View profile screen
3. Scroll down to see all sections

**Expected Results**:

- ✅ Staff name displayed with avatar
- ✅ Personal info shows: phone, email, username
- ✅ Employment details show: designation, salary, leaves
- ✅ Shift timing displays correctly
- ✅ Attendance statistics show month summary
- ✅ Color coding: green (present), red (absent), orange (half-day)

**If fails**:

1. Verify all staff fields populated in AdminPanel
2. Check shift timing configuration
3. Verify attendance records exist in database

---

### Scenario 6: Logout

**Goal**: Verify staff can log out and return to login screen

**Prerequisites**: Staff logged in on Profile screen

**Steps**:

1. On Profile screen, scroll to bottom
2. Click "Logout" button (red)
3. Tap "Yes" on confirmation alert

**Expected Results**:

- ✅ Confirmation alert appears
- ✅ After confirming, returns to Login screen
- ✅ Token cleared from storage
- ✅ All form fields empty on login screen
- ✅ Pressing back button doesn't return to previous screen

**If fails**:

1. Check localStorage/SecureStore is being cleared
2. Verify navigation state is reset
3. Check token removal from Expo SecureStore

---

### Scenario 7: Session Persistence

**Goal**: Verify token persists across app restart

**Prerequisites**: Staff logged in

**Steps**:

1. Staff logged in on Dashboard
2. Close app completely
3. Reopen app
4. Wait 2-3 seconds

**Expected Results**:

- ✅ Dashboard appears immediately (no login screen)
- ✅ Staff info still displayed
- ✅ Previous punch times still visible

**If fails**:

1. Check Expo SecureStore implementation
2. Verify token is being saved correctly on login
3. Verify token restoration in authStore
4. Check app.tsx initialization code

---

### Scenario 8: Invalid Credentials

**Goal**: Verify error handling for wrong credentials

**Prerequisites**: Login screen

**Steps**:

1. Enter wrong phone number or password
2. Click Login

**Expected Results**:

- ✅ Loading indicator appears
- ✅ Alert shows "Invalid phone or password"
- ✅ Stays on login screen
- ✅ Fields remain populated

**If fails**:

1. Check error message format from backend
2. Verify error handling in API interceptor
3. Check alert display logic

---

### Scenario 9: Network Disconnection

**Goal**: Verify graceful handling of network errors

**Prerequisites**: App running

**Steps**:

1. Disconnect WiFi or turn on airplane mode
2. Try to punch in
3. Observe error handling

**Expected Results**:

- ✅ Network error alert appears
- ✅ App doesn't crash
- ✅ Can retry operation after reconnecting

**If fails**:

1. Add timeout handling in API interceptor
2. Add error message for network issues
3. Verify error state is cleared after reconnect

---

### Scenario 10: Verify in AdminPanel

**Goal**: Cross-verify attendance data is saved correctly

**Prerequisites**: Staff has punched in/out

**Steps**:

1. Open AdminPanel (http://localhost:5173)
2. Go to Staff page
3. Find test staff member
4. Click eye icon to view details
5. Check attendance calendar

**Expected Results**:

- ✅ Calendar shows date marked (green/colored)
- ✅ Punch times match what was shown in app
- ✅ Status is "work" for marked days
- ✅ No duplicate records for the date

**If fails**:

1. Check database directly for duplicate entries
2. Verify timestamp is being recorded correctly
3. Check deduplication logic in backend

---

## Automated Test Data

Use this to quickly set up test data:

### Backend: Create Test Staff

Run in MongoDB:

```javascript
db.users.insertOne({
  name: "Test Staff",
  username: "teststaff",
  phone: "9876543210",
  email: "test@example.com",
  passwordHash: "$2b$10$...", // bcrypt hash of "password123"
  role: "cashier",
  designation: "Waiter",
  salaryMonthly: 25000,
  leaveAllowance: 12,
  shiftTiming: {
    name: "Morning",
    startTime: "09:00",
    endTime: "17:00",
  },
  isActive: true,
  attendanceRecords: [],
});
```

Or use AdminPanel to create staff.

### App: Test Credentials

- Phone: 9876543210
- Password: password123

---

## Performance Metrics to Check

| Metric            | Target | How to Measure                            |
| ----------------- | ------ | ----------------------------------------- |
| Login Time        | < 3s   | Time from button click to dashboard       |
| Punch In          | < 2s   | Time from button click to response        |
| Punch Out         | < 2s   | Time from button click to response        |
| Dashboard Refresh | < 1s   | Time from pull-refresh to updated display |
| App Startup       | < 2s   | Time from cold start to login screen      |

---

## Common Issues & Solutions

### Issue: Login keeps failing

**Possible causes**:

1. Backend not running
2. API URL incorrect
3. Staff doesn't exist in DB
4. Password hash mismatch

**Solution**:

```bash
# Check backend
cd Backend && npm run dev

# Check API URL in .env
cat .env

# Verify staff exists
# Open AdminPanel, go to Staff page
```

### Issue: Punch buttons don't work

**Possible causes**:

1. Token expired
2. Staff ID not sent correctly
3. Backend endpoint not implemented

**Solution**:

```bash
# Check backend logs for errors
# Check if endpoints exist
grep -r "punch-in\|punch-out" Backend/src/routes/

# Try logging out and back in
```

### Issue: App crashes on startup

**Possible causes**:

1. Missing dependencies
2. Babel config issue
3. React Navigation version mismatch

**Solution**:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
npm start  # Then select "Clear cache" option
```

---

## Test Report Template

```
Test Date: ___________
Tester: ___________
Environment: iOS / Android / Web

✅ = Pass
❌ = Fail
⚠️ = Issue (describe below)

FUNCTIONAL TESTS
[ ] Login with valid credentials: ___
[ ] Login with invalid credentials: ___
[ ] Punch In: ___
[ ] Punch Out: ___
[ ] Dashboard Refresh: ___
[ ] Profile View: ___
[ ] Logout: ___
[ ] Session Persistence: ___

INTEGRATION TESTS
[ ] Data visible in AdminPanel: ___
[ ] No duplicate records: ___
[ ] Correct timestamps: ___

PERFORMANCE TESTS
[ ] Login < 3s: ___
[ ] Punch < 2s: ___
[ ] App startup < 2s: ___

ISSUES FOUND:
1. ___________
2. ___________
3. ___________

NOTES:
___________
```

---

## Next Steps

After all tests pass:

1. Deploy backend to production
2. Update API URL in production .env
3. Build production APK/IPA
4. Submit to app stores
5. Monitor error logs for 2 weeks
