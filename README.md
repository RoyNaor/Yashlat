# Yashlat — Warriors "CRM"

A full-stack Warrior Relationship Management (WRM) web app.  
Built with **Next.js (App Router)**, **TypeScript**, **TailwindCSS**, and integrated with **Firebase** for authentication and data management.  
This project is currently **in development**.

---

##  About

Yashlat (Warriors CRM) is a full-stack web application designed to manage warriors interactions, tasks. Still in development, aiming to grow into a robust CRM platform.

---

##  Project Structure

- **app/** – Next.js App Router pages & routes  
- **components/** – Reusable React components (modals, forms, layouts, etc.)  
- **public/** – Static assets (images, icons, etc.)  
- **utils/** – Utility functions (helpers, formatting, API helpers, etc.)  
- **firebaseConfig.ts** – Firebase setup and configs  
- **middleware.ts** – Route protection, authentication handling  
- **next.config.ts** – Next.js configuration  
- **eslint.config.mjs** – Linting rules and config  
- **postcss.config.mjs** – PostCSS configuration  
- **tailwind.config.js** – TailwindCSS setup  
- **tsconfig.json** – TypeScript configuration  
- **package.json / package-lock.json** – Project dependencies and scripts  
---

##  Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript  
- **Styling:** TailwindCSS  
- **Auth / Backend:** Firebase (Authentication / Firestore or Realtime Database)  
- **Linting:** ESLint  
- **PostCSS:** For CSS transformations  
- **State / Utils:** Custom utility and helper modules in `utils/`

---

##  Getting Started

### Prerequisites

- **Node.js** 18 or higher  
- **Firebase project** (setup required for auth and database access)

### Clone & Install

```bash
git clone https://github.com/RoyNaor/Yashlat.git
cd Yashlat
npm install
# or: pnpm install / yarn install
