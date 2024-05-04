import { app, BrowserWindow, screen } from 'electron';
import path from 'path';

let appWindow: BrowserWindow | null;

const initWindow = () => {
    const screenSize = screen.getPrimaryDisplay().workAreaSize;

    appWindow = new BrowserWindow({
        height: screenSize.height,
        width: screenSize.width,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Inspired by https://github.com/maximegris/angular-electron/blob/main/app/main.ts
    const isReload = process.argv.find((arg) => arg === '--reload');

    let appPath: string;

    if (isReload) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        });

        appPath = 'http://localhost:4200';

        // Initialize the DevTools.
        appWindow.webContents.openDevTools();
    } else {
        appPath = `file://${__dirname}/dist/client/index.html`;
    }

    // Electron Build Path
    appWindow.loadURL(appPath);

    // appWindow.setAppearanceVisibility(false);

    appWindow.on('closed', () => {
        appWindow = null;
    });
};

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (appWindow === null) {
        initWindow();
    }
});
