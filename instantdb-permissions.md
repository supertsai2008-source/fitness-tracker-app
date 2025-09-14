# InstantDB Permissions Configuration

This document outlines the required permissions configuration for the InstantDB app to ensure proper user isolation and data security.

## App ID
```
d10db7a8-30ac-4fdb-82a1-87cc0e993acd
```

## Required Permissions

### 1. Profiles Collection
**Collection Name**: `profiles`

**Rules**:
- **View**: `auth.id == data.id`
- **Update**: `auth.id == data.id`
- **Insert**: `auth.id == data.id`

**Description**: Users can only read and write their own profile data. The `auth.id` must match the `data.id` (user ID) in the profile record.

### 2. Entitlements Collection
**Collection Name**: `entitlements`

**Rules**:
- **View**: `auth.id == data.user_id`
- **Update**: `auth.id == data.user_id`
- **Insert**: `auth.id == data.user_id`

**Description**: Users can only read and write their own entitlements. The `auth.id` must match the `data.user_id` in the entitlement record.

## Data Models

### Profiles Schema
```typescript
interface Profile {
  id: string; // user ID (matches auth.id)
  username: string;
  onboarding_complete: boolean;
  created_at: string;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  bodyFat: number;
  activityLevel: number;
  targetWeight: number;
  targetDate: string;
  dietExerciseRatio: number;
  weightLossSpeed: number;
  allergies: string;
  reminderFrequency: number;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  lastWeightLoggedAt?: string;
}
```

### Entitlements Schema
```typescript
interface Entitlement {
  user_id: string; // matches auth.id
  product_id: string;
  provider: "revenuecat";
  active: boolean;
  expires_at: string | null;
  last_synced_at: string;
}
```

## Security Considerations

1. **User ID Validation**: The client must never send arbitrary user IDs. All user IDs must be derived from the authenticated user's ID.

2. **Data Isolation**: Each user can only access their own data through the permission rules.

3. **RevenueCat Integration**: When updating entitlements, the `user_id` must always match the authenticated user's ID.

## Implementation Notes

- The app uses a simplified authentication system for demo purposes
- In production, you would implement proper InstantDB authentication (magic codes, OAuth, etc.)
- The current implementation generates mock user IDs for demonstration
- All data operations go through the permission system defined above

## Testing

To verify permissions are working correctly:

1. **Multi-Account Isolation**: Create two different user accounts and verify they cannot access each other's data
2. **Data Security**: Attempt to access another user's data by modifying the user ID - this should be blocked by permissions
3. **Subscription Updates**: Verify that RevenueCat updates only affect the authenticated user's entitlements
