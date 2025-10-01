## 📚 Hugo SuperAdmin Panel

A React.js frontend application built with Vite, Bootstrap 5, and Redux Toolkit for managing the Hugo voice & video chat social platform as a Super Administrator. This panel provides comprehensive control over users, rooms, content moderation, virtual gifts, transactions, and platform operations.

## 🚀 Features

## 👥 User Management

- Approve, suspend, ban, and verify badges for user accounts.
- Monitor user activity and engagement metrics.
- View and manage all user profiles.

## 🛡️ Profile & Content Moderation

- Review and manage reported users, posts, rooms, and in-room chats.
- Enforce platform policies and manage repeat offenders.
- Handle safety complaints and concerns.

## 💰 Transaction Oversight

- Manage coin packages catalog.
- Track purchases.

## 📢 Notifications

- Send system-wide notifications.

## 🛠️ Tech Stack

- React.js - Frontend framework
- Vite - Build tool and development server
- Bootstrap 5 - UI component library
- Redux Toolkit - State management
- React Router - Navigation and routing
- Axios - HTTP client for API communication

📁 Project Structure

📦hugo-super-admin
┣ 📂public
┃ ┗ 📜favicon.svg
┣ 📂src
┃ ┣ 📂assets
┃ ┃ ┣ 📂logo
┃ ┃ ┃ ┗ 📜logo.png
┃ ┃ ┗ 📂placeHolders
┃ ┃ ┃ ┣ 📜club-placeholder.png
┃ ┃ ┃ ┗ 📜img-placeholder.png
┃ ┣ 📂navigation
┃ ┃ ┣ 📂outlet
┃ ┃ ┃ ┣ 📜Dashboard.layout.css
┃ ┃ ┃ ┗ 📜Outlet.outlet.jsx
┃ ┃ ┣ 📂protected-routes
┃ ┃ ┃ ┗ 📜Protected.routes.jsx
┃ ┃ ┣ 📜App.navigator.jsx
┃ ┃ ┗ 📜Root.navigator.jsx
┃ ┣ 📂redux
┃ ┃ ┣ 📂config
┃ ┃ ┃ ┗ 📜Config.config.jsx
┃ ┃ ┣ 📂slices
┃ ┃ ┃ ┣ 📜auth.slice.jsx
┃ ┃ ┃ ┣ 📜package.slice.jsx
┃ ┃ ┃ ┣ 📜super-admin.slice.jsx
┃ ┃ ┃ ┣ 📜transaction.slice.jsx
┃ ┃ ┃ ┗ 📜user.slice.jsx
┃ ┃ ┗ 📂store
┃ ┃ ┃ ┗ 📜store.store.jsx
┃ ┣ 📂screens
┃ ┃ ┣ 📂auth
┃ ┃ ┃ ┣ 📂Forgot-password
┃ ┃ ┃ ┃ ┣ 📜ForgotPassword.auth.css
┃ ┃ ┃ ┃ ┗ 📜ForgotPassword.auth.jsx
┃ ┃ ┃ ┣ 📂Reset-password
┃ ┃ ┃ ┃ ┣ 📜ResetPassword.auth.css
┃ ┃ ┃ ┃ ┗ 📜ResetPassword.auth.jsx
┃ ┃ ┃ ┗ 📂Signin
┃ ┃ ┃ ┃ ┣ 📜Signin.auth.css
┃ ┃ ┃ ┃ ┗ 📜Signin.auth.jsx
┃ ┃ ┣ 📂Clubs
┃ ┃ ┃ ┣ 📂Club-Details
┃ ┃ ┃ ┃ ┣ 📜Club.details.css
┃ ┃ ┃ ┃ ┗ 📜Club.details.jsx
┃ ┃ ┃ ┗ 📂Manage-Clubs
┃ ┃ ┃ ┃ ┣ 📜Clubs.css
┃ ┃ ┃ ┃ ┗ 📜Clubs.jsx
┃ ┃ ┣ 📂Coin-Packages
┃ ┃ ┃ ┣ 📂Add-Packages
┃ ┃ ┃ ┃ ┣ 📜Add.Coin.package.css
┃ ┃ ┃ ┃ ┗ 📜Add.Coin.package.jsx
┃ ┃ ┃ ┣ 📂Manage-Packages
┃ ┃ ┃ ┃ ┣ 📜Coin.package.css
┃ ┃ ┃ ┃ ┗ 📜Coin.package.jsx
┃ ┃ ┃ ┗ 📂Update-Package
┃ ┃ ┃ ┃ ┣ 📜Update.Coin.package.css
┃ ┃ ┃ ┃ ┗ 📜Update.Coin.package.jsx
┃ ┃ ┣ 📂Dashboard
┃ ┃ ┃ ┗ 📜Main.dashboard.jsx
┃ ┃ ┣ 📂Not-found
┃ ┃ ┃ ┣ 📜Not-Found.css
┃ ┃ ┃ ┗ 📜Not-Found.jsx
┃ ┃ ┣ 📂Transactions
┃ ┃ ┃ ┗ 📂Manage-Transactions
┃ ┃ ┃ ┃ ┣ 📜Transactions.css
┃ ┃ ┃ ┃ ┗ 📜Transactions.jsx
┃ ┃ ┗ 📂Users
┃ ┃ ┃ ┣ 📂Manage-Users
┃ ┃ ┃ ┃ ┣ 📜Users.css
┃ ┃ ┃ ┃ ┗ 📜Users.jsx
┃ ┃ ┃ ┗ 📂User-Details
┃ ┃ ┃ ┃ ┣ 📜User.details.css
┃ ┃ ┃ ┃ ┗ 📜User.details.jsx
┃ ┣ 📂styles
┃ ┃ ┗ 📜global.styles.css
┃ ┣ 📂utilities
┃ ┃ ┣ 📂Button
┃ ┃ ┃ ┣ 📜Button.utility.css
┃ ┃ ┃ ┗ 📜Button.utility.jsx
┃ ┃ ┣ 📂Card
┃ ┃ ┃ ┣ 📜Card.utility.css
┃ ┃ ┃ ┗ 📜Card.utility.jsx
┃ ┃ ┣ 📂Header
┃ ┃ ┃ ┣ 📜Header.utility.css
┃ ┃ ┃ ┗ 📜Header.utility.jsx
┃ ┃ ┣ 📂InputField
┃ ┃ ┃ ┣ 📜InputField.utility.css
┃ ┃ ┃ ┗ 📜InputField.utility.jsx
┃ ┃ ┣ 📂Loader
┃ ┃ ┃ ┣ 📜Loader.utility.css
┃ ┃ ┃ ┗ 📜Loader.utility.jsx
┃ ┃ ┣ 📂Modal
┃ ┃ ┃ ┣ 📜Modal.utility.css
┃ ┃ ┃ ┗ 📜Modal.utlity.jsx
┃ ┃ ┣ 📂Sidebar
┃ ┃ ┃ ┣ 📜Sidebar.utility.css
┃ ┃ ┃ ┗ 📜Sidebar.utility.jsx
┃ ┃ ┣ 📂Socket
┃ ┃ ┃ ┣ 📂Chat-Events
┃ ┃ ┃ ┃ ┗ 📜Chat.events.utility.jsx
┃ ┃ ┃ ┣ 📂Config
┃ ┃ ┃ ┃ ┗ 📜Config.jsx
┃ ┃ ┃ ┣ 📜Socket.context.utility.jsx
┃ ┃ ┃ ┗ 📜Socket.utility.jsx
┃ ┃ ┗ 📂Validations
┃ ┃ ┃ ┗ 📜Validation.utility.jsx
┃ ┗ 📜main.jsx
┣ 📜.gitignore
┣ 📜eslint.config.js
┣ 📜index.html
┣ 📜package-lock.json
┣ 📜package.json
┣ 📜README.md
┗ 📜vite.config.js

## 📬 Contact

For any questions, suggestions, or contributions:

- Name: Muhammad Zain-Ul-Abideen
- Email: muhammadzainulabideen292@gmail.com
- LinkedIn: https://www.linkedin.com/in/muhammad-zain-ul-abideen-270581272/
- GitHub: https://github.com/zain100000
