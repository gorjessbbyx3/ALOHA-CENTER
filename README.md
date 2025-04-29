# Aloha Healing Center - Clinic Management System

![Aloha Healing Center](./resources/icon.png)

A comprehensive clinic management system designed to streamline healthcare administration and patient interactions.

## Windows Application Setup Guide

### Prerequisites

- Windows 10 or newer
- Node.js 16.x or newer (https://nodejs.org/)
- npm 8.x or newer (included with Node.js)
- AWS account with RDS PostgreSQL database (if using AWS database storage)

### Installation Steps

1. **Download the Application**
   - Download the latest release zip file from the releases page
   - Extract the contents to a folder of your choice

2. **First-Time Setup**

   a. **Install Required Dependencies**
      - Open Command Prompt as administrator
      - Navigate to the extracted folder
      - Run the following command:
      ```
      npm install
      ```

   b. **Configure Environment Variables**
      - In the application root directory, create a file named `.env`
      - Add the following configuration:
      ```
      # Database Configuration
      # Choose one: 'memory', 'postgres', or 'aws-rds'
      DB_TYPE=aws-rds

      # AWS Credentials (Required if DB_TYPE=aws-rds)
      AWS_ACCESS_KEY_ID=your_aws_access_key
      AWS_SECRET_ACCESS_KEY=your_aws_secret_key
      AWS_REGION=your_region (e.g., us-east-1)
      DB_INSTANCE_IDENTIFIER=your_rds_instance_name
      DB_NAME=your_database_name
      DB_SECRET_ARN=your_secrets_manager_arn
      DB_RESOURCE_ARN=your_rds_resource_arn

      # Stripe Payment Processing (Optional)
      STRIPE_SECRET_KEY=your_stripe_secret_key
      VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

      # Email Notifications (Optional)
      SENDGRID_API_KEY=your_sendgrid_api_key
      ```

   c. **Initialize the Database**
      - Run the following command to set up database tables:
      ```
      npm run db:push
      ```

3. **Launching the Application**

   **Method 1: Using the Batch File**
   - Double-click the `start-electron.bat` file in the application directory
   - The application will start automatically

   **Method 2: Using Command Line**
   - Open Command Prompt
   - Navigate to the application directory
   - Run: `node electron-start.js`

4. **Building for Distribution**

   If you want to create a standalone Windows executable:
   
   a. **Install electron-builder globally**
      ```
      npm install -g electron-builder
      ```
   
   b. **Build the application**
      ```
      npm run build
      electron-builder build --windows
      ```
   
   c. **Find the installer**
      - The installer will be available in the `release` folder

### Default Credentials

- **Username:** webmaster808
- **Password:** BingoxBango

### Application Features

- **Appointment Booking and Management**
  - Calendar view with drag-and-drop functionality
  - Appointment reminders and notifications
  - Room-based scheduling

- **Patient Management**
  - Patient records and history
  - Medical notes and treatment plans

- **Payment Processing**
  - Stripe integration
  - Invoice generation and receipt tracking

- **Reporting and Analytics**
  - Business performance metrics
  - Staff productivity reports

- **User Management**
  - Role-based permissions
  - Staff scheduling and timekeeping

### Troubleshooting

1. **Application Fails to Start**
   - Ensure Node.js is installed correctly
   - Check if all dependencies are installed using `npm install`
   - Verify that the `.env` file is properly configured
   - Check if the AWS credentials are valid

2. **Database Connection Issues**
   - Verify AWS credentials and connection parameters
   - Ensure the RDS instance is running and accessible
   - Check firewall settings to allow database connections

3. **User Interface Issues**
   - Clear browser cache by deleting the `%APPDATA%\aloha-healing-center` folder
   - Restart the application

4. **Payment Processing Issues**
   - Verify Stripe API keys are correctly set in the `.env` file
   - Check if the Stripe account is active and properly configured

### Support and Maintenance

For technical support and maintenance:

- Email: support@alohahealingcenter.com
- Phone: (555) 123-4567

---

## Developer Information

### Tech Stack

- **Frontend:** React, TailwindCSS, Shadcn UI
- **Backend:** Node.js, Express
- **Database:** PostgreSQL, AWS RDS Data API
- **Desktop Application:** Electron
- **Payment Processing:** Stripe
- **Email Notifications:** SendGrid

### API Documentation

API documentation is available at `/api/docs` when running the application in development mode.

### Contributing

Please see CONTRIBUTING.md for guidelines on how to contribute to this project.

---

© 2025 Aloha Healing Center. All rights reserved.