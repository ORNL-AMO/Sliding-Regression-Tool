const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
var win;
console.log('App starting...')

function isDev() {
  return process.mainModule.filename.indexOf('app.asar') === -1;
};

function createWindow() {
  console.log('create window')
  win = new BrowserWindow({ width: 1024, height: 768 })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file',
    slashes: true
  }));

  if (isDev()) {
    win.webContents.openDevTools()
  }

  win.on('closed', function () {
    win = null
  })
}

app.on('ready', function () {
  console.log('app ready..')
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (win === null) {
    createWindow()
  }
})
