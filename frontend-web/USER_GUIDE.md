# Prashikshan Web Application - User Guide

## 🚀 Quick Start

1. **Start the backend server** (if not already running):
   ```bash
   cd backend
   # Activate your Python environment
   uvicorn app.main:app --reload
   ```
   Backend will run on: `http://localhost:8000`

2. **Start the web app** (already running):
   ```bash
   cd frontend-web
   npm run dev
   ```
   Web app is on: `http://localhost:3001`

3. **Login** with your existing credentials

## 📱 Features Overview

### For Students

#### Dashboard
- View your key metrics at a glance
- See open internships, application status, logbook hours, pending reviews
- Quick action buttons to navigate

#### Internships
- Browse all available internships
- Search by keywords (title, description, location, skills)
- Filter by remote/on-site
- Filter by minimum credits
- Click any internship card to view details
- See stipend, duration, credits, and required skills

#### Applications
- View all your submitted applications
- Filter by: ALL / PENDING / APPROVED / REJECTED
- Check both faculty and industry approval status
- Access your resume snapshots

#### Logbook
- View all your logged entries
- See statistics: total hours, approved hours, entry count
- Filter by: ALL / APPROVED / PENDING
- Check faculty comments on entries
- View attachments

#### Notifications
- Real-time notification badge in header
- Filter: ALL / UNREAD
- Click to mark as read
- Auto-refreshes every 30 seconds

#### Profile
- View your complete profile
- Edit your information (name, phone, university, college, etc.)
- Update your skills
- Save changes instantly

### For Faculty

#### Dashboard
- View pending applications and logbook entries
- Quick links to review tasks
- Department statistics

#### Applications
- Review all student applications
- See student details (name, email)
- Approve/reject applications
- View associated internships

#### Logbook
- Review student daily logs
- Add faculty comments
- Approve hours logged
- Track student progress

### For Industry

#### Dashboard
- View your posted internships
- Track application status
- Monitor engagement

#### Internships
- Post new internship opportunities
- Manage your listings
- Edit or close postings

#### Applications
- Review applicants for your internships
- View student profiles and resumes
- Approve/reject candidates
- Contact students

## 🎯 Common Tasks

### How to Browse Internships
1. Click "Internships" in sidebar
2. Use search bar to find specific opportunities
3. Click filter checkboxes (Remote, Min Credits)
4. Click any card to view full details

### How to Check Application Status
1. Click "Applications" in sidebar
2. Use filter tabs (ALL / PENDING / APPROVED / REJECTED)
3. View both faculty and industry approval status
4. Click "View Resume" to see your submitted resume

### How to View Logbook
1. Click "Logbook" in sidebar
2. See your stats at the top (hours logged, approved)
3. Filter by approval status
4. Click entries to view details and comments

### How to Check Notifications
1. Look at bell icon in header (shows unread count)
2. Click bell icon to view all notifications
3. Click any unread notification to mark as read
4. Use ALL/UNREAD tabs to filter

### How to Edit Profile
1. Click your name in top-right corner
2. Select "Your Profile"
3. Click "Edit Profile" button
4. Update your information
5. Click "Save Changes"

## 🔧 Troubleshooting

### Can't Login?
- Check backend is running on port 8000
- Verify credentials are correct
- Check browser console for errors

### No Data Showing?
- Ensure backend API is accessible
- Check network tab for 401/403 errors
- Try logging out and back in

### Token Expired?
- The app auto-refreshes tokens
- If stuck, logout and login again

### Notifications Not Updating?
- They refresh every 30 seconds automatically
- Refresh page to force update

## 💡 Tips

1. **Navigation**: Use sidebar for main features
2. **Quick Actions**: Dashboard cards are clickable
3. **Filters**: Use filter tabs for faster data browsing
4. **Search**: Press Enter after typing in search boxes
5. **Notifications**: Badge shows unread count
6. **Profile**: Keep your profile updated for better matches

## 🎨 Interface Guide

### Color Coding
- 🔵 Blue: Primary actions, links
- 🟢 Green: Approved, success states
- 🟡 Yellow: Pending, warnings
- 🔴 Red: Rejected, errors, logout

### Status Badges
- **OPEN**: Internship accepting applications
- **PENDING**: Awaiting approval
- **APPROVED**: Application/entry approved
- **REJECTED**: Application/entry rejected

### Icons
- 💼 Briefcase: Internships
- 📄 File: Applications
- 📖 Book: Logbook
- 🔔 Bell: Notifications
- 👤 User: Profile
- 🎯 Target: Analytics
- ⚙️ Gear: Settings

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Verify backend is running
3. Check network requests in DevTools
4. Review IMPLEMENTATION_COMPLETE.md for technical details

## 🌟 Keyboard Shortcuts

- `Enter` in search boxes: Execute search
- `Escape` in modals/menus: Close
- Tab: Navigate between inputs

## 📊 Data Refresh

- **Dashboard metrics**: Loads on page load
- **Notifications count**: Updates every 30 seconds
- **Lists**: Refresh on navigation
- **Profile**: Real-time after save

Enjoy using the Prashikshan Web Platform! 🎓
