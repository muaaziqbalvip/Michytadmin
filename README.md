# 🔴 MICH YT PROJECT
### Your Vision, Your Channel, Your Control

A premium private creator dashboard built with Firebase, vanilla JS ES6+, and full PWA support.

---

## 🚀 FEATURES

| Module | Description |
|--------|-------------|
| 🏠 Home Dashboard | Stats, quick actions, daily checklist, activity feed |
| 📧 Gmail Center | Email UI, compose drafts, account management |
| ▶️ YouTube Center | Studio shortcuts, monetization tracker, analytics links |
| 🚀 Channel Creator | 8-step wizard to set up a new YouTube channel |
| 🎨 Branding Studio | Upload logos/banners, color palette, font picker |
| 🔍 SEO Tools | Keyword, title, description, hashtag generators |
| 👤 Accounts Manager | Save Gmail profiles, YouTube channels, login history |
| 📝 Notes & Tasks | Todo list, ideas vault, content planner |
| ⚙️ Settings | Profile, preferences, data export/import |
| 📱 PWA | Installable on Android & Desktop, offline-ready |

---

## ⚡ QUICK START

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open http://localhost:3000

### 3. Build for Production
```bash
npm run build
```

---

## 🔥 FIREBASE SETUP

Firebase is already configured. Your project:
- **Project ID:** `ramadan-2385b`
- **Auth Domain:** `ramadan-2385b.firebaseapp.com`

### Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/project/ramadan-2385b)
2. Authentication → Sign-in method
3. Enable: **Google** and **Email/Password**

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

---

## 🚀 DEPLOY

### Deploy to Firebase Hosting
```bash
npm run deploy
```
Or step by step:
```bash
npm run build
firebase deploy
```

Your app will be live at: `https://ramadan-2385b.web.app`

---

## 📧 GMAIL API SETUP (Optional)

To show real emails inside the app:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
2. Enable the **Gmail API**
3. Create OAuth 2.0 credentials
4. Add your domain to authorized origins
5. In `src/firebase/config.js`, the `googleProvider` already requests Gmail scopes
6. After user signs in with Google, use `auth.currentUser.getIdToken()` to get the token
7. Call Gmail API: `https://gmail.googleapis.com/gmail/v1/users/me/messages`

---

## 📱 PWA ICONS SETUP

Generate icons from your logo:
1. Go to: https://realfavicongenerator.net
2. Upload your logo
3. Download → Extract to `/assets/icons/`

Required sizes: 72, 96, 128, 144, 152, 192, 384, 512 (px)

---

## 🎨 CUSTOMIZATION

### Change Brand Colors
Edit `src/styles/global.css`:
```css
:root {
  --red-primary: #e50914;  /* Main accent color */
  --bg-primary: #060608;   /* Background */
}
```

### Change Logo
Replace `https://i.ibb.co/d0xwVb2b/...` with your image URL in:
- `index.html`
- `src/pages/Login.js`
- `src/pages/Dashboard.js`

### Add New Pages
1. Create `src/pages/MyPage.js` with `export function renderMyPage(container, state) {...}`
2. Add to `NAV_ITEMS` in `src/pages/Dashboard.js`
3. Add to the `pages` object in `navigateTo()`

---

## 📁 PROJECT STRUCTURE

```
mich-yt-project/
├── index.html              # App entry point
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── firebase.json           # Firebase hosting config
├── .firebaserc             # Firebase project link
├── generate-icons.js       # Icon generator helper
│
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
│
├── assets/
│   └── icons/              # PWA icons (add manually)
│
├── firebase/
│   ├── firestore.rules     # Firestore security rules
│   ├── storage.rules       # Storage security rules
│   └── firestore.indexes.json
│
└── src/
    ├── main.js             # App bootstrap
    ├── firebase/
    │   └── config.js       # Firebase init
    ├── pages/
    │   ├── Login.js        # Login screen
    │   ├── Dashboard.js    # Main shell + routing
    │   ├── Home.js         # Home page
    │   ├── GmailCenter.js  # Gmail management
    │   ├── YouTubeCenter.js# YouTube tools
    │   ├── ChannelCreator.js # Setup wizard
    │   ├── BrandingStudio.js # Brand assets
    │   ├── SEOTools.js     # SEO generators
    │   ├── AccountsManager.js # Account profiles
    │   ├── Notes.js        # Notes & tasks
    │   └── Settings.js     # App settings
    ├── styles/
    │   └── global.css      # All styles
    └── utils/
        ├── toast.js        # Toast notifications
        ├── helpers.js      # Utility functions
        ├── pwa.js          # PWA install handler
        └── activity.js     # Activity logger
```

---

## 🔒 SECURITY

- Firebase Auth required for all data access
- Firestore rules enforce owner-only access
- Storage rules enforce user-scoped uploads
- No secrets exposed beyond client Firebase config (standard for web apps)
- Input sanitization on all user inputs
- Session-based auth with persistent login option

---

## 🔧 TECH STACK

- **Frontend:** Vanilla JS ES6+ (no framework needed)
- **Backend:** Firebase (Auth, Firestore, Storage, Realtime DB)
- **Build:** Vite 5
- **PWA:** Service Worker + Web App Manifest
- **Fonts:** Exo 2, Rajdhani, Share Tech Mono (Google Fonts)
- **Hosting:** Firebase Hosting

---

## 📞 SUPPORT

This is a private personal app.
- Firebase docs: https://firebase.google.com/docs
- YouTube API: https://developers.google.com/youtube/v3
- Gmail API: https://developers.google.com/gmail/api

---

*MICH YT PROJECT — Built for one powerful creator* ⚡
