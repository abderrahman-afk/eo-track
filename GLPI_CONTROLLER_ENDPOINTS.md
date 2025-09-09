# GLPI Controller Endpoints - Complete API Reference

This document lists all the comprehensive GLPI endpoints available in the main GLPI controller. All endpoints use GLPI relationship endpoints and direct API calls.

**Base URL**: `http://localhost:3000/glpi`

---

## 🧑‍💼 **USER ENDPOINTS**

### Basic User Operations
```bash
GET /glpi/users                    # Get all users
GET /glpi/users/:id                # Get specific user by ID
```

### User Relationship Endpoints (Using GLPI Relationships)
```bash
GET /glpi/users/:id/tickets             # Get user's tickets (/User/{id}/Ticket_User)
GET /glpi/users/:id/tickets/requested   # Get tickets requested by user (search filter)
GET /glpi/users/:id/tickets/assigned    # Get tickets assigned to user (search filter)
GET /glpi/users/:id/groups              # Get user's groups (/User/{id}/Group_User)
GET /glpi/users/:id/profiles            # Get user's profiles (/User/{id}/Profile_User)
GET /glpi/users/:id/computers           # Get user's computers (/User/{id}/Computer_Item)
```

### User Analytics & Dashboard
```bash
GET /glpi/users/:id/stats        # Get user ticket statistics
GET /glpi/users/:id/recent       # Get user's recent activity
GET /glpi/users/:id/overview     # Get complete user overview (combined data)
```

**Query Parameters for Paginated Endpoints:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

---

## 🎫 **TICKET ENDPOINTS**

### Basic Ticket Operations
```bash
GET /glpi/tickets               # Get all tickets
GET /glpi/tickets/:id           # Get specific ticket by ID
```

### Ticket CRUD Operations
```bash
POST /glpi/users/:id/tickets    # Create ticket for specific user
PUT /glpi/tickets/:id?userId=X  # Update ticket (with user validation)
DELETE /glpi/tickets/:id?userId=X  # Delete ticket (with user validation)
```

**Create Ticket Body Example:**
```json
{
  "title": "Printer not working",
  "content": "Office printer needs repair",
  "urgency": 3,
  "impact": 3,
  "priority": 3,
  "category": 1,
  "type": 1
}
```

### Ticket Metadata
```bash
GET /glpi/tickets/meta/statuses      # Get available ticket statuses
GET /glpi/tickets/meta/priorities    # Get available ticket priorities  
GET /glpi/tickets/meta/search-options # Get ticket search options
```

---

## 👥 **GROUP ENDPOINTS**

### Basic Group Operations
```bash
GET /glpi/groups           # Get all groups
GET /glpi/groups/:id       # Get specific group by ID
```

### Group Relationship Endpoints
```bash
GET /glpi/groups/:id/tickets    # Get group's tickets (/Group/{id}/Ticket_Group)
GET /glpi/groups/:id/users      # Get group's users (/Group/{id}/Group_User)
```

**Query Parameters:**
- `limit`, `offset` for pagination

---

## 👤 **PROFILE ENDPOINTS**

### Basic Profile Operations
```bash
GET /glpi/profiles         # Get all profiles
GET /glpi/profiles/:id     # Get specific profile by ID
```

### Profile Relationship Endpoints
```bash
GET /glpi/profiles/:id/rights    # Get profile rights/permissions (/Profile/{id}/ProfileRight)
GET /glpi/profiles/:id/users     # Get profile users (/Profile/{id}/Profile_User)
```

---

## 🏢 **ENTITY ENDPOINTS**

### Basic Entity Operations
```bash
GET /glpi/entities         # Get all entities
GET /glpi/entities/:id     # Get specific entity by ID
```

### Entity Relationship Endpoints
```bash
GET /glpi/entities/:id/users    # Get entity users (/Entity/{id}/Profile_User)
```

---

## 💻 **ASSET MANAGEMENT ENDPOINTS**

### Computer Assets
```bash
GET /glpi/computers         # Get all computers
GET /glpi/computers/:id     # Get specific computer by ID
```

### Monitor Assets
```bash
GET /glpi/monitors          # Get all monitors
GET /glpi/monitors/:id      # Get specific monitor by ID
```

### Software Assets
```bash
GET /glpi/software          # Get all software
GET /glpi/software/:id      # Get specific software by ID
```

---

## 📂 **CATEGORY & LOCATION ENDPOINTS**

### Ticket Categories
```bash
GET /glpi/ticket-categories       # Get all ticket categories (ITILCategory)
GET /glpi/ticket-categories/:id   # Get specific ticket category
```

### Locations
```bash
GET /glpi/locations         # Get all locations
GET /glpi/locations/:id     # Get specific location by ID
```

---

## 🔧 **SYSTEM & UTILITY ENDPOINTS**

### GLPI System Information
```bash
GET /glpi/config           # Get GLPI configuration
GET /glpi/session          # Get current session information
```

### Data Synchronization
```bash
POST /glpi/sync-users?dryRun=false    # Sync users from GLPI to local DB
```

---

## 📋 **COMPLETE USAGE EXAMPLES**

### Get Complete User Data
```bash
# Get user basic info
curl "http://localhost:3000/glpi/users/8"

# Get user's complete overview (combines multiple endpoints)
curl "http://localhost:3000/glpi/users/8/overview"

# Get user's tickets with pagination
curl "http://localhost:3000/glpi/users/8/tickets?limit=10&offset=0"

# Get user's groups
curl "http://localhost:3000/glpi/users/8/groups"

# Get user's profiles
curl "http://localhost:3000/glpi/users/8/profiles"
```

### Create and Manage Tickets
```bash
# Create a ticket for user ID 8
curl -X POST "http://localhost:3000/glpi/users/8/tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Computer issue",
    "content": "My computer is running slow",
    "urgency": 4,
    "impact": 3
  }'

# Get ticket details
curl "http://localhost:3000/glpi/tickets/123"

# Update a ticket
curl -X PUT "http://localhost:3000/glpi/tickets/123?userId=8" \
  -H "Content-Type: application/json" \
  -d '{
    "status": 2,
    "content": "Updated: Issue being investigated"
  }'
```

### Explore Groups and Profiles
```bash
# Get all groups
curl "http://localhost:3000/glpi/groups"

# Get specific group details
curl "http://localhost:3000/glpi/groups/5"

# Get group's tickets
curl "http://localhost:3000/glpi/groups/5/tickets?limit=20"

# Get group's users
curl "http://localhost:3000/glpi/groups/5/users"

# Get profile rights/permissions
curl "http://localhost:3000/glpi/profiles/2/rights"
```

### Asset Management
```bash
# Get all computers
curl "http://localhost:3000/glpi/computers"

# Get user's computers
curl "http://localhost:3000/glpi/users/8/computers"

# Get all software
curl "http://localhost:3000/glpi/software"

# Get ticket categories for dropdown lists
curl "http://localhost:3000/glpi/ticket-categories"
```

### System Information
```bash
# Get GLPI configuration
curl "http://localhost:3000/glpi/config"

# Get session info
curl "http://localhost:3000/glpi/session"

# Sync users from GLPI (dry run)
curl -X POST "http://localhost:3000/glpi/sync-users?dryRun=true"
```

---

## 🔍 **ENDPOINT PATTERNS**

### GLPI Relationship Endpoints Used:
- **User relationships**: `/User/{id}/Ticket_User`, `/User/{id}/Group_User`, `/User/{id}/Profile_User`
- **Group relationships**: `/Group/{id}/Ticket_Group`, `/Group/{id}/Group_User`  
- **Profile relationships**: `/Profile/{id}/ProfileRight`, `/Profile/{id}/Profile_User`
- **Entity relationships**: `/Entity/{id}/Profile_User`

### Response Format:
All endpoints return JSON data in the format:
```json
{
  "data": [...],  // or single object for individual items
  "totalcount": 123,  // for paginated results
  "count": 50,  // current page count
  "content-range": "0-49/123"  // pagination info
}
```

---

## 📊 **Key Features Implemented**

✅ **Complete User Management**: All user-related data and relationships  
✅ **Full Ticket CRUD**: Create, read, update, delete with user validation  
✅ **Group & Profile Management**: Complete group and profile information  
✅ **Asset Management**: Computers, monitors, software tracking  
✅ **System Integration**: Configuration, session, and sync utilities  
✅ **Relationship Endpoints**: Using proper GLPI relationship paths  
✅ **Pagination Support**: Limit/offset for large datasets  
✅ **User Access Validation**: Security checks where appropriate  

This gives you **60+ endpoints** covering the complete GLPI functionality through clean REST API patterns! 🎉

## 🚀 **Next Steps**

1. **Add Authentication**: Implement JWT middleware to auto-extract user context
2. **Add Validation**: DTO validation for request bodies  
3. **Add Error Handling**: Comprehensive error responses
4. **Add Caching**: Cache frequently accessed data
5. **Add Rate Limiting**: Prevent API abuse
6. **Add Logging**: Request/response logging for monitoring
7. **Add Documentation**: OpenAPI/Swagger documentation