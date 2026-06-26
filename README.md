# ServiceadvertisementPlatform

# ServAd — Service Advertisement Platform

A full-stack platform where service providers can advertise their services and users can discover, book, and review them. Built with .NET 9 Web API and React (Vite), deployed on AWS.

## Features

- **Authentication** — JWT-based login/register, Google OAuth, email OTP verification, password reset
- **Service Listings** — Providers can create listings with images or video promos
- **Booking System** — Users book services, providers manage appointments
- **Real-time Chat** — SignalR-powered messaging between users and providers per booking
- **Payment Integration** — eSewa and Khalti payment gateways for bookings and point purchases
- **Gamification** — Points system, daily login rewards, watch-time rewards, service boosting
- **AI Features** — AI chatbot and image generation via Groq (Llama) and Pollinations
- **Admin Panel** — Identity verification queue, user management, suspension controls, category management
- **Notifications** — Real-time push notifications via SignalR
- **Document Verification** — Users submit ID documents for admin review

## Tech Stack

### Backend
- .NET 9 Web API (Clean Architecture)
- Entity Framework Core + PostgreSQL (Npgsql)
- ASP.NET Core Identity (GUID keys)
- SignalR for real-time features
- RabbitMQ for async messaging
- FluentEmail + Gmail SMTP
- Docker + Docker Compose

### Frontend
- React 18 + Vite
- Material UI + Bootstrap
- Axios, React Router
- SignalR JS client
- SweetAlert2, Recharts

### Infrastructure (AWS)
- **EC2** — Backend API container
- **RDS (PostgreSQL)** — Managed database
- **S3** — Frontend static hosting
- **Docker Compose** — Container orchestration

## Project Structure

