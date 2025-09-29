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
 ┣ 📂config
 ┃ ┗ 📜referral.config.js
 ┣ 📂controllers
 ┃ ┣ 📂chat-controller
 ┃ ┃ ┗ 📜chat.controller.js
 ┃ ┣ 📂club-controller
 ┃ ┃ ┗ 📜club.controller.js
 ┃ ┣ 📂coin-package-controller
 ┃ ┃ ┗ 📜coin.package.controller.js
 ┃ ┣ 📂follower-controller
 ┃ ┃ ┗ 📜follower.controller.js
 ┃ ┣ 📂media-controller
 ┃ ┃ ┗ 📜media.controller.js
 ┃ ┣ 📂otp-controller
 ┃ ┃ ┗ 📜otp.controller.js
 ┃ ┣ 📂super-admin-controller
 ┃ ┃ ┗ 📜super-admin.controller.js
 ┃ ┣ 📂transaction-controller
 ┃ ┃ ┗ 📜transaction.controller.js
 ┃ ┗ 📂user-controller
 ┃ ┃ ┗ 📜user.controller.js
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
 ┃ ┣ 📂chat-model
 ┃ ┃ ┗ 📜chat.model.js
 ┃ ┣ 📂club-chat-model
 ┃ ┃ ┗ 📜club.chat.model.js
 ┃ ┣ 📂club-model
 ┃ ┃ ┗ 📜club.model.js
 ┃ ┣ 📂coin-package-model
 ┃ ┃ ┗ 📜coin.package.model.js
 ┃ ┣ 📂media-model
 ┃ ┃ ┗ 📜media.model.js
 ┃ ┣ 📂super-admin-model
 ┃ ┃ ┗ 📜super-admin.model.js
 ┃ ┣ 📂transaction-model
 ┃ ┃ ┗ 📜transaction.model.js
 ┃ ┗ 📂user-model
 ┃ ┃ ┗ 📜user.model.js
 ┣ 📂routes
 ┃ ┣ 📂coin-package-route
 ┃ ┃ ┗ 📜coin.package.route.js
 ┃ ┣ 📂follower-route
 ┃ ┃ ┗ 📜follower.route.js
 ┃ ┣ 📂media-route
 ┃ ┃ ┗ 📜media.route.js
 ┃ ┣ 📂otp-route
 ┃ ┃ ┗ 📜otp.route.js
 ┃ ┣ 📂super-admin-route
 ┃ ┃ ┗ 📜super-admin.route.js
 ┃ ┣ 📂transaction-route
 ┃ ┃ ┗ 📜transaction.route.js
 ┃ ┗ 📂user-route
 ┃ ┃ ┗ 📜user.route.js
 ┣ 📂utilities
 ┃ ┣ 📂cloudinary
 ┃ ┃ ┗ 📜cloudinary.utility.js
 ┃ ┣ 📂otp
 ┃ ┃ ┗ 📜otp.utility.js
 ┃ ┗ 📂socket
 ┃ ┃ ┣ 📜socket.manager.utility.js
 ┃ ┃ ┗ 📜socket.utlity.js
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜app.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┗ 📜README.md

## 📬 Contact

For any questions, suggestions, or contributions:

- Name: Muhammad Zain-Ul-Abideen
- Email: muhammadzainulabideen292@gmail.com
- GitHub: https://github.com/zain100000
- LinkedIn: https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/
