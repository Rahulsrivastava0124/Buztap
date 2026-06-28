# Custom Role-Based Access Control (RBAC) - Implementation Details

Ye document specifically Team Lead ko samjhane ke liye banaya gaya hai ki humne naya "Custom Role" aur "Permissions" system kaise design aur implement kiya hai.

## 🎯 Goal (Objective)
Pehle system me sirf hardcoded roles (Admin, Manager, Waiter, etc.) the, jinki permissions fixed thi. Naye system ka goal tha ki ek **Dynamic Role System** banaya jaye jisme Restaurant owner khud naye roles bana sake (e.g., "Senior Waiter", "Inventory Manager") aur unko specific permissions de sake.

---

## 🛠️ Backend Implementation (Node.js / Express / MongoDB)

1. **New Database Schema (`Role.js`):**
   - Humne ek naya Mongoose model banaya jisme role ka naam, description, uski permissions ka array (jaise `["pos.access", "menu.manage"]`), aur `businessId` store hota hai. 
   - Is se har restaurant (business) apne khud ke isolated roles bana sakta hai.

2. **Role APIs & Controllers (`role.controller.js`):**
   - `/api/roles` ke naye routes banaye gaye.
   - **CRUD Operations**: GET, POST, PUT, DELETE banaya gaya jisse Admin custom roles bana sake, unhe edit ya delete kar sake.

3. **User Model Update (`User.js`):**
   - User schema me ek naya field add kiya: `customRole` (Reference ID to Role schema). Is se ab har staff member ko ek specific custom role assign kiya ja sakta hai.

4. **Middleware & Security (`auth.js` / Permissions Validator):**
   - Security aur middleware me changes kiye gaye. Jab user API call karta hai, toh middleware check karta hai ki user ka `customRole` kya hai aur us role ke andar required permission (e.g., `orders.manage`) hai ya nahi.

5. **Staff Controller Updates (`staff.controller.js`):**
   - `create` aur `update` methods ko modify kiya taki wo `customRole` ObjectId ko accept kare.
   - `fetchStaff` me `populate("customRole", "name permissions")` lagaya taaki frontend ko user ke sath uski saari andar ki permissions bhi directly mil jaye.

---

## 💻 Frontend Implementation (React / Vite)

1. **New Role Management UI (`SettingsRolesPage.jsx`):**
   - Settings ke andar ek naya "Access & Security" page banaya.
   - Yahan ek interactive form banaya gaya hai jahan checkboxes ke through admin specific permissions select karke naya role save kar sakta hai.

2. **Staff Registration Flow Updated (`StaffPage.jsx`):**
   - Staff add ya edit karne wale form me pehle sirf default Designation aati thi. Humne backend se custom roles ko fetch kiya.
   - **Smart Dropdown:** "Designation / Role" ke ek single dropdown me humne Default Roles aur Custom Roles ko merge kar diya. Jab admin koi Custom Role select karta hai, toh backend me directly uski `customRole` ID bheji jati hai.

3. **Data Mapping Fixes (`api.ts`):**
   - Frontend ke API interface me ek critical issue tha jahan API custom role ka data strip (ignore) kar rahi thi. Us error ko identify karke `StaffRecord` interface aur `mapStaff` me fix kiya gaya taaki UI ko permissions dikhne me problem na ho.

4. **Dynamic Table UI:**
   - Staff list table ke UI ko enhance kiya gaya. Ab agar kisi staff ka custom role hai, toh Designation ke column me uska naya role dikhta hai, aur **Permissions** ke column me us role ke andar ki saari dynamic permissions (Tags/Badges) dikhayi deti hain.

---

## 💡 Summary to say to the Team Lead (Initial RBAC Setup):
"Humne system ko scalable banane ke liye ABAC (Attribute-Based Access Control) approach use ki hai. Ek naya Role collection banaya gaya hai. User aur Role ke beech me relational mapping banayi hai. Frontend me Settings ke andar naya UI add kiya hai role create karne ke liye, aur Add Staff form me ek single unified dropdown banaya hai jo default designations aur custom roles dono ko smartly handle karta hai. Sath hi, table view me individual permissions ko dynamic rendering ke through display karvaya gaya hai, aur API/Interface types me data-loss wale issue ko fix kar diya gaya hai."

---

## 🚀 Phase 2: Granular Dashboard Permissions & Security Hardening

1. **Dashboard ki Granular Permissions:**
   - Pehle Dashboard ka ek single "reports.view" tag tha. Isko split karke `dashboard.overview`, `dashboard.finance`, `dashboard.operations`, aur `dashboard.visitors` banaya gaya taaki admin strictly control kar sake ki staff kya dekh sakta hai.

2. **React Router & Security Fixes (`App.jsx` & `ProtectedRoute.jsx`):**
   - **Infinite Loop Fix:** Purane role fallbacks ki wajah se hone wale login loops ko fix kiya. Ab custom role ke paas jo valid permission hai, wo directly wahin redirect hota hai.
   - **Route Security:** `App.jsx` me pehle sabhi routes (Menu, Staff, Orders) ek basic "manager" wrapper ke andar the. Ise hata kar har ek individual page (jaise `/pos`, `/menu`) pe strictly `requiredPermission={PERMISSIONS.XXX}` lagaya gaya. Ab koi unauthorized user URL bypass nahi kar sakta.
   - **Outlet vs Children Bug:** React Router me `<ProtectedRoute>` ka bug tha jo children ko neglect kar raha tha jis wajah se dashboard blank ho raha tha. Ise fix kiya gaya.

3. **Admin Absolute Override (`access.js`):**
   - Ek critical edge case resolve kiya: Agar business owner (`admin`) galti se apne aapko custom role de de, toh wo dashboard se block ho jata tha. `access.js` me `role === "admin"` ka **Absolute Override** add kiya, jisse Admin hamesha 100% access retain karega.

4. **Legacy Compatibility & UI Enhancements:**
   - Database me purane existing roles (jinke paas purani `reports.view` string thi) ko naye system ke sath bina tode gracefully merge karne ke liye Backwards Compatibility layer banayi.
   - Staff list UI ko revamp karke raw strings (jaise `pos.access`) ko hata kar premium human-readable badges aur counts me convert kiya, aur vahin par naya "Manage Roles" shortcut button add kiya.

## 💡 Summary to say to the Team Lead (Phase 2):
"Humne RBAC ko aur advance level par le jaate hue Dashboard ki granular permissions introduce ki hain (jaise Finance alag, Operations alag). Frontend ke `App.jsx` me router level ki har ek route ko strict permission tag se secure kar diya gaya hai, taaki URL hijacking completely ruk jaye. Sath hi `ProtectedRoute` me hone wale ek major empty outlet/children rendering bug ko resolve kiya hai, aur Admin accounts ko hamesha system ke bahar block hone se bachane ke liye ek absolute override layer daal di hai. Purane database records naye structure se conflicts na karein, uske liye ek legacy-support logic implement kiya gaya hai."
