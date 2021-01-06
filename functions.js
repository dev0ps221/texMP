let { BrowserWindow, app,screen,ipcMain } = require ("electron")
let fs = require('fs')
let md5 = require(`${process.mainModule.path}/scripts/md5.js`)
let win = false
let createWindow = ()=>{
    let browserArgs = {
        width:800,
        height:400,
        webPreferences:{
            nodeIntegration : true
        }
    }
    win = new BrowserWindow(browserArgs)
    // win.setFullScreen(true)
    win.setResizable(false)
    win.loadFile('index.html')
    // win.webContents.openDevTools()
}
let run_app = (funcs)=>{   
    app.whenReady()
    .then(
        funcs.createWindow
    )
    funcs.configure_app(app)
    return {app,socket:ipcMain}
}
let configure_app = (app)=>{
    app.on(
        'wndow-all-closed',
        ()=>{
            if(process.platform == 'darwin'){
                console.log('closing...')
                app.quit()
            }
        }
    )
    app.on(
       'activate',
       ()=>{
           if (BrowserWindow.getAllWindows().length == 0 ) {
               createWindow()
           }
       }
    )
    app.on(
        'browser-window-created',
        (e,window)=>{
           console.log(window.setMenu(null)) 
        }
    )
}
module.exports = {
    configure_app,
    createWindow,
    run_app
}