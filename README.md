# 🎬 StudioSpace — Creative Workspace & Production Studio Sharing Platform

**StudioSpace** is a peer-to-peer marketplace for discovering, listing, and booking creative workspaces and production studios. It connects creators such as photographers, filmmakers, podcasters, musicians, and artists with professional spaces tailored to their creative needs.

Users can explore studios, filter by category, view detailed workspace information, manage their own studio listings, and reserve available studio slots through a streamlined booking system.

## 🌐 Live Site

**Live Website:** https://ph-b14-assign08-studiospace.vercel.app/

**Client Repository:** https://github.com/abeerahmed576/ph-b14-assign08-studiospace-client

**Server Repository:** https://github.com/abeerahmed576/ph-b14-assign08-studiospace-server

---

## ✨ Key Features

- 🎥 **Explore Creative Studios** — Browse photography studios, film stages, podcast rooms, music suites, workshops, and other creative spaces with detailed information and pricing.
- 🔐 **Secure Authentication** — User registration and login with email/password and Google authentication, including protected private routes.
- 🏢 **Studio Listing Management** — Authenticated users can add, update, view, and delete their own studio listings with MongoDB-backed CRUD operations.
- 📅 **Studio Booking System** — Users can reserve available studio slots, track booking status, and cancel pending bookings.
- 🚫 **Double-Booking Prevention** — The booking system validates existing confirmed reservations and prevents overlapping bookings.
- 🛡️ **JWT-Based API Security** — Protected server-side mutations use JWT authentication with HTTPOnly cookies and unauthorized requests are rejected.
- 🔎 **Dynamic Studio Discovery** — Explore studios by category and browse dynamically fetched listings from MongoDB.
- ⭐ **Studio Details & Reviews** — Detailed studio pages include gallery images, amenities, host information, ratings, reviews, pricing, and booking actions.
- 🌓 **Light/Dark Theme** — Users can switch between light and dark themes throughout the application.
- 📱 **Fully Responsive UI** — Designed to provide a consistent experience across mobile, tablet, and desktop devices.
- 🔔 **Toast Feedback** — User-friendly notifications provide immediate feedback for authentication, CRUD, and booking actions.
- ⏳ **Loading & Empty States** — Branded loading indicators, skeleton states, and helpful empty states improve the overall user experience.
- ❌ **Custom 404 Page** — A creative studio-themed not-found page provides a clear route back to the home page.

---

## 🛠️ Tech Stack

### Frontend

- **Next.js** — App Router
- **React**
- **TypeScript**
- **Shadcn UI**
- **Tailwind CSS**
- **Swiper.js**
- **ShadCn Toast**
- **Better Auth**

### Backend

- **Express.js**
- **Node.js**
- **JavaScript**
- **MongoDB**
- **MongoDB Adapter**
- **JWT**

### Authentication & Security

- Better Auth
- Google OAuth
- JWT authentication
- HTTPOnly cookies
- Protected API routes
- Server-side authorization

### Image Upload

- **ImgBB / image hosting service** for studio images

---

## 🚀 Local Setup

### 1. Clone the Client Repository

```bash
git clone https://github.com/abeerahmed576/ph-b14-assign08-studiospace-client
cd ph-b14-assign08-studiospace-client
```

### 2. Install Client Dependencies

```bash
npm install
```

### 3. Configure Client Environment Variables

Create a `.env.local` file in the client project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth
BETTER_AUTH_SECRET=[Create Your Own]
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=[Create Your Own]
GOOGLE_CLIENT_SECRET=[Create Your Own]
```

Add any additional environment variables required by your implementation.

### 4. Start the Client

```bash
npm run dev
```

The Next.js application should now be available at:

```text
http://localhost:3000
```

---

## 🖥️ Server Setup

### 1. Clone the Server Repository

```bash
git clone https://github.com/abeerahmed576/ph-b14-assign08-studiospace-server
cd ph-b14-assign08-studiospace-server
```

### 2. Install Server Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the server project root:

```env
MONGODB_URI=[Create Your Own]
CLIENT_URL=http://localhost:3000
```

Add any additional environment variables required by your server configuration.

### 4. Start the Server

For development:

```bash
npm run dev
```

Or:

```bash
npm start
```

The Express API should now be available at:

```text
http://localhost:8000
```

---

## 🔑 Environment Variables

For security, environment variables containing secrets or credentials should **never be committed to GitHub**.

Make sure your `.gitignore` contains entries such as:

```gitignore
.env
.env.local
.env.*.local
```

You will need to configure your own:

- MongoDB connection credentials
- Better Auth secret
- Google OAuth credentials
- Image hosting credentials/API keys
- Client/server URLs

---

## 🔒 Security

StudioSpace implements several security measures:

- Protected private routes
- JWT-based API authorization
- HTTPOnly cookies for authentication tokens
- Server-side authorization for protected mutations
- Ownership validation for studio management
- Protected POST, PUT/PATCH, and DELETE operations
- Booking collision detection
- Secure environment variable handling

---

## 📱 Responsive Design

StudioSpace is designed to work across:

- 📱 Mobile devices
- 📲 Tablets
- 💻 Laptops
- 🖥️ Desktop displays

The interface adapts navigation, studio cards, forms, dashboards, booking interfaces, and other components to different screen sizes.

---

## 🎨 UI & UX

The application focuses on a modern production-studio aesthetic with:

- Creative studio-focused visual design
- Responsive layouts
- Interactive hero slider
- Studio category browsing
- Dark/light theme support
- Skeleton loading states
- Custom empty states
- Toast notifications
- Custom 404 experience
- Accessible interactive components
- Consistent Shadcn UI components