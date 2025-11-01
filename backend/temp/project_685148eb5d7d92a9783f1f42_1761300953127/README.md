# Todo App

This is an auto-generated Node.js backend project created using the No-Code Platform.

## Features

- RESTful API architecture
- MongoDB database integration
- Express.js framework
- JWT authentication support
- Input validation
- Security headers (Helmet)
- Rate limiting
- CORS enabled

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Installation

1. Clone or download this project

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

4. Make sure MongoDB is running

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:8001` (or the port specified in your .env file)

## Project Structure

```
├── models/          # Database models (Mongoose schemas)
├── controllers/     # Request handlers
├── routes/          # API route definitions
├── app.js          # Main application file
├── package.json    # Project dependencies
├── .env            # Environment variables (not committed)
└── .gitignore      # Git ignore rules
```

## API Endpoints

### Health Check
- **GET** `/health` - Check if server is running

### API Routes
Check individual route files in the `routes/` directory for available endpoints.

## Environment Variables

Key environment variables used in this project:

- `DATABASE_URL`: MongoDB connection string
- `PORT`: Server port (default: 8001)
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment mode (development/production)

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting to prevent abuse
- Input validation using express-validator
- JWT-based authentication

## Database

This project uses MongoDB with Mongoose ODM. Make sure your MongoDB instance is running and the connection string in `.env` is correct.

## Contributing

This is an auto-generated project. Modify as needed for your requirements.

## License

MIT

## Support

For issues or questions, please contact the development team.
