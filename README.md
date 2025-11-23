# CRM Application

A full-stack CRM (Customer Relationship Management) application built with the MERN stack featuring role-based access control for Users and Admins.

## Features

### User Features
- Register and login with email/password authentication
- Create new form entries for approval
- View submission history (approved, rejected, pending)
- Filter entries by status
- Delete pending entries

### Admin Features
- All user features
- View all pending form submissions
- Approve or reject form submissions with comments
- View all forms in the system
- Dashboard with statistics (total, pending, approved, rejected)

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## Project Structure

```
crm/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication & authorization
│   ├── models/
│   │   ├── User.js            # User model
│   │   └── Form.js            # Form submission model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── forms.js           # Form CRUD routes
│   │   └── admin.js           # Admin-only routes
│   ├── .env                   # Environment variables
│   ├── server.js              # Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── NewEntry.js
│   │   │   ├── History.js
│   │   │   ├── AdminPending.js
│   │   │   └── AdminAllForms.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crm
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (or edit the existing one)
# Add the following variables:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will run on `http://localhost:3000`

### 4. MongoDB Setup

**Option 1: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service: `mongod`
- The app will connect to `mongodb://localhost:27017/crm_db`

**Option 2: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get the connection string
- Update `MONGODB_URI` in `backend/.env` with your Atlas connection string

## Usage Guide

### 1. Register an Account
- Navigate to `http://localhost:3000`
- Click "Register here"
- Fill in your details
- Select role: **User** or **Admin**

### 2. User Workflow
1. **Login** with your credentials
2. **Dashboard** - View navigation options
3. **Create New Entry** - Submit a form for approval
   - Enter title, description, category, and priority
   - Submit for admin approval
4. **View My Entries** - See all your submissions
   - Filter by status (All, Pending, Approved, Rejected)
   - Delete pending entries if needed

### 3. Admin Workflow
1. **Login** with admin credentials
2. **Dashboard** - Access admin features
3. **Pending Approvals** - Review submitted forms
   - Add review comments
   - Approve or reject forms
4. **All Forms** - View all submissions
   - See statistics dashboard
   - Filter by status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Forms
- `POST /api/forms` - Create new form (Protected)
- `GET /api/forms` - Get user's forms (Protected)
- `GET /api/forms/:id` - Get single form (Protected)
- `DELETE /api/forms/:id` - Delete pending form (Protected)

### Admin
- `GET /api/admin/forms` - Get all forms (Admin only)
- `GET /api/admin/forms/pending` - Get pending forms (Admin only)
- `PUT /api/admin/forms/:id/approve` - Approve form (Admin only)
- `PUT /api/admin/forms/:id/reject` - Reject form (Admin only)
- `GET /api/admin/stats` - Get statistics (Admin only)

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### Frontend (Optional)
Create `frontend/.env` if you want to customize:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Default Test Accounts

After setting up, you can create test accounts:

**Admin Account:**
- Register with role: Admin
- Email: admin@example.com
- Password: admin123

**User Account:**
- Register with role: User
- Email: user@example.com
- Password: user123

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes (frontend & backend)
- Role-based access control (RBAC)
- Input validation with express-validator
- CORS enabled for cross-origin requests

## Development Scripts

### Backend
```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

### Frontend
```bash
npm start       # Start development server
npm run build   # Build for production
npm test        # Run tests
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- Verify network access if using MongoDB Atlas

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Create `.env` in frontend with `PORT=3001`

### CORS Issues
- Ensure backend CORS is configured correctly
- Check proxy setting in `frontend/package.json`

## Future Enhancements

- Email notifications for form status updates
- File upload support for form attachments
- Advanced search and filtering
- Export data to CSV/PDF
- User profile management
- Activity logs and audit trail
- Real-time notifications with WebSockets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue in the GitHub repository.

---

Built with the MERN Stack
