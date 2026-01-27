CodeHub

CodeHub is a structured placement preparation platform that brings coding practice, aptitude, and core CS learning into one unified system — built to promote consistency, measurable progress, and test-driven preparation.

📌 Phase 1 — Home Page Development Roadmap
✅ Goal

Build a production-quality landing + dashboard-style home page that:

Clearly communicates the platform’s value

Looks credible and professional

Is scalable for future feature expansions

Is ready for mentor and recruiter review

✅ Phase 1 Scope

Professional landing page experience

Strong and clear value proposition

Modular architecture for future sections

Clean UI foundation for building the full platform

🧩 Planned Sections

Navigation Bar

Home

Login / Register

Dashboard (future-ready)

Hero Section

Clear headline

Short supporting description

Primary call-to-action button

Learning Domains

Coding

OOPS

Aptitude

Core CS

Platform Workflow

Learn → Practice → Test → Track

Core Features

Progress Tracking

Mock Tests

Analytics

Streak System

Final CTA + Footer

Strong “Get Started” section

Footer with links and branding

🎨 Design & UX Guidelines

Dark Theme UI

Minimal and consistent color palette

Clean, readable typography

Fully responsive layout

Desktop

Tablet

Mobile

Micro-interactions

Hover effects

Smooth transitions

Active states

🛠️ Tech Stack & Implementation Plan

React + Tailwind CSS

Component-based structure for scalability

Mobile-first responsive development

Performance optimization

Accessibility checks (basic A11y)

✅ Phase 1 Deliverables

By the end of Phase 1, the platform will include:

Fully responsive and professional home page

Strong visual identity and clean UI standard

Scalable frontend base for upcoming modules

Shareable project demo for showcasing

🐳 Docker Setup

The project supports Docker-based deployment for a clean and consistent production environment.

✅ Build the Docker Image
docker build -t codehub:latest .

✅ Run the Container
docker run --rm -p 5173:80 codehub:latest


The container serves the production build using Nginx on port 80, mapped to localhost:5173.

✅ Run Using Docker Compose
docker-compose up --build


The compose setup runs the Nginx container on port 80 internally and maps it to host port 5173 for local access.
