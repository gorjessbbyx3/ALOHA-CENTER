# Aloha Healing Center - User Guide

![Aloha Healing Center](./resources/icon.png)

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Appointment Management](#appointment-management)
4. [Patient Management](#patient-management)
5. [Services Menu](#services-menu)
6. [Payment Processing (POS)](#payment-processing-pos)
7. [Rooms Management](#rooms-management)
8. [Staff Management](#staff-management)
9. [Analytics and Reporting](#analytics-and-reporting)
10. [System Settings](#system-settings)
11. [Tips and Tricks](#tips-and-tricks)

---

## Getting Started

### Logging In

1. Launch the application by double-clicking the desktop icon or using the start-electron.bat file
2. When the login screen appears, enter your credentials:
   - Username: your assigned username (default admin: webmaster808)
   - Password: your password (default admin: BingoxBango)
3. Click "Sign In" to access the dashboard

### First-Time Setup Checklist

- [ ] Update your password
- [ ] Configure business information
- [ ] Set up services and pricing
- [ ] Configure treatment rooms
- [ ] Add staff members
- [ ] Customize dashboard appearance

---

## Dashboard Overview

The dashboard is your central hub for clinic operations, providing quick access to all system features.

### Dashboard Tiles

1. **Appointment Book Tile**
   - Quick access to the appointment scheduling system
   - Click to view and manage all appointments

2. **Management Tile**
   - Access system settings and configurations
   - Manage services, rooms, staff, and dashboard appearance

3. **Point of Sale (POS) Tile**
   - Process payments and transactions
   - Manage product inventory and services checkout

4. **Services Menu Tile**
   - View all available services with pricing
   - Categorized list of treatments and procedures

5. **Upcoming Appointments Tile**
   - Shows appointments scheduled for today
   - Quick overview of patient details and treatment types

6. **Analytics Tile**
   - Visual representation of business metrics
   - Track revenue, appointments, and patient trends

7. **Sticky Notes Tile**
   - Quick notes and reminders
   - Add, edit, and delete notes as needed

8. **Date & Time Tile**
   - Current date and time
   - Business hours indicator

### Customizing Your Dashboard

1. Click on the **Management Tile**
2. Select the **Appearance** tab
3. Customize:
   - Dashboard title
   - Welcome message
   - Visible tiles (show/hide specific features)
4. Click "Save Appearance" to apply changes

---

## Appointment Management

The appointment system allows you to schedule, track, and manage all patient appointments.

### Viewing Appointments

1. Click the **Appointment Book Tile** on the dashboard
2. The calendar view displays all scheduled appointments
3. Use the filters at the top to:
   - Select date range (day, week, month)
   - Filter by room or provider
   - Search for specific patients

### Scheduling a New Appointment

1. Click the **+ New Appointment** button in the top right
2. Fill in the appointment details:
   - Select patient (or create a new one)
   - Choose service type
   - Select treatment room
   - Set date and time
   - Add notes if needed
3. Click "Save" to create the appointment

### Using Drag-and-Drop Scheduling

1. Click and hold on any existing appointment
2. Drag to a new time slot or room
3. Release to reschedule
4. Confirm the change in the popup dialog

### Managing Appointments

Right-click on any appointment to access the context menu with options:
- **Check In** - Mark patient as arrived
- **Add Enhancement** - Add additional services
- **Reschedule** - Change appointment time
- **Cancel** - Cancel the appointment
- **Process Payment** - Take payment for services
- **View Details** - See full appointment information
- **Email Confirmation** - Send confirmation email to patient

---

## Patient Management

The patient management system helps you maintain comprehensive patient records.

### Accessing Patient Records

1. Click on "Patients" in the main navigation menu
2. View the list of all patients with search and filter options
3. Click on a patient name to access their detailed profile

### Adding a New Patient

1. Click the **+ New Patient** button
2. Complete the patient information form:
   - Personal details (name, DOB, contact info)
   - Medical history
   - Insurance information
   - Consent forms
3. Click "Save" to create the patient record

### Patient Profile Features

Each patient profile includes:
- **Personal Information** - Contact details and demographic data
- **Appointment History** - Record of past and upcoming appointments
- **Treatment Notes** - Clinical documentation
- **Payment History** - Record of transactions
- **Documents** - Uploaded files and forms

### Managing Patient Records

From a patient profile, you can:
- Edit personal information
- Schedule new appointments
- Review treatment history
- Process payments
- Add clinical notes
- Upload documents

---

## Services Menu

The services menu allows you to manage all treatments and procedures offered by your clinic.

### Viewing Services

1. Click the **Services Menu Tile** on the dashboard
2. Browse services organized by category
3. View details including:
   - Service name and description
   - Duration
   - Price

### Managing Services

To add or edit services:
1. Click the **Management Tile**
2. Select the **Services** tab
3. To add a new service:
   - Click "+ Add Service"
   - Complete the service details form
   - Click "Save"
4. To edit an existing service:
   - Click the edit icon next to the service
   - Update information as needed
   - Click "Save"

---

## Payment Processing (POS)

The Point of Sale system allows you to process payments and manage financial transactions.

### Processing a Payment

1. Click the **POS Tile** on the dashboard
2. Select a patient from the dropdown or search
3. Add items to the cart:
   - Select from services rendered
   - Add retail products if applicable
4. Apply any discounts or promotions
5. Select payment method:
   - Credit/debit card (processes through Stripe)
   - Cash
   - Check
   - Gift card
6. Complete the transaction and print or email receipt

### Viewing Transaction History

1. Click on "Payments" in the main navigation
2. View all transactions with filter options:
   - Date range
   - Patient
   - Payment method
   - Service type
3. Click on any transaction to view details

### Processing Refunds

1. Locate the transaction in the payment history
2. Click "Process Refund"
3. Select full or partial refund
4. Enter refund reason
5. Confirm the refund

---

## Rooms Management

Manage your clinic's treatment spaces for optimal scheduling.

### Viewing Rooms

1. Click the **Management Tile**
2. Select the **Rooms** tab
3. View all rooms with status indicators (active/inactive)

### Adding a New Room

1. Click "+ Add Room"
2. Enter room details:
   - Room name/number
   - Description
   - Capacity
   - Equipment/features
3. Set status as active or inactive
4. Click "Save"

### Room-Based Scheduling

1. From the Appointment Book, click the "Rooms" view
2. See a visual representation of all rooms and their scheduled appointments
3. Drag and drop to assign appointments to specific rooms

---

## Staff Management

Manage your clinic staff, permissions, and schedules.

### Managing User Accounts

1. Click the **Management Tile**
2. Select the **Staff** tab
3. View all staff members
4. To add a new staff member:
   - Click "+ Add Staff"
   - Complete the staff profile
   - Set username and password
   - Assign permissions
   - Click "Save"

### Setting User Permissions

1. Edit a staff member profile
2. Go to the "Permissions" section
3. Select appropriate access levels:
   - Administrator (full access)
   - Provider (clinical access)
   - Front Desk (scheduling and patient info)
   - Billing (payment processing)
4. Save changes

### Staff Scheduling

1. From the Staff tab, click "View Schedule"
2. Set working hours for each staff member
3. Manage time off requests
4. View provider availability for appointment scheduling

---

## Analytics and Reporting

Track business performance and generate insightful reports.

### Dashboard Analytics

The Analytics Tile on the dashboard shows key metrics:
- Total appointments today
- New patients this week
- Weekly revenue
- Room utilization rate
- Services sold

### Generating Reports

1. Click on "Reports" in the main navigation
2. Select report type:
   - Financial reports
   - Appointment statistics
   - Patient demographics
   - Provider productivity
3. Set parameters (date range, filters)
4. Click "Generate Report"
5. View on screen or export (PDF, CSV)

---

## System Settings

Configure system-wide settings to customize your clinic operations.

### Accessing Settings

1. Click the **Management Tile**
2. Select the **Settings** tab

### Available Settings

- **Business Information**
  - Clinic name and contact details
  - Business hours
  - Location information

- **Email Notifications**
  - Configure appointment reminders
  - Receipt templates
  - Marketing emails

- **Integration Settings**
  - Payment processor configuration
  - External calendar synchronization
  - Third-party service connections

- **Backup and Data Management**
  - Database backup settings
  - Data retention policies
  - Export options

---

## Tips and Tricks

### Keyboard Shortcuts

- **Ctrl+N** - New appointment
- **Ctrl+P** - New patient
- **Ctrl+F** - Search
- **Ctrl+S** - Save current form
- **Esc** - Close current dialog

### Time-Saving Features

1. **Quick Booking**
   - Use the "Book Again" option from a patient's profile to quickly schedule a repeat appointment

2. **Bulk Operations**
   - Send reminder emails to multiple patients at once
   - Process multiple check-ins simultaneously

3. **Templates**
   - Create templates for common treatment notes
   - Save frequently used email responses

4. **Sticky Notes**
   - Use the sticky notes feature for quick reminders
   - Notes persist across sessions

### Mobile Access

While the Windows application provides full functionality, you can also access basic features through the web version on mobile devices:

1. Open your mobile browser
2. Navigate to your clinic's URL
3. Log in with your credentials
4. Access a mobile-optimized version of the dashboard

---

## Need Help?

If you encounter any issues or have questions:

1. Check the troubleshooting section in the README.md file
2. Contact technical support at support@alohahealingcenter.com
3. Call the support line at (555) 123-4567

---

© 2025 Aloha Healing Center. All rights reserved.