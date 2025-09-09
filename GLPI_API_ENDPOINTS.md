# GLPI API Endpoints Documentation

This document lists all available endpoints for user-specific GLPI functionality. All endpoints are filtered by `glpiUserId` to ensure users only see their own data.

## Authentication & Configuration

Currently using superadmin GLPI credentials (glpi/glpi) with single session for all requests. Each endpoint requires `glpiUserId` parameter to filter data by user.

**✨ Updated to use proper GLPI relationship endpoints:**
- User tickets: `/User/{id}/Ticket_User`
- User groups: `/User/{id}/Group_User`  
- User profiles: `/User/{id}/Profile_User`
- Group tickets: `/Group/{id}/Ticket_Group`
- Group users: `/Group/{id}/Group_User`

## Base URL
All endpoints are prefixed with your application's base URL, e.g., `http://localhost:3000`

---

## 🎫 Ticket Management

### Get User Tickets
**GET** `/tickets?glpiUserId={glpiUserId}&type={type}&limit={limit}&offset={offset}`

**Description**: Get tickets for a specific user using GLPI relationship endpoint `/User/{id}/Ticket_User`
**Parameters**:
- `glpiUserId` (required): User's GLPI ID
- `type` (optional): Filter type - `all`, `requested`, `assigned` (default: `all`)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example**:
```bash
# Get all tickets for user with GLPI ID 123 (uses /User/123/Ticket_User)
GET /tickets?glpiUserId=123

# Get only tickets requested by user (uses search filters)
GET /tickets?glpiUserId=123&type=requested&limit=10

# Get tickets assigned to user with pagination (uses search filters)
GET /tickets?glpiUserId=123&type=assigned&limit=20&offset=40
```

### Get Specific Ticket
**GET** `/tickets/{ticketId}?glpiUserId={glpiUserId}`

**Description**: Get details of a specific ticket (with access validation)
**Parameters**:
- `ticketId` (path): Ticket ID
- `glpiUserId` (query): User's GLPI ID for access validation

**Example**:
```bash
GET /tickets/456?glpiUserId=123
```

### Create New Ticket
**POST** `/tickets?glpiUserId={glpiUserId}`

**Description**: Create a new ticket for the user
**Parameters**:
- `glpiUserId` (query): User's GLPI ID

**Body**:
```json
{
  "title": "Ticket title",
  "content": "Ticket description",
  "urgency": 3,      // Optional: 1-6 scale
  "impact": 3,       // Optional: 1-6 scale  
  "priority": 3,     // Optional: 1-6 scale
  "category": 1,     // Optional: Category ID
  "type": 1          // Optional: 1=Incident, 2=Request
}
```

**Example**:
```bash
POST /tickets?glpiUserId=123
Content-Type: application/json

{
  "title": "Printer not working",
  "content": "The office printer is not printing properly",
  "urgency": 4,
  "impact": 3
}
```

### Update Ticket
**PUT** `/tickets/{ticketId}?glpiUserId={glpiUserId}`

**Description**: Update an existing ticket (with access validation)
**Body**:
```json
{
  "title": "Updated title",
  "content": "Updated description", 
  "urgency": 4,
  "status": 2
}
```

**Example**:
```bash
PUT /tickets/456?glpiUserId=123
```

### Delete Ticket
**DELETE** `/tickets/{ticketId}?glpiUserId={glpiUserId}`

**Description**: Delete a ticket (with access validation)

**Example**:
```bash
DELETE /tickets/456?glpiUserId=123
```

### Ticket Metadata Endpoints

#### Get Ticket Statuses
**GET** `/tickets/meta/statuses`

**Response**:
```json
[
  { "id": 1, "name": "New" },
  { "id": 2, "name": "Processing (assigned)" },
  { "id": 3, "name": "Processing (planned)" },
  { "id": 4, "name": "Pending" },
  { "id": 5, "name": "Solved" },
  { "id": 6, "name": "Closed" }
]
```

#### Get Ticket Priorities  
**GET** `/tickets/meta/priorities`

#### Get Search Options
**GET** `/tickets/meta/search-options`

---

## 👥 Group Management

### Get User's Groups
**GET** `/groups/user/{glpiUserId}`

**Description**: Get all groups that a user belongs to using `/User/{id}/Group_User`
**Example**:
```bash
GET /groups/user/123
```

### Get Group Details
**GET** `/groups/{groupId}?glpiUserId={glpiUserId}`

**Description**: Get specific group details (validates user is group member)
**Example**:
```bash
GET /groups/789?glpiUserId=123
```

### Get Group Tickets
**GET** `/groups/{groupId}/tickets?glpiUserId={glpiUserId}&limit={limit}&offset={offset}`

**Description**: Get tickets for a specific group using `/Group/{id}/Ticket_Group` (validates user is group member)
**Parameters**:
- `groupId` (path): Group ID
- `glpiUserId` (query): User's GLPI ID for access validation
- `limit`, `offset` (query): Pagination

**Example**:
```bash
GET /groups/789/tickets?glpiUserId=123&limit=20
```

### Get Group Users
**GET** `/groups/{groupId}/users?glpiUserId={glpiUserId}`

**Description**: Get users in a group using `/Group/{id}/Group_User` (validates user is group member)
**Example**:
```bash
GET /groups/789/users?glpiUserId=123
```

---

## 👤 Profile Management

### Get User Profiles
**GET** `/profiles/user/{glpiUserId}`

**Description**: Get all profiles assigned to a user using `/User/{id}/Profile_User`
**Example**:
```bash
GET /profiles/user/123
```

### Get Profile Details
**GET** `/profiles/{profileId}?glpiUserId={glpiUserId}`

**Description**: Get specific profile details (validates user has this profile)
**Example**:
```bash
GET /profiles/456?glpiUserId=123
```

---

## 📊 Dashboard & Statistics  

### Get User Dashboard Statistics
**GET** `/dashboard/user/{glpiUserId}/stats`

**Description**: Get comprehensive ticket statistics for a user
**Response**:
```json
{
  "totalRequested": 25,
  "totalAssigned": 12,
  "requestedByStatus": {
    "1": 5,  // 5 new tickets
    "2": 10, // 10 processing tickets
    "5": 10  // 10 solved tickets
  },
  "assignedByStatus": {
    "2": 8,  // 8 processing
    "4": 4   // 4 pending
  },
  "recentRequested": [...], // Last 5 requested tickets
  "recentAssigned": [...]   // Last 5 assigned tickets
}
```

**Example**:
```bash
GET /dashboard/user/123/stats
```

### Get Recent Activity
**GET** `/dashboard/user/{glpiUserId}/recent`

**Description**: Get user's recent ticket activity (last 10 tickets)
**Example**:
```bash
GET /dashboard/user/123/recent
```

### Get Complete Overview
**GET** `/dashboard/user/{glpiUserId}/overview`

**Description**: Get complete user overview including tickets, groups, profiles
**Response**:
```json
{
  "user": { "glpiId": 123 },
  "tickets": {
    "stats": {...},
    "recent": [...]
  },
  "groups": [...],
  "profiles": [...],
  "summary": {
    "totalTickets": 37,
    "totalRequested": 25,
    "totalAssigned": 12,
    "groupCount": 3,
    "profileCount": 2
  }
}
```

**Example**:
```bash
GET /dashboard/user/123/overview
```

---

## 🛠️ Utility Endpoints (Existing)

### Get All Users
**GET** `/glpi/users`

**Description**: Get all users from GLPI (admin function)

### Get User by ID
**GET** `/glpi/users/{id}`

**Description**: Get specific user details by GLPI ID

### Sync Users from GLPI
**POST** `/glpi/sync-users`

**Description**: Sync users from GLPI to local database

---

## 📋 Usage Examples

### Complete User Workflow

```bash
# 1. User 'nas' logs in to your app and you get his glpiId = 123

# 2. Get his dashboard overview
GET /dashboard/user/123/overview

# 3. Get his tickets
GET /tickets?glpiUserId=123&limit=10

# 4. Create a new ticket for him
POST /tickets?glpiUserId=123
{
  "title": "Need help with software installation",
  "content": "I need help installing the new accounting software"
}

# 5. Get his groups
GET /groups/user/123

# 6. If he's in group 789, get group tickets
GET /groups/789/tickets?glpiUserId=123

# 7. Update a ticket
PUT /tickets/456?glpiUserId=123
{
  "status": 4,
  "content": "Updated: Issue partially resolved"
}
```

### Testing with Postman/cURL

```bash
# Test user tickets
curl -X GET "http://localhost:3000/tickets?glpiUserId=123&type=all&limit=5"

# Test ticket creation
curl -X POST "http://localhost:3000/tickets?glpiUserId=123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket",
    "content": "This is a test ticket",
    "urgency": 3
  }'

# Test dashboard
curl -X GET "http://localhost:3000/dashboard/user/123/overview"
```

---

## 🔒 Security Notes

1. **Access Control**: Each endpoint validates that the user has access to the requested data
2. **User Isolation**: All ticket queries are filtered by `glpiUserId` to ensure data isolation
3. **Group Validation**: Group ticket access requires group membership validation
4. **Current Auth**: Uses superadmin GLPI session with application-level filtering

---

## 🚀 Next Steps

1. **Add Authentication**: Implement JWT-based authentication to automatically extract `glpiUserId`
2. **Add Caching**: Cache user permissions and group memberships
3. **Add Validation**: Add proper DTO validation for all request bodies
4. **Add Error Handling**: Implement comprehensive error handling
5. **Add Logging**: Add request/response logging for audit trails
6. **Add Rate Limiting**: Implement rate limiting per user
7. **Add Pagination**: Enhance pagination with total count and page info

This setup gives you complete GLPI functionality through your application with proper user isolation and access control!