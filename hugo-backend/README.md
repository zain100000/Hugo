## 📚 Destined Backend

A Node.js RESTful API for managing a real-time voice & video chat social platform with multi-role access (Super Admin and Users). Built with scalability, security, and real-time communication in mind to handle user authentication, profile management, room creation & discovery, chats, virtual gifts & payments, notifications, and content moderation.

## 🚀 Features

## Super Admin Module

- User Management: Approve, suspend, ban, verify badges, and monitor user activity.
- Profile & Content Moderation: Review and manage reported users, posts, rooms, and in-room chats.
- Room & Discovery Oversight: Configure categories, feature trending rooms, and highlight selected content.
- Virtual Gifts & Transaction Oversight: Manage coin packages, track purchases, withdrawals, and overall revenue.
- Analytics & Reporting: Monitor platform growth, top rooms, engagement stats, and revenue reports.
- Promotions & Notifications: Launch promotions, approve special events, and send system-wide announcements.
- Dispute & Complaint Management: Handle user complaints, enforce policies, and manage repeat offenders.

## 🛠️ Tech Stack

- Node.js - Runtime environment
- Express.js - Web framework
- MongoDB - Database
- JWT - Authentication
- dotenv - Environment variables
- Cloudinary - Image management
- Nodemailer - Email notifications
- Cron - Scheduled tasks

## 📁 Project Structure

📦hugo-backend
 ┣ 📂controllers
 ┃ ┗ 📂super-admin-controller
 ┃ ┃ ┗ 📜super-admin.controller.js
 ┣ 📂helpers
 ┃ ┣ 📂email-helper
 ┃ ┃ ┗ 📜email.helper.js
 ┃ ┣ 📂password-helper
 ┃ ┃ ┗ 📜password.helper.js
 ┃ ┗ 📂token-helper
 ┃ ┃ ┗ 📜token.helper.js
 ┣ 📂middlewares
 ┃ ┣ 📜auth.middleware.js
 ┃ ┗ 📜security.middleware.js
 ┣ 📂models
 ┃ ┗ 📂super-admin-model
 ┃ ┃ ┗ 📜super-admin.model.js
 ┣ 📂routes
 ┃ ┗ 📂super-admin-route
 ┃ ┃ ┗ 📜super-admin.route.js
 ┣ 📂utilities
 ┃ ┗ 📂cloudinary
 ┃ ┃ ┗ 📜cloudinary.utility.js
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜app.js
 ┣ 📜package.json
 ┗ 📜README.md

## 📬 Contact

For any questions, suggestions, or contributions:

- Name: Muhammad Zain-Ul-Abideen
- Email: muhammadzainulabideen292@gmail.com
- GitHub: https://github.com/zain100000
- LinkedIn: https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/
