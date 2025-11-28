# CRM Backend - Python (Flask)

A Python Flask backend for the CRM application, providing the same API endpoints as the Node.js/Express version.

## Features

- User authentication (register, login, get current user)
- Form management (create, read, delete)
- Admin functionality (approve/reject forms, view all forms, statistics)
- JWT-based authentication
- Role-based access control (User/Admin)
- MongoDB integration with PyMongo

## Tech Stack

- **Flask** - Web framework
- **PyMongo** - MongoDB driver
- **PyJWT** - JWT token handling
- **bcrypt** - Password hashing
- **flask-cors** - CORS support
- **python-dotenv** - Environment variable management

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- MongoDB (local or MongoDB Atlas)
- pip (Python package manager)

### 1. Create Virtual Environment (Recommended)

```bash
cd backend-python
python3 -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the `backend-python` directory:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_secure_jwt_secret_key_change_this_in_production
FLASK_ENV=development
```

### 4. Run the Server

```bash
python run.py
```

The server will run on `http://localhost:5001`

## API Endpoints

All endpoints match the Node.js version:

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

## Project Structure

```
backend-python/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── config.py            # Configuration
│   ├── config/
│   │   ├── __init__.py
│   │   └── db.py           # MongoDB connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py         # User model
│   │   └── form.py         # Form model
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py         # JWT authentication & authorization
│   └── routes/
│       ├── __init__.py
│       ├── auth.py         # Authentication routes
│       ├── forms.py        # Form CRUD routes
│       └── admin.py        # Admin-only routes
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md
```

## Usage with React Frontend

The React frontend can work with either backend. To use the Python backend:

1. Make sure the frontend `.env` or `api.js` points to the correct port:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
   ```

2. Start the Python backend:
   ```bash
   cd backend-python
   python run.py
   ```

3. Start the React frontend (in a separate terminal):
   ```bash
   cd frontend
   npm start
   ```

## Development

### Running in Development Mode

The server runs in debug mode when `FLASK_ENV=development`:

```bash
FLASK_ENV=development python run.py
```

### Database

The application uses MongoDB. Make sure MongoDB is running:

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Update `MONGODB_URI` in `.env` with your Atlas connection string

## Differences from Node.js Version

- Uses Flask instead of Express
- Uses PyMongo instead of Mongoose
- Uses PyJWT instead of jsonwebtoken
- Uses bcrypt instead of bcryptjs
- Uses python-dotenv instead of dotenv
- Uses Flask-CORS instead of cors middleware

## Notes

- The API responses are identical to the Node.js version
- All authentication and authorization logic is preserved
- The same MongoDB database can be used (same schema)
- JWT tokens are compatible between versions

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- Verify network access if using MongoDB Atlas

### Port Already in Use
- Change `PORT` in `.env` file

### Import Errors
- Make sure you're in the virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

## License

ISC License

