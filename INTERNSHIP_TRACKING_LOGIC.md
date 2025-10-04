# Internship Tracking Logic

## Overview
This document explains how internship progress is tracked in the Prashikshan platform for faculty analytics.

## Data Model

### Key Entities

1. **Application**
   - `internship_id`: Links to the internship
   - `student_id`: Links to the student
   - `faculty_status`: 'PENDING' | 'APPROVED' | 'REJECTED'
   - `industry_status`: 'PENDING' | 'APPROVED' | 'REJECTED'
   - `applied_at`: Timestamp of application

2. **Internship**
   - `start_date`: When internship begins
   - `duration_weeks`: Length of internship (e.g., 8 weeks)
   - `skills`: Required skills
   - `credits`: NEP credits awarded

3. **LogbookEntry**
   - `application_id`: Links to the application
   - `entry_date`: Date of work
   - `hours`: Hours worked that day
   - `description`: Work description
   - `approved`: Boolean (faculty approval)

## Tracking Status Categories

### 1. ENROLLED
**Definition**: Student has received approval from both faculty AND industry to start the internship.

**Criteria**:
- `application.faculty_status === 'APPROVED'`
- `application.industry_status === 'APPROVED'`
- Has NOT yet started submitting logbook entries

**What it means**: Student is officially enrolled and authorized to begin the internship but hasn't started working yet.

**Example**: A student applied for a Data Science internship at TechCorp. Both the faculty advisor and TechCorp approved the application. The student is now enrolled but the internship start date is next week.

---

### 2. IN PROGRESS
**Definition**: Student is actively working on the internship.

**Criteria**:
- Must first be ENROLLED (both approvals)
- Has submitted at least one logbook entry
- Has NOT met completion requirements yet

**What it means**: Student has started the internship and is logging their work, but hasn't finished all requirements.

**Example**: The student started the internship and has been submitting weekly logbook entries. They've worked 120 hours out of a required 320 hours (8 weeks × 40 hours/week). Some logbook entries are approved, others are pending faculty review.

---

### 3. COMPLETED
**Definition**: Student has successfully finished all internship requirements.

**Criteria**:
- Must first be ENROLLED (both approvals)
- Has submitted logbook entries
- ALL logbook entries are approved by faculty
- **AND** one of the following:
  - Total hours worked >= Required hours (duration_weeks × 40 hours/week)
  - Internship end date has passed (start_date + duration_weeks)

**What it means**: Student has fulfilled all obligations and the internship is complete. Credits can be awarded.

**Example**: The student worked for 8 weeks, submitted 40 logbook entries totaling 320 hours, and the faculty approved all entries. The internship duration has ended. The student is now eligible for the 4 NEP credits.

## Calculation Logic

### Step-by-Step Process

```typescript
1. Filter all applications to get ENROLLED students:
   enrolledApplications = applications.filter(
     app => app.faculty_status === 'APPROVED' && 
            app.industry_status === 'APPROVED'
   )

2. For each enrolled application:
   a. Get the internship details
   b. Get all logbook entries for this application
   c. Calculate total hours worked
   d. Calculate required hours (duration_weeks × 40)
   e. Check if end date has passed
   f. Determine status:
      - If (all logbooks approved) AND 
         (hours >= required OR end date passed)
         → COMPLETED
      - Else if (has any logbook entries)
         → IN PROGRESS
      - Else
         → ENROLLED

3. Count each status category
4. Calculate percentages based on total enrolled students
```

### Required Hours Calculation

**Formula**: `required_hours = duration_weeks × 40 hours/week`

**Examples**:
- 8 week internship: 8 × 40 = 320 hours
- 12 week internship: 12 × 40 = 480 hours
- 4 week internship: 4 × 40 = 160 hours

**Note**: We use 40 hours/week as the standard full-time work week.

### End Date Calculation

**Formula**: `end_date = start_date + (duration_weeks × 7 days)`

**Example**:
- Start date: June 1, 2025
- Duration: 8 weeks
- End date: June 1 + 56 days = July 27, 2025

### Percentage Calculation

**Base**: Total enrolled students (not total applications)

```
enrolled_percentage = (enrolled_count / total_enrolled) × 100
in_progress_percentage = (in_progress_count / total_enrolled) × 100
completed_percentage = (completed_count / total_enrolled) × 100
```

**Example**:
- Total enrolled students: 100
- Enrolled (not started): 25 students → 25%
- In Progress: 60 students → 60%
- Completed: 15 students → 15%
- Total: 100%

## Edge Cases & Handling

### Case 1: Application Approved but Internship Hasn't Started
**Status**: ENROLLED
**Reason**: Student hasn't begun working yet (no logbook entries)

### Case 2: Student Started but No Logbooks Approved Yet
**Status**: IN PROGRESS
**Reason**: Has logbook entries (working) but none approved yet

### Case 3: Student Met Hours but Some Logbooks Pending
**Status**: IN PROGRESS
**Reason**: Not all logbooks are approved, even if hours are met

### Case 4: Duration Passed but Hours Not Met
**Status**: COMPLETED
**Reason**: End date is a valid completion criterion (internship term ended)

### Case 5: Only Faculty Approved (Industry Pending)
**Status**: Not counted in any category
**Reason**: Student isn't enrolled until BOTH approve

### Case 6: No Internship Duration Specified
**Fallback**: Assume 8 weeks (320 hours)
**Reason**: Provides a reasonable default for completion tracking

## Visual Representation in Analytics

The faculty analytics dashboard shows:

```
Internship Participation
Tracking 100 enrolled students

Enrolled                                    25%
25 students approved by both faculty & industry

In Progress                                 60%
60 students actively working (have logbook entries)

Completed                                   15%
15 students finished (met hour requirements & all logbooks approved)
```

## Data Flow

```
Application Submitted
        ↓
Faculty Review → APPROVED
        ↓
Industry Review → APPROVED
        ↓
    ENROLLED ✓
        ↓
Student Starts Work (submits first logbook)
        ↓
   IN PROGRESS ✓
        ↓
Student Completes Hours & Gets All Approvals
        ↓
    COMPLETED ✓
        ↓
Credits Awarded
```

## Benefits of This System

1. **Clear Milestones**: Faculty can see exactly where each student is
2. **Actionable Insights**: Identify students who need support
3. **Credit Validation**: Only count completed internships for credits
4. **Progress Tracking**: Monitor active internships in real-time
5. **Resource Planning**: See how many students are at each stage

## Future Enhancements

1. **Status History**: Track when students move between statuses
2. **Alerts**: Notify faculty when students haven't submitted logbooks
3. **Completion Predictions**: Estimate completion dates based on current progress
4. **Hour Tracking**: Show detailed hour accumulation graphs
5. **Milestone Badges**: Award badges at 25%, 50%, 75%, 100% completion
