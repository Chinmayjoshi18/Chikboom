# 🧪 Test Account Creation Guide

## Quick Test Steps:

### 1. Open Game
- Navigate to: `http://localhost:3000`
- Wait for game to load completely

### 2. Test Registration
- Click **"🌐 Login"** button (top menu)
- Click **"Don't have an account? Create one"**
- Fill form:
  ```
  Username: TestPlayer
  Email: player@test.com
  Password: password123
  ```
- Click **"📝 Create Account"**

### 3. Verify Success
- ✅ Success message appears: "🎉 Account created successfully!"
- ✅ Button changes to: "👤 TestPlayer"
- ✅ Modal closes automatically

### 4. Test Account Features
- Click **"👤 TestPlayer"** to view profile
- Click **"💾 Save"** to test cloud saves
- Click **"🏆 Board"** to see if you appear on leaderboard

### 5. Test Sign Out/In
- In profile modal, click **"🚪 Sign Out"**
- Button returns to **"🌐 Login"**
- Click login and sign back in with same credentials

## Expected Results:

### ✅ Working Features:
- User registration with validation
- Login/logout functionality  
- User profile display
- Save games linked to account
- Account state persistence
- Professional UI/UX

### 🔄 Demo Limitations:
- No real email verification
- Data stored locally only
- No cross-device sync (yet)
- No password recovery

## Troubleshooting:

### If Button Doesn't Appear:
- Refresh the page
- Check browser console for errors
- Ensure game fully loaded

### If Modal Doesn't Open:
- Try clicking the button again
- Check for JavaScript errors
- Clear browser cache if needed

### If Account Creation Fails:
- Try different email format
- Ensure password is 6+ characters
- Check for form validation messages

## Demo Account Ideas:
```
Username: ChickenFarmer
Email: farmer@chickens.com
Password: chickens123

Username: EggMaster  
Email: eggs@master.com
Password: eggs123456

Username: GoldenPlayer
Email: gold@player.com
Password: golden123
```

The system will accept any valid email format and 6+ character passwords in demo mode!



