'use strict';

const {app, BrowserWindow, Menu} = require('electron');
const windowStateKeeper = require('electron-window-state');
const path = require('path');

let win;

/**
 * When work makes progress, show the progress bar
 * @param {float} progress - Must be between 0 and 1
 */
function onProgress(progress) {
  win.setProgressBar(progress || -1); // Progress bar works on all platforms
}

let numDoneInBackground = 0;
/**
 * When work completes while the app is in the background, show a badge
 */
function onDone() {
  const dock = electron.app.dock; // Badge works only on Mac
  if (!dock || win.isFocused()) return;
  numDoneInBackground++;
  dock.setBadge('' + numDoneInBackground);
}

/**
 * Subscribe to the window focus event. When that happens, hide the badge
 */
function onFocus() {
  numDoneInBackground = 0;
  dock.setBadge('');
}

/**
 * Create the window
*/
function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 720,
  });
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    title: 'Storatron',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'app/js/preload.js'),
    },
  });

  mainWindowState.manage(win);
  win.loadFile(path.join(__dirname, 'app/index.html'));
  // to open devtools on launch:
  // win.webContents.openDevTools();

  win.on('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.on('close', () => {
    win = null;
  });

  win.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  const template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'},
      ],
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'},
      ],
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'},
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            require('electron').shell.openExternal('https://zbgn.fr/storatron');
          },
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {
          label: 'Check for Updates...',
          role: 'update',
        },
        {type: 'separator'},
        {
          label: 'Preferences',
          accelerator: 'Cmd+,',
          click: () => win.dispatch('preferences'),
        },
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'},
      ],
    });

    // Edit menu
    template[1].submenu.push(
        {type: 'separator'},
        {
          label: 'Speech',
          submenu: [
            {role: 'startspeaking'},
            {role: 'stopspeaking'},
          ],
        },
    );

    // Window menu
    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'},
    ];
  };

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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

