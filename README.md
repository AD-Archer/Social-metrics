# Social Dashboard

## Project Overview
**Industry:** Technology  
**Developer:** ad-archer  
**Completion Date:** April 28, 2025  
**GitHub Repository:** https://github.com/ad-archer/social-dash.git  
**Trello:** https://trello.com/invite/b/68068f8083d850bef9245db5/ATTIa2848198df96ca5274eff2d228735452487E9D2E/social-dash
**Live Demo:**  https://socialmetrics.adarcher.app/

![Dashboard Overview](https://socialmetrics.adarcher.app/img/exampleimageofsite.png)

---

## Business Problem

### Problem Statement
Social media managers and marketing teams struggle to aggregate metrics and insights from multiple platforms into a single, unified interface. This fragmentation leads to inefficient workflows and missed opportunities for data-driven decisions.

### Target Users
Marketing professionals, social media managers, and data analysts seeking a centralized dashboard for social metric tracking with minimal setup and a seamless user experience.

### Current Solutions and Limitations
Existing solutions require logging into each platform individually, manual data exports, or costly enterprise tools. They lack real-time integration and customizable visualizations.

---

## Solution Overview

### Project Description
Social Dashboard offers a unified Next.js-based interface that integrates Google-authenticated users with YouTube analytics. It surfaces key social metrics in real-time charts and tables, streamlining reporting and decision-making.

### Key Features
- Google-only authentication via Firebase for quick and secure signup.
- Real-time YouTube analytics and social metrics visualization with Recharts.
- Responsive layout powered by Tailwind CSS and Radix UI primitives.
- User settings page for profile updates and preferences.
- CI pipeline ensures code quality via GitHub Actions (lint, typecheck, build).
- YouTube RSS feed integration for displaying recent content.
- AI anaylsis of social metrics

### Value Proposition
By consolidating metrics in one dashboard, users save time on data collection, reduce login friction, and gain actionable insights faster than with siloed platform dashboards.

---

## Technology Stack
- **Frontend:** Next.js 15, React 19  
- **Language:** TypeScript  
- **Authentication:** Firebase Authentication (Google OAuth)  
- **Large Langauge Model** Open AI gpt-4o-mini
- **Styling:** Tailwind CSS, Radix UI  
- **Visualization:** Recharts  
- **Package Manager:** pnpm  
- **CI/CD:** GitHub Actions (lint, typecheck, build)  

---

## Firebase Setup

### Client-Side Firebase
Environment variables needed in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
```

### Server-Side Firebase Admin
Firebase Admin SDK is used for API routes to access Firestore securely. Add these environment variables:
```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

To generate a Firebase Admin service account:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Copy values from the downloaded JSON file to your environment variables
4. Make sure to handle newlines in the private key properly (replace `\n` with actual newlines)

---

## Development

### Installation
```bash
# Clone the repository
git clone https://github.com/ad-archer/social-dash.git
cd social-dash

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
pnpm dev
```

### Firebase Rules
The project includes Firestore security rules in `/firebase/rules/firestores.rules`.

---

## Deployment

### Deployment Architecture
Hosted on Vercel with automatic builds triggered on git pushes to main.

### Environment Variables
Make sure to set all the environment variables mentioned in the Firebase Setup section in your production environment.

---

## Future Enhancements
- Integrate additional social platforms (Twitter, Instagram)
- Add data caching and background refresh
- Allow users to customize dashboard widgets
- Implement role-based access for team accounts

## Visual Overview

### Screenshots


![Screen 1](https://socialmetrics.adarcher.app/img/screen1.png)

![Screen 2](https://socialmetrics.adarcher.app/img/screen2.png)


### Diagrams

![Entity Relationship Diagram](https://socialmetrics.adarcher.app/img/ERD.png)

![Wireframe Diagram](https://socialmetrics.adarcher.app/img/wireframe.svg)

## Appendix

### Setup Instructions
```bash
# Clone the repository
git clone https://github.com/ad-archer/social-dash.git
cd social-dash

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
pnpm dev
```



