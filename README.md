# 🐔 Chicken Empire Tycoon - React Version

A modern React-based incremental business tycoon game built with **React** and **Tailwind CSS**.

## 🚀 **Live Demo**

**Play the game now**: [http://localhost:3000](http://localhost:3000) (Development)

## ✨ **Features**

### 🎮 **Core Game Mechanics**
- **Real-time chicken farming** with egg collection
- **Production system** - Turn eggs into valuable products
- **Cook management** - Hire cooks for simultaneous production
- **Strategic feed management** - Keep chickens alive
- **60x game time** - Fast-paced gameplay
- **Progressive upgrades** and automation systems

### 🎨 **Modern Tech Stack**
- **React 18** with functional components and hooks
- **Tailwind CSS** for modern, responsive styling  
- **Custom game state management** with React hooks
- **Real-time updates** at 10 FPS
- **Local storage persistence**
- **Professional component architecture**

### 📱 **Responsive Design**
- **Mobile-first** approach with Tailwind
- **60-40 layout** (main game area vs shop)
- **Touch-friendly** interactions
- **Smooth animations** and transitions

## 🏗️ **Project Structure**

```
src/
├── components/           # React components
│   ├── Header.js        # Game time and controls
│   ├── GameStats.js     # Balance and statistics
│   ├── ChickenFarm.js   # Chicken display
│   ├── ProductionKitchen.js  # Recipe production
│   ├── SalesSection.js  # Egg and product sales
│   ├── CollectButton.js # Main collection button
│   └── Shop.js          # Categorized shop system
├── hooks/
│   └── useGameState.js  # Main game logic hook
├── App.js               # Main app component
└── index.css            # Tailwind + custom styles
```

## 🛠️ **Development**

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Key Technologies
- **React Hooks**: `useState`, `useEffect`, `useCallback`, `useRef`
- **Tailwind CSS**: Utility-first CSS framework
- **Component Architecture**: Modular, reusable components
- **Game Loop**: `setInterval` with delta time calculations
- **Local Storage**: Persistent game saves

## 🎯 **Game Features**

### 🐔 **Production Chain**
1. **Collect eggs** from chickens (every 6 seconds)
2. **Cook products** using recipes (5s-1min cooking time)  
3. **Hire cooks** for multiple simultaneous productions
4. **Sell products** for 6-8x higher profits than raw eggs

### 🌾 **Resource Management**
- **Feed consumption**: 2 units/min per chicken
- **Grace period**: 3 minutes when feed runs out
- **Strategic purchasing**: Bulk feed packages
- **Chicken survival**: Feed them or they die

### 💰 **Economic System**
- **Progressive pricing**: Costs increase with expansion
- **Cook salaries**: $10/hour per cook (real-time deduction)
- **High-value products**: Transform cheap eggs into expensive items
- **Time vs money**: Immediate sales vs patient production

### 🎮 **Game Progression**
- **Day/time system**: 60x speed with visual clock
- **Multiple chickens**: Regular and golden varieties
- **Upgrade paths**: Coops, kitchens, automation
- **Achievement targets**: Build your empire

## 🚀 **Deployment**

The React version can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify** 
- **GitHub Pages** with `gh-pages`
- **Any static hosting service**

### Build Commands
```bash
# Production build
npm run build

# Deploy to GitHub Pages
npm install --save-dev gh-pages
npm run build && npx gh-pages -d build
```

## 🔄 **Migration from HTML Version**

This React version includes:
- ✅ **All original game mechanics** converted to React
- ✅ **Modern component architecture** 
- ✅ **Tailwind CSS styling** replacing custom CSS
- ✅ **Improved responsive design**
- ✅ **Better code organization** and maintainability
- ✅ **Professional development workflow**

## 🎨 **Styling Approach**

- **Tailwind utilities** for rapid development
- **Custom component classes** for game-specific elements
- **Consistent color palette** with CSS custom properties
- **Smooth animations** using Tailwind transitions
- **Mobile-responsive** design patterns

## 🔧 **Available Scripts**

- `npm start` - Run development server
- `npm run build` - Create production build  
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

---

**🐔 Build your chicken empire with modern React technology! 🏆**