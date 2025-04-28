# Social Dashboard

## Project Overview
**Industry:** Technology  
**Developer:** ad-archer  
**Completion Date:** April 28, 2025  
**GitHub Repository:** https://github.com/ad-archer/social-dash.git  
**Trello:**   
**Live Demo:**  https://socialmetrics.adarcher.app/dashboard

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

### Value Proposition
By consolidating metrics in one dashboard, users save time on data collection, reduce login friction, and gain actionable insights faster than with siloed platform dashboards.

### AI Implementation



---

## Technology Stack
- **Frontend:** Next.js 15, React 19  
- **Language:** TypeScript  
- **Authentication:** Firebase Authentication (Google OAuth)  
- **Styling:** Tailwind CSS, Radix UI  
- **Visualization:** Recharts  
- **Package Manager:** pnpm  
- **CI/CD:** GitHub Actions (lint, typecheck, build)  

---

## Technical Implementation

### Wireframes & System Architecture



### Database Schema



### AI Model Details



---

## User Interface and Experience

### User Journey
1. User arrives at the application  
2. User signs in with Google  
3. Dashboard loads personalized social metrics  
4. User navigates to settings or YouTube analytics page

### Key Screens and Components

#### Screen 1: Dashboard



#### Screen 2: Settings



### Responsive Design Approach



### Accessibility Considerations



---

## Testing and Quality Assurance

### Testing Approach



### Unit Tests



### Integration Tests



### User Testing Results



### Known Issues and Limitations



---

## Deployment

### Deployment Architecture
Hosted on Vercel with automatic builds triggered on git pushes to main.

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Build and Deployment Process



---

## Future Enhancements
- Integrate additional social platforms (Twitter, Instagram)
- Add data caching and background refresh
- Allow users to customize dashboard widgets
- Implement role-based access for team accounts

---

## Lessons Learned



---

## Project Management

### Development Timeline



### Tools and Resources Used



---

## Conclusion



---

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

### Additional Resources
