// import { init } from '@instantdb/react-native';

// Define the schema for our collections
const schema = {
  profiles: {
    id: "string",
    username: "string",
    email: "string",
    display_name: "string",
    onboarding_complete: "boolean",
    weight: "number",
    height: "number",
    age: "number",
    gender: "string",
    target_weight: "number",
    target_date: "string",
    activity_level: "number",
    weight_loss_speed: "number",
    diet_exercise_ratio: "number",
    allergies: "string",
    created_at: "string",
    updated_at: "string"
  },
  entitlements: {
    id: "string",
    user_id: "string",
    product_id: "string",
    provider: "string",
    active: "boolean",
    expires_at: "string",
    last_synced_at: "string"
  }
};

// Initialize InstantDB client with the provided app ID and schema
// export const db = init({ 
//   appId: "d10db7a8-30ac-4fdb-82a1-87cc0e993acd",
//   schema
// });

// Temporary mock for build testing
export const db = {
  auth: {
    user: null,
    sendMagicLink: async () => ({ data: null, error: null }),
    signOut: async () => {},
    onAuthChange: () => () => {}
  },
  query: async () => ({ data: { profiles: [], entitlements: [] } }),
  transact: async () => {}
};

// Export the schema for reference
export { schema };

// Export the database instance
export default db;
