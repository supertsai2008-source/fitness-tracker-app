# InstantDB Permissions Configuration

## Required Permissions Rules

To ensure proper user isolation and security, configure the following permissions in your InstantDB dashboard:

### Profiles Collection
```javascript
// Users can only read and write their own profile
profiles: {
  read: "user.id == record.id",
  write: "user.id == record.id"
}
```

### Entitlements Collection
```javascript
// Users can only read and write their own entitlements
entitlements: {
  read: "user.id == record.user_id",
  write: "user.id == record.user_id"
}
```

## Setup Instructions

1. Go to your InstantDB dashboard at https://instantdb.com/dash
2. Select your app: `d10db7a8-30ac-4fdb-82a1-87cc0e993acd`
3. Navigate to the "Schema" section
4. Add the collections from `instantdb-schema.json`
5. Navigate to the "Rules" section
6. Add the permission rules above for each collection

## Security Notes

- These rules ensure that users can only access their own data
- The `user.id` is automatically provided by InstantDB's authentication system
- No client-side user ID spoofing is possible as the user context is server-side validated
- All data operations are automatically filtered based on these rules
