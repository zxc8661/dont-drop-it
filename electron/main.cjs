// Electron 진입점: 빌드된 dist/index.html을 세로 게임 창으로 연다.
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 405,
    height: 745, // 720 + 타이틀바 여유
    resizable: true,
    useContentSize: true,
    autoHideMenuBar: true,
    backgroundColor: '#0f1420',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  Menu.setApplicationMenu(null)
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
