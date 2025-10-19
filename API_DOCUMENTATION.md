# Florida Sand & Gravel API Documentation

## Overview

This is a comprehensive Node.js TypeScript API for the Florida Sand & Gravel transportation management system. The API provides endpoints for driver authentication, order management, delivery tracking, and transportation logistics.

## Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://apidev.flsandgravel.com/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### 1. Driver Login
**POST** `/auth/drivers`

Login for drivers to access the system.

**Request Body:**
```json
{
  "email": "driver@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "driver@example.com",
      "name": "John",
      "lastName": "Doe",
      "phoneNumber": "+13055551234",
      "isVerified": true,
      "createdAt": "2023-12-01T00:00:00.000Z",
      "updatedAt": "2023-12-01T00:00:00.000Z"
    }
  }
}
```

#### 2. Driver Registration
**POST** `/auth/signup-drivers`

Register a new driver account.

**Request Body:**
```json
{
  "name": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "3055551234",
  "truckNumber": "FL-001",
  "transportDivisionId": 1,
  "password": "Password123!",
  "repeatPassword": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code."
}
```

#### 3. Get User Profile
**GET** `/auth/me`

Get the current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "driver@example.com",
      "name": "John",
      "lastName": "Doe",
      "phoneNumber": "+13055551234",
      "isVerified": true,
      "createdAt": "2023-12-01T00:00:00.000Z",
      "updatedAt": "2023-12-01T00:00:00.000Z"
    },
    "role": {
      "id": 1,
      "name": "driver"
    },
    "transporDivision": {
      "id": 1,
      "name": "South Florida Division",
      "description": "Covers Miami-Dade, Broward, and Palm Beach counties"
    },
    "driver": {
      "id": 1,
      "truckNumber": "FL-001",
      "available": true,
      "userId": 1,
      "transportDivisionId": 1
    },
    "available": 1
  }
}
```

#### 4. Send Password Recovery Code
**POST** `/auth/password-recovery-code`

Send a password recovery code via SMS.

**Request Body:**
```json
{
  "phoneNumber": "3055551234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password recovery code sent"
}
```

#### 5. Resend Verification Code
**POST** `/auth/verification-codes/resend`

Resend verification code via email or SMS.

**Request Body:**
```json
{
  "email": "driver@example.com"
}
```
or
```json
{
  "phoneNumber": "3055551234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code resent"
}
```

#### 6. Verify Code
**POST** `/auth/verification-codes`

Verify email or password recovery code.

**Request Body:**
```json
{
  "email": "driver@example.com",
  "code": "123456"
}
```
or
```json
{
  "phoneNumber": "3055551234",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code verified successfully"
}
```

#### 7. Configure New Password
**PUT** `/auth/configure-new-password`

Set a new password using verification code.

**Request Body:**
```json
{
  "phoneNumber": "3055551234",
  "code": "123456",
  "password": "NewPassword123!",
  "repeatPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Order Management Endpoints

#### 8. Get Order by ID
**GET** `/orders/:id`

Get detailed information about a specific order.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-2023-001",
    "bolNumber": "BOL-001",
    "rate": 150.00,
    "instructions": "Deliver sand to construction site. Call before arrival.",
    "weight": 25000.0,
    "assignmentDate": "2023-12-15T08:00:00.000Z",
    "status": "ASSIGNED",
    "material": "Sand",
    "startTime": "08:00",
    "endTime": "12:00",
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z",
    "createdBy": {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin",
      "lastName": "User",
      "phoneNumber": "+13055550000"
    },
    "driver": {
      "id": 1,
      "truckNumber": "FL-001",
      "available": true,
      "user": {
        "id": 1,
        "email": "driver@example.com",
        "name": "John",
        "lastName": "Doe",
        "phoneNumber": "+13055551234"
      },
      "transportDivision": {
        "id": 1,
        "name": "South Florida Division",
        "description": "Covers Miami-Dade, Broward, and Palm Beach counties"
      }
    },
    "route": {
      "id": 1,
      "miles": "25",
      "routeType": {
        "id": 1,
        "name": "Local Delivery"
      },
      "pickWorkPlant": {
        "id": 1,
        "name": "Miami Sand & Gravel Plant",
        "address": {
          "id": 1,
          "address": "1234 Brickell Ave",
          "zip": 33131,
          "city": {
            "id": 1,
            "name": "Miami",
            "state": {
              "id": 1,
              "name": "Florida"
            }
          }
        }
      },
      "dropWorkPlant": {
        "id": 2,
        "name": "Fort Lauderdale Processing Center",
        "address": {
          "id": 2,
          "address": "5678 Las Olas Blvd",
          "zip": 33301,
          "city": {
            "id": 2,
            "name": "Fort Lauderdale",
            "state": {
              "id": 1,
              "name": "Florida"
            }
          }
        }
      }
    },
    "orderHasRoutes": [],
    "deliveryConfirmations": []
  }
}
```

#### 9. Get Driver Orders
**GET** `/drivers/orders`

Get orders assigned to the authenticated driver with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `take` (optional): Items per page (default: 10, max: 100)
- `today` (optional): Filter for today's orders (default: true)
- `differentFromToday` (optional): Filter for non-today orders (default: false)

**Example:** `/drivers/orders?page=1&take=10&today=true`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "orderNumber": "ORD-2023-001",
        "bolNumber": "BOL-001",
        "rate": 150.00,
        "instructions": "Deliver sand to construction site. Call before arrival.",
        "weight": 25000.0,
        "assignmentDate": "2023-12-15T08:00:00.000Z",
        "status": "ASSIGNED",
        "material": "Sand",
        "startTime": "08:00",
        "endTime": "12:00",
        "createdAt": "2023-12-01T00:00:00.000Z",
        "updatedAt": "2023-12-01T00:00:00.000Z",
        "createdBy": {
          "id": 1,
          "email": "admin@example.com",
          "name": "Admin",
          "lastName": "User",
          "phoneNumber": "+13055550000"
        },
        "driver": {
          "id": 1,
          "truckNumber": "FL-001",
          "available": true,
          "user": {
            "id": 1,
            "email": "driver@example.com",
            "name": "John",
            "lastName": "Doe",
            "phoneNumber": "+13055551234"
          },
          "transportDivision": {
            "id": 1,
            "name": "South Florida Division",
            "description": "Covers Miami-Dade, Broward, and Palm Beach counties"
          }
        },
        "route": {
          "id": 1,
          "miles": "25",
          "routeType": {
            "id": 1,
            "name": "Local Delivery"
          },
          "pickWorkPlant": {
            "id": 1,
            "name": "Miami Sand & Gravel Plant",
            "address": {
              "id": 1,
              "address": "1234 Brickell Ave",
              "zip": 33131,
              "city": {
                "id": 1,
                "name": "Miami",
                "state": {
                  "id": 1,
                  "name": "Florida"
                }
              }
            }
          },
          "dropWorkPlant": {
            "id": 2,
            "name": "Fort Lauderdale Processing Center",
            "address": {
              "id": 2,
              "address": "5678 Las Olas Blvd",
              "zip": 33301,
              "city": {
                "id": 2,
                "name": "Fort Lauderdale",
                "state": {
                  "id": 1,
                  "name": "Florida"
                }
              }
            }
          }
        },
        "orderHasRoutes": [],
        "deliveryConfirmations": []
      }
    ],
    "pagination": {
      "page": 1,
      "take": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### 10. Create Order
**POST** `/orders`

Create a new order (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "orderNumber": "ORD-2023-004",
  "bolNumber": "BOL-004",
  "rate": 175.00,
  "instructions": "Deliver gravel to construction site. Use back entrance.",
  "weight": 28000.0,
  "driverId": 1,
  "material": "Gravel",
  "date": "2023-12-20",
  "startTime": "09:00",
  "endTime": "13:00",
  "routeId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "orderNumber": "ORD-2023-004",
    "bolNumber": "BOL-004",
    "rate": 175.00,
    "instructions": "Deliver gravel to construction site. Use back entrance.",
    "weight": 28000.0,
    "assignmentDate": "2023-12-20T09:00:00.000Z",
    "status": "ASSIGNED",
    "material": "Gravel",
    "startTime": "09:00",
    "endTime": "13:00",
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z",
    "createdById": 1,
    "driverId": 1,
    "routeId": 1,
    "createdBy": {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin",
      "lastName": "User",
      "phoneNumber": "+13055550000"
    },
    "driver": {
      "id": 1,
      "truckNumber": "FL-001",
      "available": true,
      "user": {
        "id": 1,
        "email": "driver@example.com",
        "name": "John",
        "lastName": "Doe",
        "phoneNumber": "+13055551234"
      },
      "transportDivision": {
        "id": 1,
        "name": "South Florida Division",
        "description": "Covers Miami-Dade, Broward, and Palm Beach counties"
      }
    },
    "route": {
      "id": 1,
      "miles": "25",
      "routeType": {
        "id": 1,
        "name": "Local Delivery"
      },
      "pickWorkPlant": {
        "id": 1,
        "name": "Miami Sand & Gravel Plant",
        "address": {
          "id": 1,
          "address": "1234 Brickell Ave",
          "zip": 33131,
          "city": {
            "id": 1,
            "name": "Miami",
            "state": {
              "id": 1,
              "name": "Florida"
            }
          }
        }
      },
      "dropWorkPlant": {
        "id": 2,
        "name": "Fort Lauderdale Processing Center",
        "address": {
          "id": 2,
          "address": "5678 Las Olas Blvd",
          "zip": 33301,
          "city": {
            "id": 2,
            "name": "Fort Lauderdale",
            "state": {
              "id": 1,
              "name": "Florida"
            }
          }
        }
      }
    }
  },
  "message": "Order created successfully"
}
```

### Delivery Confirmation Endpoints

#### 11. Confirm Delivery
**POST** `/orders/:id/confirm-delivery`

Confirm delivery with image upload.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `file`: Image file (required)
- `notes`: Optional delivery notes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": 1,
    "imagePath": "/uploads/1701234567890_abc12345.jpg",
    "confirmedAt": "2023-12-01T12:00:00.000Z",
    "notes": "Delivery completed successfully"
  },
  "message": "Delivery confirmed successfully"
}
```

#### 12. Get Delivery Confirmation
**GET** `/orders/:id/delivery-confirmation`

Get delivery confirmation details for an order.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": 1,
    "imagePath": "/uploads/1701234567890_abc12345.jpg",
    "confirmedAt": "2023-12-01T12:00:00.000Z",
    "notes": "Delivery completed successfully",
    "order": {
      "id": 1,
      "orderNumber": "ORD-2023-001",
      "status": "COMPLETED",
      "driver": {
        "id": 1,
        "truckNumber": "FL-001",
        "user": {
          "id": 1,
          "email": "driver@example.com",
          "name": "John",
          "lastName": "Doe"
        }
      }
    }
  }
}
```

#### 13. Get Delivery Image
**GET** `/orders/:id/image`

Get the delivery confirmation image file.

**Headers:** `Authorization: Bearer <token>`

**Response:** Image file stream

### User Management Endpoints

#### 14. Set Driver Availability
**POST** `/users/availables`

Set driver availability status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "available": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true
  },
  "message": "Availability set to available"
}
```

### Transport Divisions Endpoints

#### 15. Get Transport Divisions
**GET** `/transport-divisions`

Get all transport divisions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "South Florida Division",
      "description": "Covers Miami-Dade, Broward, and Palm Beach counties"
    },
    {
      "id": 2,
      "name": "Central Florida Division",
      "description": "Covers Orange, Seminole, and Osceola counties"
    },
    {
      "id": 3,
      "name": "West Florida Division",
      "description": "Covers Hillsborough, Pinellas, and Pasco counties"
    }
  ]
}
```

#### 16. Get Transport Division by ID
**GET** `/transport-divisions/:id`

Get specific transport division with drivers.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "South Florida Division",
    "description": "Covers Miami-Dade, Broward, and Palm Beach counties",
    "drivers": [
      {
        "id": 1,
        "truckNumber": "FL-001",
        "available": true,
        "user": {
          "id": 1,
          "email": "driver@example.com",
          "name": "John",
          "lastName": "Doe",
          "phoneNumber": "+13055551234"
        }
      }
    ]
  }
}
```

### Routes and Work Plants Endpoints

#### 17. Get Routes
**GET** `/routes`

Get all available routes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "miles": "25",
      "routeType": {
        "id": 1,
        "name": "Local Delivery"
      },
      "pickWorkPlant": {
        "id": 1,
        "name": "Miami Sand & Gravel Plant",
        "address": {
          "id": 1,
          "address": "1234 Brickell Ave",
          "zip": 33131,
          "city": {
            "id": 1,
            "name": "Miami",
            "state": {
              "id": 1,
              "name": "Florida"
            }
          }
        }
      },
      "dropWorkPlant": {
        "id": 2,
        "name": "Fort Lauderdale Processing Center",
        "address": {
          "id": 2,
          "address": "5678 Las Olas Blvd",
          "zip": 33301,
          "city": {
            "id": 2,
            "name": "Fort Lauderdale",
            "state": {
              "id": 1,
              "name": "Florida"
            }
          }
        }
      }
    }
  ]
}
```

#### 18. Get Work Plants
**GET** `/work-plants`

Get all work plants.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Miami Sand & Gravel Plant",
      "address": {
        "id": 1,
        "address": "1234 Brickell Ave",
        "zip": 33131,
        "city": {
          "id": 1,
          "name": "Miami",
          "state": {
            "id": 1,
            "name": "Florida"
          }
        }
      }
    }
  ]
}
```

#### 19. Get Route Types
**GET** `/route-types`

Get all route types.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Local Delivery"
    },
    {
      "id": 2,
      "name": "Regional Transport"
    },
    {
      "id": 3,
      "name": "Long Haul"
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Response**: 429 status code when limit exceeded

## File Upload

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

### File Size Limits
- Maximum file size: 10MB
- Files are stored in the `uploads/` directory
- Filenames are automatically generated with timestamps and UUIDs

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Prevents abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **File Upload Security**: Type and size validation

## Database Schema

The API uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: Driver accounts with authentication
- **Drivers**: Driver profiles linked to users
- **Orders**: Transportation orders with status tracking
- **Routes**: Pickup and delivery routes
- **Work Plants**: Physical locations for pickup/delivery
- **Transport Divisions**: Organizational units
- **Delivery Confirmations**: Proof of delivery with images

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**:
   ```bash
   npm run generate
   npm run migrate
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Production Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm start
   ```

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Testing

You can test the API using tools like:
- **Postman**: Import the API collection
- **curl**: Command-line testing
- **Insomnia**: REST client
- **Thunder Client**: VS Code extension

## Support

For API support and questions, contact the development team or refer to the internal documentation.
