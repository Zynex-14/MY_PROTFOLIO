# Professional Dynamic Portfolio Website with Admin Dashboard

A modern, responsive, and minimal portfolio website for developers with a private, authenticated Admin Dashboard powered by **React**, **Tailwind CSS**, and **Firebase**.

---

## 🌟 Key Features

### 1. Public Portfolio (Visitor View)
* **Clean & Minimal Design System**: Professional slate/neutral color palette, Inter/Poppins typography, crisp cards, subtle shadows, and dark/light mode toggle.
* **Dynamic Hero Section**:
  * Profile avatar and status badge ("Available for Opportunities").
  * Professional designation with smooth dynamic typing animation.
  * Tagline and introduction.
  * Direct action buttons ("View Projects" with smooth scroll and "Download Resume").
  * Social links (GitHub, LinkedIn, Twitter/X, Email).
* **About & Education**:
  * Comprehensive professional bio and career goals.
  * Interactive education timeline with degree, institution, department, year, and honors.
* **Skills Showcase**:
  * Categorized skills (Languages, Frontend, Backend, Database, Core CS, Tools).
  * Visual proficiency bars (0-100%) and icons.
* **Projects Showcase**:
  * Filterable project cards with preview images, technology tags, and direct links to Live Demos and GitHub repositories.
* **Certificates Gallery**:
  * Verified credentials with issuer, issue date, credential ID, verification links, and preview graphics.
* **Contact Section**:
  * Direct contact details and working contact form submitting messages directly to the database.
* **Secure Separation**:
  * Admin management controls are strictly omitted from the visitor navigation bar.

### 2. Admin Dashboard (Private Portal)
* **Protected Route Guard**: Accessible only via authenticated login (`/admin/login`). Visitors are strictly blocked from `/admin`.
* **Metric Overview**: Live counters for total projects, skills, certificates, and unread inquiries.
* **Content Management (Full Dynamic CRUD)**:
  * **Hero & Profile**: Edit name, title, bio, typing phrases, avatar, resume URL, and social accounts without editing code.
  * **About & Education**: Edit career goals and add/edit/delete education entries.
  * **Skills**: Add, edit, remove, and adjust proficiency percentages.
  * **Projects**: Add, edit, remove projects with tags, URLs, and image links.
  * **Certificates**: Add, edit, remove credentials with issuer and verification URLs.
  * **Contact Inquiries**: View visitor messages, mark as read/unread, delete, and reply via mailto shortcut.
  * **Settings & Firebase Setup**: 1-click "Seed Data to Cloud Firestore" tool and factory defaults reset.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd portfolio-app
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔐 Admin Login (Demo Mode)

By default, the application runs with an **Offline-First Demo Mode** so you can test all features immediately without configuring Firebase:

* **Admin Portal URL**: `http://localhost:5173/admin/login`
* **Demo Email**: `admin@portfolio.com`
* **Demo Password**: `admin123`
*(A convenient "Auto-fill credentials" button is available on the login page).*

---

## 🔥 Connecting to Live Firebase (Cloud Firestore & Auth)

When you are ready to link your Google Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In the left menu:
   * Enable **Firestore Database** (Start in test mode or production with rules).
   * Enable **Authentication** -> **Sign-in method** -> enable **Email/Password**.
   * Create an Admin user under Authentication -> Users.
3. In **Project Settings** -> **General** -> **Your apps**, register a Web App (`</>`) and copy your configuration keys.
4. Open `.env` in `portfolio-app` and fill in your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
5. Restart your Vite dev server (`npm run dev`).
6. Log in to `/admin` and click **"Seed Current Data to Cloud Firestore"** under **Settings & Cloud** to push all initial data to the cloud in 1 click!

---

## 🛠️ Build for Production

```bash
npm run build
```
The compiled static assets will be in `dist/`, ready to deploy to Firebase Hosting, Vercel, Netlify, or GitHub Pages.
