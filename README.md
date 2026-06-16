# Piki Ora Clinic React Frontend

This repository contains the React.js frontend for the Piki Ora Clinic appointment booking project. It connects to the Django REST Framework backend and provides public pages for browsing doctors and appointment slots, patient pages for booking and managing appointments, and a React-based administrator dashboard.

## Project Links

- Django REST Framework repository: https://github.com/steventsz/PikiOra7420drf
- React.js repository: https://github.com/steventsz/pikiora7420react
- Django REST Framework Vercel deployment: https://piki-ora7420drf.vercel.app/
- React.js Vercel deployment: https://pikiora7420react.vercel.app/

## Demo Admin Login

Use the following default administrator account for testing the admin dashboard:

```text
username: admin
password: admin
```

## Technology Stack

- React with JavaScript
- Create React App with `react-scripts`
- React Router using `BrowserRouter`, `Routes`, and `Route`
- Bootstrap and React-Bootstrap
- Axios for API requests
- Browser `localStorage` for simple token persistence

## Main Features

Public users can:

- View the home page for Piki Ora Clinic.
- Browse the doctor list.
- Browse appointment slots.
- Filter appointment slots by doctor, date, and availability.

Registered patients can:

- Register a new patient account.
- Log in and store their token locally.
- Book an available appointment slot.
- View their own appointments.
- Cancel or delete appointments where allowed.

Administrator users can:

- Access the React admin dashboard.
- Manage doctors.
- Manage appointment slots.
- Manage appointments.
- Manage users.

## Frontend Routes

The main routes are defined in `src/App.js`.

| Route | Purpose |
| --- | --- |
| `/` | Home page |
| `/doctors` | Public doctor list |
| `/slots` | Public appointment slot list and booking page |
| `/login` | Login page |
| `/register` | Patient registration page |
| `/appointments` | Patient appointment management page |
| `/admin` | React administrator dashboard |

## Backend API

The frontend sends requests to the Django REST Framework API. The default local API base URL is configured in `src/constraints.js`:

```text
http://127.0.0.1:8000/api
```

For deployment or another backend URL, create a `.env` file in the frontend project and set:

```text
REACT_APP_API_BASE_URL=https://piki-ora7420drf.vercel.app/api
```

After changing environment variables, restart the React development server.

## Local Setup

Install the frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The app will run at:

```text
http://localhost:3000
```

For full functionality, start the Django REST Framework backend as well. The local backend should be available at:

```text
http://127.0.0.1:8000/api
```

## Useful Scripts

Run the development server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Project Structure

```text
src/
  App.js                  Main route definitions
  constraints.js          Shared API base URL
  components/
    Navigation.js         Main navigation bar and logout logic
    Login.js              User login form
    Register.js           Patient registration form
    Doctors.js            Public doctor list
    Slots.js              Slot browsing and appointment booking
    Appointments.js       Patient appointment management
    AdminDashboard.js     Admin dashboard tabs
    AdminDoctors.js       Doctor management
    AdminSlots.js         Slot management
    AdminAppointments.js  Appointment management
    AdminUsers.js         User management
```

## Authentication Pattern

After login or registration, the backend returns a token and user details. The frontend stores them in `localStorage`.

Authenticated API requests use the token in this format:

```js
headers: {
  Authorization: 'Token ' + token,
}
```

The navigation bar checks the current user with `/auth/me/`. If `user.is_staff === true`, the admin dashboard link is shown. Otherwise, authenticated users see the patient appointment page.

## Notes for Deployment

The deployed React app should use the deployed backend API URL through `REACT_APP_API_BASE_URL`. This keeps the backend URL in one shared place instead of hardcoding it in every component.

The assignment administrator dashboard is implemented in React at `/admin`. It is separate from Django's built-in `/admin/` site.
