# Quick-oh | 10-Minute Grocery Delivery Platform

Quick-oh is a hyper-local quick-commerce platform designed for speed and reliability. Delivering your favorite groceries in under 10 minutes through a robust real-time tracking and delivery partner management system.

## 🚀 Key Features

- **Real-time Tracking**: Live order tracking using Socket.io and interactive maps (Leaflet/Mapbox).
- **Secure Payments**: Integrated with Razorpay for a seamless checkout experience.
- **Background Processing**: Efficient background job management with BullMQ and Redis for orders and cleanup.
- **Responsive UI**: A premium, mobile-first design built with Next.js 15, Tailwind CSS 4, and Framer Motion.
- **Authentication**: Secure JWT-based authentication with httpOnly cookies.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [Mapbox](https://www.mapbox.com/)

### Backend
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Real-time**: [Socket.io](https://socket.io/)
- **Task Queue**: [BullMQ](https://docs.bullmq.io/) with [Redis](https://redis.io/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/nachiketdeore09/Quick-oh.git
cd Quick-oh
```

### 2. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Fill in your variables in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd next-frontend
npm install
cp .env.example .env
# Fill in your variables in .env
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`/Backend/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Port number for the server (e.g., 8000) |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection URL |
| `ACCESS_TOKEN_SECRET` | Secret key for JWT access tokens |
| `REFRESH_TOKEN_SECRET` | Secret key for JWT refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name for image storage |
| `RAZORPAY_KEY_ID` | Your Razorpay Public Key |

### Frontend (`/next-frontend/.env`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of your backend API |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay Public Key |

---

## 🤝 Contribution
Contributions are welcome! Please feel free to submit a Pull Request.
