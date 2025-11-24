# 🔗 TinyLink — URL Shortener (bit.ly Clone)

A clean and testable URL shortener built with **Next.js**, **Prisma**, and **SQLite**, 
following the TinyLink assignment requirements.  
Supports creating short links, redirecting visitors, tracking click statistics, and managing links
through a simple dashboard.

---

# 🌟 Features

### 🔗 Short Link Creation
- Create short links with custom or auto-generated codes  
- Validates URL format  
- Rejects duplicate codes (`409 Conflict`)  
- Enforces required code pattern: `[A-Za-z0-9]{6,8}`

### ↪️ Redirect Logic
- Visiting `/:code` performs a **302 redirect**  
- Increments `hitCount`  
- Updates `lastClicked` timestamp  
- Deleted links correctly return 404

### 🗑️ Link Management
- Table listing all links  
- Delete links  
- View full details at `/code/:code`:
  - Original URL  
  - Short code  
  - Click count  
  - Created time  
  - Last clicked time  

### 📊 UI / UX
- Clean, responsive layout  
- Tailwind CSS styling  
- Form validation  
- Error & loading states  

### 🩺 Health Check
- `/healthz` returns:
```json
{ "ok": true, "version": "1.0" }
