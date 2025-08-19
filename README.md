# Leave Management System API

A comprehensive Leave Management System API built with Node.js, MongoDB, and Redis. This system manages employee leave requests with proper validation, caching, and role-based access control.

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Assumptions](#assumptions)
- [Edge Cases Handled](#edge-cases-handled)
- [Performance Optimizations](#performance-optimizations)
- [Potential Improvements](#potential-improvements)
- [Deployment](#deployment)

## ✨ Features

### Core Functionality

- **Employee Management**: Add, view employees with department and joining date tracking
- **Leave Application**: Apply for sick leave (priority) and casual leave
- **Leave Approval**: HR can approve/reject leave requests with comments
- **Balance Tracking**: Real-time leave balance calculation and tracking
- **Role-based Access**: HR and Employee roles with appropriate permissions

### Technical Features

- **Redis Caching**: Frequently accessed data cached for better performance
- **MongoDB Indexing**: Optimized database queries with proper indexing
- **Input Validation**: Comprehensive validation using Joi
- **Rate Limiting**: API protection against abuse
- **Logging**: Structured logging with Winston
- **Docker Support**: Complete containerization with docker-compose
- **Error Handling**: Graceful error handling with proper HTTP status codes

## 📁 Project Structure

```
leave-management-system/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection configuration
│   │   └── redis.js             # Redis connection and client setup
│   ├── middleware/
│   │   ├── validation.js        # Joi validation schemas and middleware
│   │   └── roleCheck.js         # Role-based access control middleware
│   ├── models/
│   │   ├── Employee.js          # Employee schema and model
│   │   ├── Leave.js             # Leave request schema and model
│   │   └── LeaveBalance.js      # Leave balance tracking schema
│   ├── routes/
│   │   ├── employees.js         # Employee management routes
│   │   └── leaves.js            # Leave management routes
│   ├── services/
│   │   ├── employeeService.js   # Employee business logic
│   │   └── leaveService.js      # Leave management business logic
│   ├── utils/
│   │   ├── cache.js             # Redis caching utilities
│   │   ├── constants.js         # Application constants and enums
│   │   └── logger.js            # Winston logging configuration
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server startup and initialization
├── logs/                        # Log files directory
│   ├── combined.log             # All logs
│   └── error.log                # Error logs only
├── docker-compose.yml           # Development Docker configuration
├── docker-compose.prod.yml      # Production Docker configuration
├── Dockerfile                   # Development Docker image
├── Dockerfile.prod              # Production-optimized Docker image
├── package.json                 # Node.js dependencies and scripts
├── package-lock.json            # Dependency lock file
├── .env.example                 # Environment variables template
├── .env                         # Environment variables (git-ignored)
├── .gitignore                   # Git ignore rules
├── .dockerignore                # Docker ignore rules
├── README.md                    # Project documentation
├── API_EXAMPLES.md              # API usage examples
└── DEPLOYMENT.md                # Deployment guide
```

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client/API    │────│   Node.js API   │────│    MongoDB      │
│   Consumer      │    │   (Express.js)  │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              │
                       ┌─────────────────┐
                       │      Redis      │
                       │    (Cache)      │
                       └─────────────────┘
```

### Directory Structure Explanation

#### `/src` - Source Code

- **`/config`**: Database and external service configurations
- **`/middleware`**: Express middleware for validation, authentication, etc.
- **`/models`**: Mongoose schemas and database models
- **`/routes`**: API route definitions and handlers
- **`/services`**: Business logic layer (separated from routes)
- **`/utils`**: Utility functions, constants, and helper modules

#### Root Level Files

- **Docker files**: Container configuration for development and production
- **Package files**: Node.js project configuration and dependencies
- **Environment files**: Configuration templates and actual values
- **Documentation**: README, API examples, and deployment guides

### Components Architecture

#### 1. API Layer (`/routes`)

- **Employee Routes** (`/api/employees`): Employee CRUD operations
- **Leave Routes** (`/api/leaves`): Leave application, approval, and tracking
- **Health Check** (`/health`): System health monitoring

#### 2. Business Logic Layer (`/services`)

- **Employee Service**: Employee management logic, validation
- **Leave Service**: Leave processing, balance calculation, overlap detection

#### 3. Data Layer (`/models`)

- **Employee Model**: Employee information and role management
- **Leave Model**: Leave request tracking with status management
- **LeaveBalance Model**: Annual leave quota and usage tracking

#### 4. Middleware Layer (`/middleware`)

- **Validation**: Request data validation using Joi schemas
- **Role Check**: Role-based access control
- **Rate Limiting**: API abuse prevention
- **Error Handling**: Centralized error management

#### 5. Infrastructure Layer (`/config`, `/utils`)

- **Database Config**: MongoDB connection with connection pooling
- **Cache Config**: Redis setup for performance optimization
- **Logging**: Winston-based structured logging
- **Constants**: Application-wide constants and enums

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher
- **Redis**: v7.0 or higher
- **Docker & Docker Compose**: For containerized setup

## 🚀 Installation & Setup

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd leave-management-system
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   ```

3. **Build and run with Docker Compose**

   ```bash
   docker-compose up --build -d
   ```

4. **Verify the setup**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Local Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   # Create .env file with:
   PORT=9005
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/leave_management
   REDIS_URL=redis://localhost:6379
   LOG_LEVEL=info
   CACHE_TTL=3600
   ```

3. **Start MongoDB and Redis services**

4. **Run the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:9005/api/v1
```

### Authentication

Currently uses role-based access through request body.

### Endpoints

#### Welcome route or

#### 1. Create Employee

**POST** `/employees`

```json
{
  "hrId": "64f1234567890abcdef12345", // person who is creating
  "hrRole": "hr", // role of person creating this
  "name": "arpit",
  "email": "abhi@dev101.com",
  "department": "Engineering",
  "joiningDate": "2025-08-15",
  "role": "employee" // type of role for which leave is being created
}
```

**Response:**

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "name": "arpit",
    "email": "abhi@dev101.com",
    "department": "Engineering",
    "joiningDate": "2025-08-15T00:00:00.000Z",
    "role": "employee",
    "isActive": true,
    "_id": "68a4aa1ac49e18f217515d25",
    "createdAt": "2025-08-19T16:45:14.014Z",
    "updatedAt": "2025-08-19T16:45:14.014Z",
    "__v": 0
  }
}
```

#### 2. Get All Employees (HR Only)

**GET** `/employees`

Request Body:

```json
{
  "hrRole": "hr",
  "hrId": "64f1234567890abcdef12345"
}
```

#### 3. Apply for Leave (open request as employees can request for leave)

**POST** `/leaves/apply`

```json
{
  "employeeId": "68a4aa1ac49e18f217515d25",
  "type": "sick",
  "startDate": "2025-08-25",
  "endDate": "2025-08-26",
  "reason": "Medical checkup",
  "role": "employee"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "employeeId": "68a4aa1ac49e18f217515d25",
    "type": "sick",
    "startDate": "2025-08-24T18:30:00.000Z",
    "endDate": "2025-08-25T18:30:00.000Z",
    "totalDays": 2,
    "reason": "Medical checkup",
    "status": "pending",
    "_id": "68a4ab40a0baa5026c6ba9cc",
    "createdAt": "2025-08-19T16:50:08.293Z",
    "updatedAt": "2025-08-19T16:50:08.293Z",
    "__v": 0
  }
}
```

#### 4. Process Leave (HR Only)

**PATCH** `/leaves/:id/process` // id is the id of apply leave

```json
{
  "action": "approve",
  "hrId": "68a4955e01042ef38740b998",
  "comments": "Approved for medical reasons",
  "hrRole": "hr"
}
```

#### 5. Get Leave Balance

**GET** `/leaves/balance/:employeeId`

**Response:**

```json
{
  "success": true,
  "data": {
    "casualLeave": {
      "total": 10,
      "used": 0,
      "remaining": 10
    },
    "sickLeave": {
      "total": 12,
      "used": 2,
      "remaining": 10
    }
  }
}
```

#### 6. Get Employee Leaves

**GET** `/leaves/employee/:employeeId`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "68a4ab40a0baa5026c6ba9cc",
      "employeeId": "68a4aa1ac49e18f217515d25",
      "type": "sick",
      "startDate": "2025-08-24T18:30:00.000Z",
      "endDate": "2025-08-25T18:30:00.000Z",
      "totalDays": 2,
      "reason": "Medical checkup",
      "status": "approved",
      "createdAt": "2025-08-19T16:50:08.293Z",
      "updatedAt": "2025-08-19T16:54:58.527Z",
      "__v": 0,
      "approvedAt": "2025-08-19T16:54:58.525Z",
      "approvedBy": {
        "_id": "68a4955e01042ef38740b998",
        "name": "John Doe",
        "email": "john.doe@company.com"
      },
      "comments": "Approved for medical reasons"
    }
  ]
}
```

#### 7. Health Check

**GET** `/health`

## 🗄️ Database Schema

### Employee Collection

```javascript
{
  name: String (required),
  email: String (required, unique),
  department: String (required),
  joiningDate: Date (required),
  role: String (enum: ['hr', 'employee']),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Leave Collection

```javascript
{
  employeeId: ObjectId (ref: Employee),
  type: String (enum: ['casual', 'sick']),
  startDate: Date (required),
  endDate: Date (required),
  totalDays: Number (required),
  reason: String (required),
  status: String (enum: ['pending', 'approved', 'rejected']),
  approvedBy: ObjectId (ref: Employee),
  approvedAt: Date,
  comments: String,
  timestamps: true
}
```

### LeaveBalance Collection

```javascript
{
  employeeId: ObjectId (ref: Employee, unique),
  year: Number (required),
  casualLeaveBalance: Number (default: 10),
  sickLeaveBalance: Number (default: 12),
  casualLeaveUsed: Number (default: 0),
  sickLeaveUsed: Number (default: 0),
  timestamps: true
}
```

## 🔧 Assumptions

### Leave Policy

- **Annual Leave Quota**: 22 days total (10 casual + 12 sick)
- **Leave Priority**: Sick leave has higher priority than casual leave
- **Working Days**: Monday to Friday (weekends excluded from leave calculation)
- **Leave Year**: Calendar year (January to December)

### Business Rules

- Employees can only apply for future dates
- Cannot apply for leave before joining date
- No overlapping leave requests allowed
- Leave balance is calculated per calendar year
- Only HR can approve/reject leave requests
- Employees can view their own leave history and balance

### Technical Assumptions

- MongoDB and Redis are available and properly configured
- No authentication system (role passed in request body)
- Rate limiting: 100 requests per 15-minute window
- Cache TTL: 30 minutes for employee data, 10 minutes for lists

## 🛡️ Edge Cases Handled

### Date Validation

- **Past dates**: Cannot apply for leave in the past
- **Invalid date range**: Start date cannot be after end date
- **Pre-joining dates**: Cannot apply for leave before joining date
- **Weekend-only leaves**: System calculates only working days

### Leave Management

- **Overlapping requests**: Prevents multiple leave requests for same dates
- **Insufficient balance**: Validates available leave balance before approval
- **Duplicate processing**: Prevents re-processing of already approved/rejected leaves
- **Non-existent employee**: Validates employee existence before processing

### System Level

- **Database connection failure**: Graceful error handling
- **Redis unavailability**: API continues to work without cache
- **Invalid ObjectId**: Proper validation for MongoDB ObjectIds
- **Concurrent requests**: Database-level constraints prevent race conditions

## ⚡ Performance Optimizations

### Database Indexing

```javascript
// Employee collection
{ email: 1 }                    // Unique employee lookup
{ department: 1 }               // Department-wise queries

// Leave collection
{ employeeId: 1, startDate: 1, endDate: 1 }  // Leave overlap checks
{ status: 1 }                   // Status-based filtering
{ type: 1 }                     // Leave type filtering

// LeaveBalance collection
{ employeeId: 1, year: 1 }      // Unique constraint and fast lookup
```

### Redis Caching Strategy

- **Employee data**: 30-minute TTL (rarely changes)
- **Employee lists**: 10-minute TTL (updated when new employees added)
- **Leave balances**: 30-minute TTL (updated after leave approval)
- **Leave lists**: 10-minute TTL (updated frequently)

### Application Level

- Redis connection reuse
- Efficient date calculations with Moment.js
- Pagination ready (can be added for large datasets)

## 🚀 Potential Improvements

### Future Improvement (2.0)

Key Anti-Misuse Features Added:

1. Pro-Rated Leave Calculation

New employees get leave proportional to their remaining time in the year
Formula: (Remaining Working Days / Total Working Days) × Annual Quota
Example: Someone joining July 1st gets ~5 casual + 6 sick leaves (50% of year remaining)

2. New Joiner Restrictions

Cannot apply for more than 5 days within first 90 days of joining
Prevents immediate long leaves after joining

3. Enhanced Leave Balance Tracking

Tracks original quota vs pro-rated quota
Shows calculation details in API responses
Maintains audit trail of pro-ration decisions

### Short-term Enhancements

1. **Authentication & Authorization**

   - JWT-based authentication
   - Role-based middleware
   - Session management

2. **Enhanced Validation**

   - Holiday calendar integration
   - Department-specific leave policies
   - Minimum advance notice requirements

3. **Notification System**
   - Email notifications for leave status updates
   - Reminder notifications for pending approvals
   - Calendar integration

### Medium-term Features

4. **Advanced Leave Management**

   - Half-day leave support
   - Compensatory leave management
   - Leave carry-forward policies
   - Emergency leave categories

5. **Reporting & Analytics**

   - Leave utilization reports
   - Department-wise analytics
   - Trend analysis
   - Export functionality (PDF/Excel)

6. **API Enhancements**
   - Bulk operations
   - Advanced filtering and search

### Long-term Scalability

7. **Architecture Improvements**

   - Microservices architecture
   - Event-driven architecture
   - Database sharding for large organizations
