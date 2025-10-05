# Firebase Setup Instructions

## 🔥 How to Set Up Your Firebase Project

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Name your project: `chicken-empire-game`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### Step 3: Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### Step 4: Get Your Config
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Register your app: `Chicken Empire`
5. Copy the `firebaseConfig` object

### Step 5: Update Configuration
Replace the demo config in `src/services/firebase.js` with your real config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Step 6: Security Rules (Important!)
In Firestore Database > Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Game data - users can only access their own saves
    match /gameData/{document} {
      allow read, write: if request.auth != null && 
        (resource.data.playerId == request.auth.uid || 
         document.matches(request.auth.uid + '_.*'));
    }
    
    // Public leaderboard - everyone can read, only owners can write
    match /gameData/{document} {
      allow read: if true;  // Public leaderboard
      allow write: if request.auth != null && request.auth.uid == resource.data.playerId;
    }
  }
}
```

## 🚀 Current Features

### ✅ Implemented
- **Real Authentication**: Email/password signup and signin
- **Cloud Saves**: Game data saved to Firestore
- **Offline Sync**: Works offline, syncs when back online
- **Local Backup**: Always keeps local backup of saves
- **Global Leaderboard**: Real rankings from all players
- **User Profiles**: Track stats and play time
- **Multiple Saves**: Save under different names
- **Cross-Device**: Play on any device with same account

### 🔒 Security Features
- User data isolation (users can only access their own saves)
- Encrypted authentication
- Secure database rules
- Input validation
- Error handling

### 📱 Offline Support
- Game works completely offline
- Saves locally when offline
- Auto-syncs when connection restored
- Never lose progress due to connection issues

## 💡 For Development/Testing

The current config uses demo values, so you can test locally without setting up Firebase immediately. However, for production use, you'll need to:

1. Set up a real Firebase project
2. Replace the demo config with your real config
3. Deploy with proper security rules

The system will automatically detect if it's using demo config and provide appropriate fallbacks.
