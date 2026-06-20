# BuzTap Roles and Access Levels

This document outlines the various user roles, permissions, and designations across the BuzTap restaurant & hotel management system. The roles dictate what a user can access within the Admin Panel and Staff App.

---

## 1. System Roles (Permission Hierarchy)

The system is built on a ranked permission structure (Highest to Lowest). These roles determine the level of access to different modules in the Admin Panel.

### 👑 Admin (Rank: 3)
**Highest Level of Access.** The Admin has complete control over the business operations, system configurations, and all staff.
- **Access Level:** Can access ALL modules.
- **Key Capabilities:**
  - Modify global Business Settings
  - Manage Inventory (stock levels, reordering)
  - Create and manage Menus, Staff, Reports, and Offers
  - Full access to POS and Checkout systems
- **Default Dashboard Path:** `/dashboard/overview`

### 👔 Manager (Rank: 2)
**Mid-Level Access.** The Manager oversees day-to-day operations and staff but does not have access to core business configurations.
- **Access Level:** Can access most operational and reporting modules, but restricted from system-wide settings.
- **Key Capabilities:**
  - View and manage Menus and Offers
  - Manage lower-level Staff and their attendance/leaves
  - View Business Reports
  - Access POS, Orders, and Checkout systems
- **Restricted From:** Inventory management and core Settings.
- **Default Dashboard Path:** `/dashboard/overview`

### 🧑‍💼 Cashier / Base Staff (Rank: 1)
**Operational Access.** Cashiers and regular staff members focus on processing orders, handling payments, and serving guests.
- **Access Level:** Restricted to essential daily operation modules.
- **Key Capabilities:**
  - Full access to POS System and Checkout
  - View and manage live Orders (Dine-in, Takeaway, QR)
  - Change Table Statuses
- **Restricted From:** Settings, Inventory, Staff Management, Reports, Menus, and Offers.
- **Default Dashboard Path:** `/dashboard/operations`

---

## 2. Customer / Guest Role

### 📱 Guest
**External User.** Guests are the customers who interact with the system without needing an admin or staff account.
- **Access Level:** Interacts exclusively through the `TableFrontend` interface.
- **Key Capabilities:**
  - Scan QR codes to view the digital Menu
  - Place orders directly from their table or room
  - Call the waiter or request the bill
  - View their order history (via phone number login)

---

## 3. Staff Designations (HR & Display)

While the **System Roles** (`admin`, `manager`, `cashier`) dictate software permissions, the system also tracks **Designations**. These are primarily used for organizational purposes, display, HR tracking, and shift management:

- **Admin**
- **Manager**
- **Receptionist**
- **Kitchen** (Chefs, Cooks)
- **Waiter** (Servers)
- **Employee** (General Support Staff)

*Note: A staff member could have the designation of "Waiter" but be assigned the system role of "Cashier" so they can process POS orders.*






Yeh document ka **Hinglish version** hai jo developers aur clients dono ke liye easy to understand hoga.

---

# 🍽️ BuzTap Roles & Access Levels

Is document me BuzTap Restaurant & Hotel Management System ke saare **User Roles**, **Permissions**, aur **Staff Designations** explain kiye gaye hain.

System me har user ka ek **Role** hota hai jo decide karta hai ki usko Admin Panel ya Staff App me kya-kya access milega.

---

# 1️⃣ System Roles (Permission Hierarchy)

System me roles hierarchy ke according kaam karte hain.

**Highest Access → Lowest Access**

---

## 👑 Admin (Rank: 3)

Ye system ka **highest level user** hota hai.

Admin ke paas almost har module ka full access hota hai.

### ✅ Access

* Sare modules access kar sakta hai.
* Kisi bhi setting ko change kar sakta hai.

### 🔹 Admin Kya Kar Sakta Hai?

* Business Settings manage karna
* Inventory manage karna
* Menu create/update/delete karna
* Staff add/edit/remove karna
* Reports dekhna
* Offers banana
* POS System access
* Checkout System access
* Sare Orders dekhna
* Tables manage karna

### 📍 Default Dashboard

```
/dashboard/overview
```

---

## 👔 Manager (Rank: 2)

Manager day-to-day restaurant operations handle karta hai.

Manager ke paas kaafi access hota hai lekin kuch important settings locked rehti hain.

### ✅ Access

* Operational modules
* Reports
* Staff Management
* POS

### 🔹 Manager Kya Kar Sakta Hai?

* Menu manage karna
* Offers manage karna
* Staff attendance dekhna
* Leave approve/reject karna
* Reports dekhna
* POS chalana
* Checkout karna
* Orders manage karna

### ❌ Manager Kya Nahi Kar Sakta?

* Business Settings change nahi kar sakta
* Inventory manage nahi kar sakta

### 📍 Default Dashboard

```
/dashboard/overview
```

---

## 🧑‍💼 Cashier / Base Staff (Rank: 1)

Ye normal staff ya cashier ke liye role hai.

Inka focus sirf daily restaurant operations par hota hai.

### ✅ Access

* POS
* Orders
* Checkout

### 🔹 Cashier Kya Kar Sakta Hai?

* Order lena
* Bill banana
* Payment receive karna
* Live Orders dekhna
* Dine-In Orders
* Takeaway Orders
* QR Orders
* Table Status change karna

### ❌ Cashier Kya Nahi Kar Sakta?

* Settings
* Inventory
* Staff Management
* Reports
* Menu Management
* Offers Management

### 📍 Default Dashboard

```
/dashboard/operations
```

---

# 2️⃣ Customer / Guest Role

## 📱 Guest

Guest restaurant ka customer hota hai.

Guest ko Admin Panel access nahi milta.

Wo sirf **TableFrontend** use karta hai.

### Guest Kya Kar Sakta Hai?

* QR Scan karke Menu dekh sakta hai
* Order place kar sakta hai
* Waiter ko call kar sakta hai
* Bill request kar sakta hai
* Phone Number se login karke apni Order History dekh sakta hai

---

# 3️⃣ Staff Designations (HR & Display)

Ye **Permissions decide nahi karte**.

Ye sirf staff ka designation batate hain.

Inka use HR, attendance, shift management aur display ke liye hota hai.

## Available Designations

* 👑 Admin
* 👔 Manager
* 🛎️ Receptionist
* 👨‍🍳 Kitchen (Chef / Cook)
* 🍽️ Waiter
* 👷 Employee (General Staff)

---

# 💡 Important Note

**Role** aur **Designation** alag cheezein hain.

### Role

Ye decide karta hai ki software me user kya access kar sakta hai.

Example:

* Admin
* Manager
* Cashier

### Designation

Ye sirf batata hai ki staff restaurant me kis position par kaam karta hai.

Example:

* Waiter
* Kitchen
* Receptionist
* Employee

### Example

Ek staff ka **Designation = Waiter** ho sakta hai.

Lekin uska **System Role = Cashier** ho sakta hai, taaki wo POS se order le sake aur billing bhi kar sake.

👉 **Simple words me:**
**Role = Software me kya access milega.**
**Designation = Restaurant me uski job/profile kya hai.**
