# Full-Stack URL Shortener Service (Short.ly)


A feature-rich, full-stack URL shortening service built with the MERN stack (MongoDB, Express.js, React, Node.js). This application allows users to shorten long URLs, track click analytics, and manage their links through a private, authenticated dashboard.




---

## Features

-   **Anonymous URL Shortening:** Any visitor can quickly shorten a URL without needing an account.
-   **User Authentication:** A complete JWT-based authentication system for user registration and login.
-   **Password Hashing:** User passwords are securely hashed using `bcryptjs` before being stored.
-   **Protected Routes:** A secure, private dashboard is only accessible to logged-in users.
-   **Personalized Dashboard:** Authenticated users can view a history of all the links they've created.
-   **Click Tracking:** The service tracks and displays the number of clicks for each shortened URL (updated on page load or refresh).
-   **Automatic Redirection:** Short links seamlessly redirect to their original destination.
-   **Responsive UI:** The application is styled with Tailwind CSS for a modern, responsive experience on all devices.
-   **Robust Error Handling:** Features a full-stack error handling pipeline with client-side validation and consistent server responses.

---

## Tech Stack

### Backend

-   **Node.js:** JavaScript runtime environment.
-   **Express.js:** Web framework for Node.js.
-   **MongoDB:** NoSQL database for storing user and URL data.
-   **Mongoose:** Object Data Modeling (ODM) library for MongoDB.
-   **JSON Web Tokens (JWT):** For secure user authentication.
-   **bcryptjs:** For hashing user passwords.
-   **nanoid:** For generating unique and short URL codes.

### Frontend

-   **React.js:** A JavaScript library for building user interfaces.
-   **React Router:** For client-side routing and navigation.
-   **Tailwind CSS:** A utility-first CSS framework for styling.
-   **Axios:** For making HTTP requests to the backend API.
-   **React Context API:** For global state management (authentication).

---

## Installation and Setup

Follow these steps to get the project running on your local machine.

### Prerequisites

-   Node.js (v20.19+ or v22.12+ recommended)
-   npm (Node Package Manager)
-   MongoDB (You can use a local installation or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Clone the Repository

```sh
git clone https://github.com/manojgaddigolla/url-shortener.git
cd url-shortener
```

### 2. Setup the Backend

Navigate to the backend directory:

```sh
cd backend
```

Install the necessary NPM packages:

```sh
npm install
```

Create a `.env` file in the `backend` directory and add the following environment variables. **Replace the placeholder values with your own secure values.**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
BASE_URL=http://localhost:5000
JWT_SECRET=generate_secure_secret_below
```

Start the backend server:

```sh
npm run dev
```

The server will be running on `http://localhost:5000`.

### 3. Setup the Frontend

Open a new terminal window and navigate to the client directory:

```sh
cd client
```

Install the necessary NPM packages:

```sh
npm install
```

Create a `.env.local` file in the `client` directory and add the following variable. This should point to your running backend server.

```env
VITE_BACKEND_API_URL=http://localhost:5000
```

Start the frontend development server:

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

---

## Contact

Project Link: https://github.com/manojgaddigolla/url-shortener.git