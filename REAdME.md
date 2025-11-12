# PawsMart 🐾

**Live Site:** [[PawsMart Website](https://pawsmart-79833.web.app)]

PawsMart is a modern React-based marketplace for pets and pet-related products, designed to help pet lovers adopt pets, buy pet food, accessories, and care products, all in one place.

## Features

- **Multiple Categories:**

  - **Pets** – Browse pets available for adoption (adoption price is free).
  - **Pet Food** – Purchase various types of pet food.
  - **Accessories** – Find toys, collars, beds, and more.
  - **Pet Care Products** – Shop for grooming and health products.

- **User Authentication:**

  - Secure login and signup using **Firebase Email & Password**.
  - **Google Sign-In** integration for faster login.

- **CRUD Operations for Listings:**

  - Authenticated users can **create, update, and delete** their listings.
  - Users can place **orders** or adopt pets securely.
  - **Node.js + Express** backend with **MongoDB** database.
  - **Secure API routes** using Firebase Admin SDK and `verifyUser` middleware.

- **Modern UI/UX:**

  - **Dark and Light Mode** toggle for user comfort.
  - Built with **React**, **Tailwind CSS**, and **DaisyUI**.
  - Smooth Scrolling animations using **Framer Motion** and interactive carousels via **Swiper**.

- **Additional Features:**
  - PDF Order reports generation.
  - Beautiful alerts with **SweetAlert2**.
  - Dynamic effects with **React Icons** and **Typewriter** animations.
  - API calls handled seamlessly with **Axios**.

## Tech Stack

- **Frontend:** React, Tailwind CSS, DaisyUI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Firebase Auth (Email/Password & Google)

## 📦 NPM Packages Used Fo Backend

- mongodb
- firebase-admin
- express
- cors
- dotenv

## How to Run Locally

1. Clone these repository:

   ```bash
   git clone https://github.com/Nur-Nayeem/PawMart-Client-Assignment-10-Programming-Hero.git

   git clone https://github.com/Nur-Nayeem/PawMart-Server-Assignment-10-Programming-Hero.git

   ```

2. Install dependencies:

   ```bash
   cd PawMart-Client-Assignment-10-Programming-Hero && npm install

   cd PawMart-Server-Assignment-10-Programming-Hero && npm install
   ```

3. Add .env in server folder with Firebase Admin credentials and MongoDB URI.

4. Start server:
   ```bash
   node index.js
   ```
5. Start client:

   ```bash
   npm run dev
   ```

6. Visit http://localhost:5173 in your browser.
