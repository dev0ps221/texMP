let 
    funcs = require('./functions')
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
                function (file) {
                    let newbase = path.join(base,file)
                    if ( fs.statSync(newbase).isDirectory() )
                    {
                        result = mediaList(newbase,ext,fs.readdirSync(newbase),result)
                    }
                    else
                    {
                        if ( file.substr(-1*(ext.length+1)) == '.' + ext )
                        {
                            result.push(newbase)
                        } 
                    }
                }
            )
        }catch(e){
            // console.log(e)
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
                let list = await mediaList(`${user.homedir}/${dir}`,'mp3') 
                return list
            }
    
        )(console,dir)
    }
    ,getUserMedias = ()=>{
        return conf.users[user.username].medias
    }
getConf()
console.log('Tex media player')
console.log('Starting...')
console.log('Checking platform.......')
console.log(platform)
console.log('Checking user infos.......')
console.log(user.username)
console.log('Configuring app.......')
console.log(`root dir for search song is : ${user.homedir}`)
let
    [users,dirs] = [conf.users , conf.dir]
    if((user.username in users) === false){
        let us = JSON.parse(
            fs.readFileSync(userPatDir)
        )
        ,u = us
        ,c = 0
        u.name = user.username
        u.dirs = conf.dirs
        u.dirs.forEach(
            dir=>{
                getFolderMediaContent(user,dir).then(
                    (val)=>{
                        u.medias[dir] = val ? val : []
                        if(c+1 === u.dirs.length){
                            conf.users[user.username] =  u
                            console.log(conf.users[user.username].medias)
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
let 
    app = funcs.run_app(funcs)
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
    'exit',
    (s,c)=>{
        process.exit(c)
    }
)
app.socket.on(
    'play song',
    (s,fn)=>{
        let medias = conf.users[user.username].medias
        for(var folder in medias){
            medias[folder].forEach(
                media=>{
                    let splitted = media.split('/')
                    ,name = splitted[splitted.length-1]
                    if (name === fn) s.reply(
                        'play song',
                        {data:fs.readFileSync(media),name}
                    )

                    
                }
            ) 
        }
    }
)