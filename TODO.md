# Fix Persistence Issue: Store User/Member Data in MongoDB

## Backend Fixes
- [x] Fix membership route to use correct req.user.id instead of req.userId
- [x] Add POST /accept-terms route to create/update membership in MongoDB

## Frontend Fixes
- [x] Modify ProfilePage to require successful API save before showing success message
- [x] Update DashboardPage to prioritize API data over localStorage

## Testing
- [x] Test changes by running the app and verifying data persists in MongoDB collections
- [x] Backend server started successfully on port 5000 with MongoDB connected
