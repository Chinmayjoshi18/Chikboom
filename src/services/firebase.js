// Firebase Configuration and Service
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  deleteDoc 
} from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8Z_6l1q5L3IJIYHrohCxuqRDuNO0ch4M",
  authDomain: "chicken-empire-game.firebaseapp.com",
  projectId: "chicken-empire-game",
  storageBucket: "chicken-empire-game.firebasestorage.app",
  messagingSenderId: "241070355339",
  appId: "1:241070355339:web:32fcd4dc8df78f46dcf58e",
  measurementId: "G-4GTRPE55WT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enhanced Game Manager with Firebase Integration
export class FirebaseGameManager {
  constructor(onUserChange, onConnectionChange) {
    this.currentUser = null;
    this.isOnline = navigator.onLine;
    this.pendingSaves = [];
    this.onUserChange = onUserChange || (() => {});
    this.onConnectionChange = onConnectionChange || (() => {});
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.onUserChange(user);
      if (user) {
        console.log('🔐 User authenticated:', user.email);
        this.syncGameData();
      } else {
        console.log('🔐 User signed out');
      }
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onConnectionChange(true);
      this.syncPendingSaves();
      console.log('🌐 Back online - syncing data...');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onConnectionChange(false);
      console.log('📱 Offline mode - saving locally...');
    });
  }

  // User Registration
  async registerUser(email, password, username) {
    try {
      console.log('📝 Creating account for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: username
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        totalPlayTime: 0,
        highestMoney: 0,
        gamesPlayed: 0,
        lastActive: new Date().toISOString()
      });
      
      console.log('✅ Account created successfully');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return { success: false, error: this.getFirebaseErrorMessage(error) };
    }
  }

  // User Login
  async loginUser(email, password) {
    try {
      console.log('🔐 Signing in:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last active timestamp
      if (userCredential.user) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          lastActive: new Date().toISOString()
        }, { merge: true });
      }
      
      console.log('✅ Login successful');
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, error: this.getFirebaseErrorMessage(error) };
    }
  }

  // User Logout
  async logoutUser() {
    try {
      console.log('👋 Signing out...');
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Password reset email sent successfully!" };
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      let errorMessage = "Failed to send password reset email";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later";
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Save game data to Firebase
  async saveGameData(gameState, saveName = null) {
    if (!this.currentUser) {
      // Save locally if not logged in
      const localKey = saveName ? `chickenEmpire_save_${saveName}` : 'chickenEmpire_local';
      localStorage.setItem(localKey, JSON.stringify({
        ...gameState,
        lastSaved: new Date().toISOString()
      }));
      return { success: true, location: 'local' };
    }

    try {
      const saveData = {
        ...gameState,
        lastSaved: new Date().toISOString(),
        playerId: this.currentUser.uid,
        playerEmail: this.currentUser.email,
        playerName: this.currentUser.displayName || 'Anonymous',
        saveName: saveName || 'default'
      };

      // Save to Firestore
      const saveId = saveName ? `${this.currentUser.uid}_${saveName}` : this.currentUser.uid;
      await setDoc(doc(db, 'gameData', saveId), saveData);
      
      // Update user statistics
      await this.updateUserStats(gameState);
      
      // Also save locally as backup
      localStorage.setItem('chickenEmpire_backup', JSON.stringify(saveData));
      
      console.log('☁️ Game saved to cloud successfully');
      return { success: true, location: 'cloud' };
    } catch (error) {
      console.error('❌ Cloud save failed:', error);
      // Fallback to local save
      this.pendingSaves.push({ gameState, saveName });
      const localKey = saveName ? `chickenEmpire_save_${saveName}` : 'chickenEmpire_local';
      localStorage.setItem(localKey, JSON.stringify({
        ...gameState,
        lastSaved: new Date().toISOString()
      }));
      return { success: false, error: error.message, location: 'local_fallback' };
    }
  }

  // Load game data from Firebase
  async loadGameData(saveName = null) {
    if (!this.currentUser) {
      // Load from local storage if not logged in
      const localKey = saveName ? `chickenEmpire_save_${saveName}` : 'chickenEmpire_local';
      const localData = localStorage.getItem(localKey);
      return localData ? JSON.parse(localData) : null;
    }

    try {
      const saveId = saveName ? `${this.currentUser.uid}_${saveName}` : this.currentUser.uid;
      const docSnap = await getDoc(doc(db, 'gameData', saveId));
      
      if (docSnap.exists()) {
        const serverData = docSnap.data();
        
        // Compare with local backup to get most recent
        const localBackup = localStorage.getItem('chickenEmpire_backup');
        if (localBackup) {
          const localData = JSON.parse(localBackup);
          const serverTime = new Date(serverData.lastSaved).getTime();
          const localTime = new Date(localData.lastSaved).getTime();
          
          console.log('📊 Comparing save times - Server:', new Date(serverTime), 'Local:', new Date(localTime));
          return localTime > serverTime ? localData : serverData;
        }
        
        console.log('☁️ Game loaded from cloud');
        return serverData;
      } else if (saveName) {
        // Try local save with specific name
        const localData = localStorage.getItem(`chickenEmpire_save_${saveName}`);
        return localData ? JSON.parse(localData) : null;
      } else {
        // No server data, check for local backup
        const localData = localStorage.getItem('chickenEmpire_backup');
        console.log('📱 No cloud save found, using local backup');
        return localData ? JSON.parse(localData) : null;
      }
    } catch (error) {
      console.error('❌ Failed to load from cloud:', error);
      // Fallback to local storage
      const localKey = saveName ? `chickenEmpire_save_${saveName}` : 'chickenEmpire_local';
      const localData = localStorage.getItem(localKey);
      return localData ? JSON.parse(localData) : null;
    }
  }

  // Get all saved games for current user
  async getAllSavedGames() {
    if (!this.currentUser) {
      return this.getLocalSavedGames();
    }

    try {
      // Get all saves for this user from Firestore
      const gamesQuery = query(
        collection(db, 'gameData'),
        orderBy('lastSaved', 'desc')
      );
      
      const querySnapshot = await getDocs(gamesQuery);
      const saves = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.playerId === this.currentUser.uid) {
          const saveName = data.saveName || 'default';
          saves[saveName] = data;
        }
      });
      
      // Also include local saves
      const localSaves = this.getLocalSavedGames();
      return { ...saves, ...localSaves };
    } catch (error) {
      console.error('❌ Failed to get cloud saves:', error);
      return this.getLocalSavedGames();
    }
  }

  // Get local saved games (fallback)
  getLocalSavedGames() {
    const saves = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chickenEmpire_save_')) {
        const saveName = key.replace('chickenEmpire_save_', '');
        try {
          const saveData = JSON.parse(localStorage.getItem(key));
          saves[saveName] = saveData;
        } catch (error) {
          console.warn('⚠️ Invalid local save data for:', saveName);
        }
      }
    }
    return saves;
  }

  // Delete a saved game
  async deleteSavedGame(saveName) {
    if (!this.currentUser) {
      localStorage.removeItem(`chickenEmpire_save_${saveName}`);
      return { success: true, location: 'local' };
    }

    try {
      const saveId = `${this.currentUser.uid}_${saveName}`;
      await deleteDoc(doc(db, 'gameData', saveId));
      
      // Also remove local version if exists
      localStorage.removeItem(`chickenEmpire_save_${saveName}`);
      
      console.log('🗑️ Save deleted from cloud');
      return { success: true, location: 'cloud' };
    } catch (error) {
      console.error('❌ Failed to delete from cloud:', error);
      // Still try to delete locally
      localStorage.removeItem(`chickenEmpire_save_${saveName}`);
      return { success: false, error: error.message, location: 'local_fallback' };
    }
  }

  // Get global leaderboard from all users
  async getGlobalLeaderboard() {
    try {
      const leaderboardQuery = query(
        collection(db, 'gameData'),
        orderBy('money', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(leaderboardQuery);
      const leaderboard = [];
      
      for (const docSnap of querySnapshot.docs) {
        const gameData = docSnap.data();
        
        // Get user details
        let userData = { username: 'Anonymous' };
        if (gameData.playerId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', gameData.playerId));
            if (userDoc.exists()) {
              userData = userDoc.data();
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch user data for leaderboard entry');
          }
        }
        
        leaderboard.push({
          rank: leaderboard.length + 1,
          username: gameData.playerName || userData.username || 'Anonymous',
          money: gameData.money || 0,
          chickens: (gameData.chickens || 0) + (gameData.goldenChickens || 0),
          products: this.calculateTotalProducts(gameData.products || {}),
          lastPlayed: gameData.lastSaved,
          playTime: this.calculatePlayTime(gameData),
          isCurrentUser: this.currentUser && gameData.playerId === this.currentUser.uid
        });
      }
      
      console.log('🏆 Global leaderboard loaded:', leaderboard.length, 'players');
      return leaderboard;
    } catch (error) {
      console.error('❌ Failed to load global leaderboard:', error);
      return [];
    }
  }

  // Helper: Calculate total products
  calculateTotalProducts(products) {
    return Object.values(products).reduce((sum, count) => sum + (count || 0), 0);
  }

  // Helper: Calculate play time
  calculatePlayTime(gameState) {
    if (!gameState.gameStartTime) return 0;
    const start = new Date(gameState.gameStartTime).getTime();
    const end = gameState.lastSaved ? new Date(gameState.lastSaved).getTime() : Date.now();
    return Math.floor((end - start) / 1000 / 60); // Minutes
  }

  // Update user statistics
  async updateUserStats(gameState) {
    if (!this.currentUser) return;

    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentStats = userDoc.data();
        const newStats = {
          highestMoney: Math.max(currentStats.highestMoney || 0, gameState.money || 0),
          totalPlayTime: (currentStats.totalPlayTime || 0) + (this.calculatePlayTime(gameState) / 60), // Convert to hours
          gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
          lastActive: new Date().toISOString()
        };
        
        await setDoc(userRef, newStats, { merge: true });
      }
    } catch (error) {
      console.error('❌ Failed to update user stats:', error);
    }
  }

  // Sync pending saves when back online
  async syncPendingSaves() {
    if (!this.currentUser || !this.isOnline || this.pendingSaves.length === 0) return;

    console.log('🔄 Syncing', this.pendingSaves.length, 'pending saves...');
    
    const saves = [...this.pendingSaves];
    this.pendingSaves = [];
    
    for (const { gameState, saveName } of saves) {
      try {
        await this.saveGameData(gameState, saveName);
        console.log('✅ Synced save:', saveName || 'default');
      } catch (error) {
        console.error('❌ Failed to sync save:', error);
        this.pendingSaves.push({ gameState, saveName }); // Put back if failed
      }
    }
  }

  // Sync current game data when user logs in
  async syncGameData() {
    // This would be called by the app to sync current game state
    // when user logs in
  }

  // Helper: Get user-friendly error messages
  getFirebaseErrorMessage(error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return error.message;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }

  // Check online status
  isOnlineStatus() {
    return this.isOnline;
  }
}

// Export singleton instance
export const firebaseGameManager = new FirebaseGameManager();
