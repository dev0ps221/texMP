let 
    ffprobe = require('node-ffprobe')
    ,funcs = require('./functions')
    ,os = require('os')
    ,path = require('path')
    ,fs = require('fs')
    ,confDir = '__conf.texconf'
    ,userPatDir = '__user_pattern.texconf'
    ,conf = {}
const 
    { exec } = require("child_process")
    ,platform = os.platform()
    ,user = os.userInfo()
    ,mediaList = async (base,ext,files,result) => {
        try{
            files = files || fs.readdirSync(base) 
            result = result || []
            files.forEach( 
                async (file) => {
                    let newbase = path.join(base,file)
                    if ( fs.statSync(newbase).isDirectory() )
                    {
                        result = await mediaList(newbase,ext,fs.readdirSync(newbase),result)
                    }
                    else
                    {
                        if(!Array.isArray(ext)){
                            if ( file.substr(-1*(ext.length+1)) == '.' + ext )
                            {
                                result.push(newbase)
                            }
                        }
                        else ext.forEach(
                            xt=>{
                                if ( (file.substr(-1*(xt.length+1)) === '.'+xt) )
                                {
                                    result.push(newbase)
                                }   
                            }
                        ) 
                    }
                }
            )
        }catch(e){
            // if(e.message.match('is not a function')) false
            // console.log(e.toString().match('UnhandledPromiseRejectionWarning:'))
        }
        return result
    }
    ,updateConf=(comf)=>{
        fs.writeFileSync(confDir,JSON.stringify(conf))
    }
    ,getConf = ()=>{
        conf = JSON.parse(fs.readFileSync(confDir))
    }
    ,getFolderMediaContent = async (user,dir)=>{
        return await (
            async (console,dir)=>{
                try{
                    let list = await mediaList(`${user.homedir}/${dir}`,['mp3','mp4','avi']) 
                    return list
                }catch(e){
                    console.log("asas"+e)
                }

            }
    
        )(console,dir)
    }
    ,getUserMedias = ()=>{
        return conf.users[user.username].medias
    }
    ,refreshUserData = (user)=>{
        let u = user
        if((user.username in users) === false){
            let us = JSON.parse(
                fs.readFileSync(userPatDir)
            )
            u = us
        }
        c = 0
        u.name = user.username
        u.dirs = conf.dirs
        u.medias = {}
        u.dirs.forEach(
            dir=>{
                getFolderMediaContent(user,dir).then(
                    (val)=>{
                        u.medias[dir] = val ? val : []
                        if(c+1 === u.dirs.length){
                            conf.users[user.username] =  u
                            updateConf(conf)
                            getConf()
                        }
                        c++
                    },(error)=>{
                        c++
                        console.log(error)
                    }
                )
            }
        )
    }
getConf()
console.log('Tex media player')
console.log('Starting...')
console.log('Checking platform.......')
console.log(platform)
console.log('Updating files database.......')
// if (platform === 'linux') exec('sudo updatedb',(e)=>console.log(e ? 'an error happened :\n'+e : 'database updated...'))
console.log('Checking user infos.......')
console.log(user.username)
console.log('Configuring app.......')
console.log(`root dir for search song is : ${user.homedir}`)
let
    [users,dirs] = [conf.users , conf.dir]
    refreshUserData(user)
    
let 
    app = funcs.run_app(funcs)
app.app.commandLine.appendSwitch('js-flags', '--expose_gc --max-old-space-size=300000')
console.log('Configuration done.......')
console.log('*****---Enjoy---.....')
app.socket.on(
    'get medias data',
    (s,d)=>{
        s.reply(
            'medias data',
            getUserMedias()
        )
    }
)
app.socket.on(
    'refresh medias data',
    (s,d)=>{
        refreshUserData(user)       
        s.reply(
            'medias data',
            getUserMedias()
        )
    }
)
app.socket.on(
    'exit',
    (s,c)=>{
        process.exit(c)
    }
)
app.socket.on(
    'play media',
    (s,fn)=>{
        let medias = conf.users[user.username].medias
        for(var folder in medias){
            medias[folder].forEach(
                media=>{
                    let splitted = media.split('/')
                    ,name = splitted[splitted.length-1]
                    if (name === fn) {
                        data = fs.readFileSync(media)
                        
                        ffprobe(
                            media
                        ).then(
                            
                            infos=>s.reply(
                                'play media',
                                {data,name,fn:media,infos}
                            )
    
                            
                        
                        ).catch(
                        
                            infos=>s.reply(
                                'play media',
                                {data,name,fn:media,infos}
                            )
    
                        
                        )                       
                        
                    }

                }
            ) 
        }
    }
)