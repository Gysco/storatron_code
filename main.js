'use strict';

const {app, BrowserWindow} = require('electron');
const windowStateKeeper = require('electron-window-state');

let win;

/**
 * Create the window
*/
function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 720});
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    title: 'Storatron',
    show: false});

  mainWindowState.manage(win);
  win.loadFile(__dirname + '/app/index.html');
  // to open devtools on launch: win.webContents.openDevTools()

  win.on('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.on('close', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  };
});

