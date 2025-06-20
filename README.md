# Strava Activity Visualizer

A modern web application to visualize and analyze Strava activity data, built with Vue 3, Vite, and Tailwind CSS. This project fetches running and walking activities from the Strava API, caches them in Firebase Firestore, and provides an interactive dashboard to explore recent activities, stats, weekly progress, and customizable goals.

🚀 **[Live Demo](https://karlritostrava.netlify.app)** | 🏃‍♂️ **[My Strava Profile](https://www.strava.com/athletes/152143433)**

## ✨ Features

### 📊 Activity Dashboard
- View recent running and walking activities in a sortable table
- Filter by date, name, and activity type (runs or walks)
- Responsive design optimized for desktop and mobile

### 📈 Stats Overview
- Display total distance, average pace, and longest activity
- Options to combine or separate run/walk data
- Real-time calculations based on selected filters

### 📉 Weekly Progress Chart
- Visualize weekly activity trends using custom chart components
- Track performance over time with interactive charts

### 🎯 Goal Tracking
- **Overall Goals**: Set distance goals (e.g., 500 km) with start date tracking
- **Weekly Goals**: Set weekly distance targets (e.g., 38 km) and monitor progress
- Toggle between combined (run + walk) or type-specific goals

### 🎨 Modern UI/UX
- Floating sidebar navigation with smooth scrolling
- Glassmorphism design using Tailwind CSS
- Responsive layout for all device sizes

### ⚡ Performance
- Real-time data fetching from Strava API
- Firebase Firestore caching for improved performance
- Optimized data loading and filtering

## 🛠️ Technologies Used

### Frontend
- **Vue 3** (Options API)
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)

### Backend
- **Node.js**
- **Express.js**

### APIs & Services
- **Strava API** (Activity data)
- **Firebase Firestore** (Data caching)

### Deployment
- **Netlify** (Frontend)
- **Render** (Backend)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- A **Strava account** with API access
- A **Firebase project** with Firestore enabled

## 🚀 Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/strava-activity-visualizer.git
cd strava-activity-visualizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

#### Frontend Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api/activities
```

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REFRESH_TOKEN=your_strava_refresh_token
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

#### Getting API Credentials
- **Strava API**: Get credentials from [Strava API Settings](https://www.strava.com/settings/api)
- **Firebase**: Generate service account credentials from your Firebase project console

### 4. Run the Backend

```bash
cd backend
npm install
node server.cjs
```

### 5. Run the Frontend

In the root directory:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Deployment

### Frontend (Netlify)

1. Push your code to a GitHub repository
2. Connect the repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL` pointing to your backend

### Backend (Render)

1. Deploy the `backend` directory to Render as a Node.js service
2. Set all required environment variables in Render's dashboard
3. Configure start command: `node server.cjs`

## 🎮 Usage

### Getting Started
1. **Authorize Strava**: On first load, authorize the app to access your Strava data
2. **Explore Activities**: Use tabs to view runs, walks, or combined data
3. **Apply Filters**: Filter by name, date range, or number of activities
4. **Sort Data**: Click column headers to sort by date, distance, time, or pace

### Setting Goals
1. **Overall Goals**: Navigate to the Overall Goals section and set your distance target
2. **Weekly Goals**: Set weekly distance goals and track your progress
3. **Goal Types**: Toggle between combined activities or specific activity types

### Navigation
- Use the floating sidebar (desktop) for quick navigation
- Smooth scrolling between sections
- Responsive design adapts to your device

## 📁 Project Structure

```
strava-activity-visualizer/
├── backend/                    # Node.js/Express backend
│   ├── server.cjs              # API server for Strava and Firebase
│   └── ...
├── src/                        # Vue 3 frontend
│   ├── components/             # Vue components
│   │   ├── WeeklyChart.vue     # Weekly progress chart
│   │   ├── Counter.vue         # Goal counter component
│   │   └── ...
│   ├── services/               # Service layer
│   │   ├── firebase.js         # Firebase configuration
│   │   └── ...
│   ├── App.vue                 # Main application component
│   ├── main.js                 # Application entry point
│   └── assets/                 # Static assets
├── .env                        # Frontend environment variables
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow Vue 3 best practices
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Test your changes thoroughly

## 🏃‍♂️ About the Author

**Karl Louise Rito**
- 🌐 [Strava Profile](https://www.strava.com/athletes/152143433)
- 💻 Passionate about running and coding
- 🚀 Building tools to help athletes track their progress

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Strava** for providing an excellent API
- **Vue.js** community for amazing documentation
- **Firebase** for reliable backend services
- **Tailwind CSS** for beautiful, responsive design
- All the runners and walkers who inspire us to keep moving! 🏃‍♀️🚶‍♂️

---

⭐ **Star this repo** if you find it helpful!

© 2025 Karl Louise Rito