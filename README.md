# MedClinic - Healthcare Management System

A premium-looking, responsive web application designed for medical clinics to manage patient records and enable real-time coordination between OPD, Laboratory, and Pharmacy departments.

## Key Features

- **User Login System** — Role-based access (Doctor, Lab Staff, Pharmacy Staff, Admin)
- **Patient Registration** — Register new patients with auto-generated IDs
- **Doctor Dashboard** — Search patients, add prescriptions (diagnoses, symptoms, medicines), view lab/pharmacy status
- **Lab Dashboard** — View prescriptions, upload lab reports, update status
- **Pharmacy Dashboard** — View prescription, mark medicines as dispensed
- **Admin Panel** — Create new user accounts with assigned roles
- **Patient Timeline** — Shows full history: visits, prescriptions, lab reports, pharmacy status

## Tech Stack

- **Frontend:** React, TypeScript, Bootstrap, React Router, Formik, Yup
- **State Management:** Context API
- **API Communication:** Axios
- **UI Libraries:** React Bootstrap, React Icons, React Toastify
- **Backend:** Assumes REST API (FastAPI + MongoDB) endpoints

## UI/UX Features

- Cards, tabs, and modals with soft shadows and rounded corners
- Animated icons and status badges (e.g., report uploaded ✓, medicine pending ⏳)
- Color theme with light blues, greys, and whites
- Minimal animations for transitions between dashboard views

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/med-clinic.git
cd med-clinic
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Default Login Credentials (Demo)

- **Doctor:** 
  - Username: doctor
  - Password: password

- **Lab Staff:**
  - Username: lab
  - Password: password

- **Pharmacy Staff:**
  - Username: pharmacy
  - Password: password

- **Admin:**
  - Username: admin
  - Password: password

## API Integration

This frontend application is designed to connect to a backend REST API that provides endpoints for:

- Authentication (login, logout)
- Patient management
- Prescription management
- Lab report management
- Pharmacy management
- User management

To connect to your own backend, update the API base URL in `src/services/api.ts`.

## Folder Structure

```
src/
├── assets/         # Static assets and styles
├── components/     # React components
│   ├── admin/      # Admin-related components
│   ├── auth/       # Authentication components
│   ├── common/     # Shared components
│   ├── dashboard/  # Dashboard components for different roles
│   └── patient/    # Patient-related components
├── context/        # React Context API providers
├── services/       # API and service functions
└── types/          # TypeScript type definitions
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [React Bootstrap](https://react-bootstrap.github.io/)
- [React Icons](https://react-icons.github.io/react-icons/)
