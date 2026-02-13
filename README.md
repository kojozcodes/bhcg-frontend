# 🔋 Battery Health Certificate - Frontend

React PWA for generating battery health certificates on mobile devices.

---

## 📋 SETUP

### Local Development:
```bash
# Install dependencies
npm install

# Copy assets to public folder (IMPORTANT!)
# Copy these files to public/:
# - BHG_logo.png
# - BHG.ico

# Configure backend URL
# Edit .env file:
REACT_APP_API_URL=http://localhost:5000

# Run
npm start
# Opens on http://localhost:3000
```

---

## 🚀 DEPLOYMENT (Vercel)

### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
```

### Method 2: GitHub Integration
```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Battery Health Mobile App"
git remote add origin https://github.com/YOUR_USERNAME/battery-health-mobile
git push -u origin main

# 2. Go to vercel.com
# 3. Import your GitHub repo
# 4. Set environment variable:
#    REACT_APP_API_URL = https://your-backend.up.railway.app

# 5. Deploy!
```

---

## ⚙️ CONFIGURATION

### Environment Variables:
```
REACT_APP_API_URL=https://your-backend.up.railway.app
```

**How to set in Vercel:**
1. Go to Project Settings
2. Click "Environment Variables"
3. Add: `REACT_APP_API_URL` with your backend URL
4. Redeploy

---

## 📁 REQUIRED FILES

### Must be in public/ directory:
1. ✅ **BHG_logo.png** - App logo
2. ✅ **BHG.ico** - Favicon

### Without these files:
- Logo won't display (but app works)
- Fallback: No logo shown

---

## 🎨 FEATURES

### ✅ Included:
- Password login (JWT authentication)
- Certificate form with all fields
- Make/Model cascading dropdowns
- Battery health slider (0-100%)
- Certificate list manager
- Batch processing (add multiple)
- Duplicate certificates
- Delete certificates
- Real-time validation
- Generate single or all
- Progress indicators
- Mobile-optimized UI
- Touch-friendly controls
- PWA support

### 📱 UI Components:
1. **Login Page** - Password authentication
2. **Form Tab** - Add/edit certificate
3. **List Tab** - View all certificates
4. **Footer** - Action buttons

### 🎯 User Workflow:
```
1. Login with password
2. Add certificate(s)
3. Fill form fields
4. View validation status
5. Generate PDF(s)
6. Download certificates
7. (Optional) Email to recipients
```

---

## 📋 CERTIFICATE FIELDS

### Required Fields:
- ✅ Tested By
- ✅ Make (dropdown)
- ✅ Model (dropdown - filtered by make)
- ✅ Registration
- ✅ Battery Capacity (kWh)

### Optional Fields:
- Test Date
- First Registered
- VIN
- Mileage
- State of Health (slider, default 90%)
- Recipient Email

---

## 🔧 CAR DATABASE

### Included Makes (10):
- BYD (1 model)
- Hyundai (2 models)
- KIA (5 models)
- MG (2 models)
- Nissan (2 models)
- Polestar (1 model)
- Skoda (2 models)
- Tesla (2 models)
- Toyota (3 models)
- Volkswagen (4 models)

**Total: 30+ models**

---

## 🚦 BATCH PROCESSING

### How it works:
```
1. Click "Add Certificate" (creates blank)
2. Fill form fields
3. Click "Add Certificate" again (add more)
4. OR click "Duplicate" on existing certificate
5. View all in "Certificates" tab
6. Edit any certificate by clicking it
7. Click "Generate All (X)" to process valid ones
```

### Features:
- ✅ Add unlimited certificates
- ✅ Duplicate existing (quick batch)
- ✅ Delete individual
- ✅ Clear all
- ✅ Real-time validation (✓ or ✗)
- ✅ Generate current or all
- ✅ Progress tracking (1 of 5, 2 of 5...)
- ✅ Skip invalid certificates

---

## 🎯 VALIDATION

### Real-time Feedback:
- ✓ Green badge = Valid
- ✗ Red badge = Invalid (shows error count)
- Error list shows missing fields
- Can only generate valid certificates

### Visual Indicators:
- Certificate cards show validation status
- Invalid fields highlighted
- Error messages displayed
- Battery status colors:
  - 🟢 Green (85-100%) = Excellent
  - 🟡 Blue (65-84%) = Good
  - 🔴 Red (<65%) = Bad

---

## 📱 PWA FEATURES

### Mobile Optimizations:
- Touch-friendly buttons
- No keyboard dismissal
- Swipe-friendly lists
- Responsive design
- Offline-ready (PWA)
- Add to home screen
- Full-screen mode

### Performance:
- Lazy loading
- Optimized images
- Minimal dependencies
- Fast load times

---

## 🔐 AUTHENTICATION

### Login System:
- Password-only login
- JWT token authentication
- Session expires after 8 hours
- No persistent sessions
- Login required every app open

### Default Password:
```
BatteryHealth2024
```

**Change in backend .env:**
```bash
# Generate new hash:
python3 -c "import hashlib; print(hashlib.sha256('YOUR_PASSWORD'.encode()).hexdigest())"

# Set in backend:
ADMIN_PASSWORD_HASH=your_hash_here
```

---

## 🎨 UI/UX

### Layout:
```
┌─────────────────────────────┐
│  🔋 Battery Health [Logout] │  Header
├─────────────────────────────┤
│  [Form (1/3)] [Certs (3)]  │  Tabs
├─────────────────────────────┤
│                             │
│  Content Area               │  Scrollable
│  (Form or List)             │
│                             │
├─────────────────────────────┤
│  [Add] [Clear] [Gen] [All] │  Footer
└─────────────────────────────┘
```

### Color Scheme:
- Primary: #52C41A (Green)
- Success: #1890FF (Blue)
- Danger: #ff4d4f (Red)
- Background: #f0f2f5
- Cards: #ffffff

---

## 🐛 TROUBLESHOOTING

### "API connection failed":
```bash
# Check backend is running
curl https://your-backend.up.railway.app/health

# Check .env file
cat .env
# Verify REACT_APP_API_URL is correct
```

### "Logo not showing":
```bash
# Make sure these files exist:
ls -la public/BHG_logo.png
ls -la public/BHG.ico

# Restart dev server after adding files
```

### "Login not working":
```bash
# Check backend password hash is set
# Check network tab in browser DevTools
# Verify API URL is correct
```

### "Certificates not generating":
```bash
# Check validation errors
# Look for red ✗ badge
# Fix missing required fields
# Check browser console for errors
```

---

## 📊 TESTING CHECKLIST

After deployment:
- [ ] Login works
- [ ] Add certificate works
- [ ] Form fields save
- [ ] Make/Model dropdowns work
- [ ] Battery slider works
- [ ] Validation shows errors
- [ ] Duplicate works
- [ ] Delete works
- [ ] Generate current works
- [ ] Generate all works (with 2+ certs)
- [ ] Progress shows during generation
- [ ] PDF downloads
- [ ] Email sends (if configured)
- [ ] Logout works
- [ ] Mobile responsive
- [ ] Touch interactions work

---

## 🎯 PRODUCTION CHECKLIST

- [ ] Backend deployed and running
- [ ] Frontend deployed
- [ ] API_URL environment variable set
- [ ] Logo files in public/
- [ ] Test login
- [ ] Test certificate generation
- [ ] Test batch generation
- [ ] Test on mobile device
- [ ] Verify PDF downloads work
- [ ] Check email delivery (if enabled)

---

Ready to deploy! 🚀