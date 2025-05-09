# Windows Desktop Application Setup Guide

This guide provides detailed technical instructions for setting up, customizing, and building the Aloha Healing Center clinic management system as a Windows desktop application using Electron.

## Development Environment Setup

### Prerequisites

- Windows 10/11 or macOS (for cross-platform development)
- Node.js 16.x or newer
- npm 8.x or newer
- Git
- Visual Studio Code (recommended)
- PostgreSQL (local development) or AWS account (production deployment)

### Clone and Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aloha-healing-center.git
   cd aloha-healing-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_TYPE=memory     # Use 'memory' for development, 'postgres' for local PostgreSQL, 'aws-rds' for AWS

   # AWS Credentials (for production)
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_aws_region
   DB_INSTANCE_IDENTIFIER=your_rds_instance
   DB_NAME=your_database_name
   DB_SECRET_ARN=your_secrets_manager_arn
   DB_RESOURCE_ARN=your_rds_resource_arn

   # Stripe (optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. **Initialize database (if using PostgreSQL locally)**
   ```bash
   npm run db:push
   ```

## Running the Application in Development Mode

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Launch the Electron application**
   ```bash
   # In a separate terminal
   npm run electron-dev
   ```

## Customizing the Application

### Changing the Application Icon

1. Prepare your icon in multiple formats:
   - `.png` - For basic usage (recommended size: 256x256 or larger)
   - `.ico` - For Windows (generate from PNG using online converters)
   - `.icns` - For macOS (generate from PNG using online converters)

2. Place icon files in the `resources` directory

3. Update the Electron configuration in `electron.js`:
   ```javascript
   mainWindow = new BrowserWindow({
     // ... other options
     icon: path.join(__dirname, 'resources/icon.png'),
     title: 'Your Application Name'
   });
   ```

4. Update `electron-builder.json` to reference your icon:
   ```json
   "win": {
     "target": ["nsis"],
     "icon": "resources/icon.png"
   }
   ```

### Customizing Application Name and Branding

1. Update the `package.json` file:
   ```json
   {
     "name": "your-app-name",
     "productName": "Your Application Name",
     "description": "Your application description",
     // ... other fields
   }
   ```

2. Update `electron-builder.json`:
   ```json
   {
     "appId": "com.yourcompany.yourappname",
     "productName": "Your Application Name",
     // ... other fields
   }
   ```

3. Update application title in `electron.js`:
   ```javascript
   mainWindow = new BrowserWindow({
     // ... other options
     title: 'Your Application Name'
   });
   ```

### Customizing Splash Screen and Loading Experience

1. Create a splash screen HTML file in `resources/splash.html`

2. Update `electron.js` to display the splash screen:
   ```javascript
   let splashWindow;

   function createSplashWindow() {
     splashWindow = new BrowserWindow({
       width: 500,
       height: 300,
       transparent: true,
       frame: false,
       alwaysOnTop: true,
       icon: path.join(__dirname, 'resources/icon.png')
     });

     splashWindow.loadFile('resources/splash.html');
     splashWindow.on('closed', () => splashWindow = null);
     splashWindow.webContents.on('did-finish-load', () => {
       splashWindow.show();
     });
   }

   app.whenReady().then(() => {
     createSplashWindow();
     // Rest of your code...
   });

   // Then close splash window when main window is ready
   mainWindow.webContents.on('did-finish-load', () => {
     mainWindow.show();
     if (splashWindow) splashWindow.close();
   });
   ```

## Building for Production

### Building Windows Installer

1. **Generate production build**
   ```bash
   npm run build
   ```

2. **Build Windows installer**
   ```bash
   npm run electron-build
   ```
   
   This will create installers in the `release` directory.

### Customizing the Installer

1. Update `electron-builder.json` to customize the installer:
   ```json
   {
     "win": {
       "target": ["nsis"],
       "icon": "resources/icon.png"
     },
     "nsis": {
       "oneClick": false,
       "allowToChangeInstallationDirectory": true,
       "createDesktopShortcut": true,
       "createStartMenuShortcut": true,
       "shortcutName": "Your App Name"
     }
   }
   ```

2. For more customization options, refer to the [electron-builder documentation](https://www.electron.build/configuration/nsis).

## Advanced Configurations

### Auto-Updates

1. Install `electron-updater`:
   ```bash
   npm install electron-updater
   ```

2. Add auto-update code to `electron.js`:
   ```javascript
   const { autoUpdater } = require('electron-updater');

   // Check for updates
   autoUpdater.checkForUpdatesAndNotify();

   // Handle update events
   autoUpdater.on('update-available', () => {
     // Show notification
   });

   autoUpdater.on('update-downloaded', () => {
     // Prompt user to install
   });
   ```

3. Configure publishing in `electron-builder.json`:
   ```json
   {
     "publish": {
       "provider": "github",
       "owner": "yourUsername",
       "repo": "yourRepo"
     }
   }
   ```

### System Tray Integration

Add system tray support to keep the application running in the background:

```javascript
const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;

function createTray() {
  tray = new Tray(path.join(__dirname, 'resources/tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Your Application Name');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  // Other initialization code
  createTray();
});
```

## Common Issues and Troubleshooting

### Application Crashes on Startup

1. Check if Node.js and npm are installed correctly
2. Verify that all dependencies are installed
3. Look for errors in the console by running with `--enable-logging`:
   ```bash
   electron . --enable-logging
   ```

### Missing Dependencies

If you encounter errors related to missing native modules:

1. Install required build tools:
   ```bash
   npm install --global --production windows-build-tools
   ```

2. Rebuild native modules:
   ```bash
   npm rebuild
   ```

### Database Connection Issues

1. Verify database credentials in `.env` file
2. Check if the database server is running and accessible
3. For AWS RDS, verify that security groups allow connections from your IP

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder Documentation](https://www.electron.build/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)