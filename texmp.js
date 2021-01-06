let 
    $ = require('jQuery')
    ,{ipcRenderer} = require('electron')
    ,audio = new Audio()
    ,video = document.querySelector("#video_player")
    ,volbox = document.querySelector("#volume_box")
    ,progress_block = document.querySelector("#progress_block")
    ,playing = document.querySelector('#media_view_playing')
    ,medias = {}
    ,view ='audio'
    ,actuallyPlayingType = ''
    ,actuallyPlayingData = ''
    ,globos = window.globos
    ,menu = globos.menu
    ,now_playing = []
    ,n_playing = 0
    ,unique_loop = false
    ,streamArray
    ,open = document.createElement('input')
open.id = 'open'
open.accept = "audio/*;video/*"
open.type = "file"
open.style.display = 'none'
audio.loop = unique_loop
audio.volume = video.volume = 0.5
document.body.appendChild(open)
video.addEventListener(
    'timeupdate',
    (e)=>{
        document.querySelector('#progress').style.width = (((e.target.currentTime * 100)/(actuallyPlayingData.format.duration))+"%")
    },false
)
audio.addEventListener(
    'timeupdate',
    (e)=>{
        document.querySelector('#progress').style.width = (((e.target.currentTime * 100)/(actuallyPlayingData.format.duration))+"%")
    },false
)
audio.addEventListener(
    'ended',
    (e)=>{
        if(audio.loop==false){
            // playing = []
            // now_playing.forEach(
            //     p=>{
            //         if(p!==actuallyPlayingData.format.filename) playing.pop(p)
            //     }
            // )
            // now_playing = playing
            // alert(now_playing)
            // if(now_playing.length) {   
            //     if ($('.actual')[0]) $('.actual')[0].className = 'media'
            //     document.querySelectorAll('.media').forEach(
            //         media=>{
            //             if(media.innerText === now_playing[0]){
            //                 media.className+= " actual"
            //                 ipcRenderer.send(
            //                     'play media',
            //                     now_playing[0]
            //                 )
            //             }
            //         }
            //     )
            // }

            if(now_playing.length) {   
                n_playing++
                if ($('.actual')[0]) $('.actual')[0].className = 'media'
                document.querySelectorAll('.media').forEach(
                    media=>{
                        if(media.innerText === now_playing[n_playing]){
                            media.className+= " actual"
                            ipcRenderer.send(
                                'play media',
                                now_playing[n_playing]
                            )
                        }
                    }
                )
            }
        }else{

            


        }        
    },false
)
const
    listenArrow = e=>{
        processVol(0,e.key === 'ArrowDown'?audio.volume*10-1:e.key === 'ArrowUp'?audio.volume*10+1:audio.volume*10)
        if (actuallyPlayingData)
            if(e.key === 'ArrowLeft' || e.key === 'ArrowRight' ){
                let
                    position = (progress_block.getBoundingClientRect().width/100) * 2 * (e.key === 'ArrowRight'?1:-1)
                while (audio.currentTime + position < 0){
                    position = position + 5
                }
                while (audio.currentTime + position > actuallyPlayingData.format.duration){
                    position = position - 5
                }
                actuallyPlayingData.format.filename.match('mp3')!==null ? audio.currentTime = audio.currentTime + position : video.currentTime = video.currentTime + position
                position = 0
            }
    }
    ,listenLetter = e => {
        (e.key.toLocaleLowerCase().match('[a-z]')!==null) ? jumpToThatLetter(e.key) : pass
        e.preventDefault()
    }
    ,switchListeners=(zone)=>{
        switch(zone){
            case "media_view":
                document.removeEventListener(
                    'keydown',
                    listenArrow,
                    false
                )
                document.addEventListener(
                    'keydown',
                    listenLetter,
                    false
                )
                break
            case "play_view":
                document.removeEventListener(
                    'keydown',
                    listenLetter,
                    false
                )
                document.addEventListener(
                    'keydown',
                    listenArrow,
                    false
                )
                break
            default:
                console.log("How the heck did you come so far \ntexMP is :thinking: ...")
                break
        }
    }
    ,jumpToThatLetter = (l)=>{
        let 
            jumper = document.createElement('a')
        jumper.href="#that_letter"
        jumper.id ='jumper'
        jumper.style.display='none'
        document.body.appendChild(jumper)
        if(document.querySelector("#that_letter")) document.querySelector("#that_letter").id = ""
        document.querySelectorAll('#media_view_infos .media').forEach(
            media=>{
                if (media.innerText[0].toLocaleLowerCase() == l.toLocaleLowerCase()){
                    media.id = "that_letter"
                    return
                } 
            }
        )
        if (document.querySelector("#that_letter")){
            document.querySelector("#jumper").click()
            document.querySelector("#jumper").parentNode.removeChild(document.querySelector("#jumper"))
            document.querySelector("#that_letter").id = ""
        }
    }
    ,addToNowPlaying=(n)=>{
        now_playing.push(n)
        let
            label_nowPlaying = playing.firstElementChild
        playing.innerText = ""
        playing.appendChild(label_nowPlaying)
        now_playing.forEach(
        name=>{
                let 
                    elem = document.createElement('div')
                elem.className = 'media'
                elem.innerText = name
                playing.appendChild(elem)
            }
        )
    }
    ,initVolBox = ()=>{
        volbox.innerText=""
        let i = 10
        do {
            i--
            let volOption = document.createElement('span')
            volOption.className = 'volume_control' 
            volOption.className+= (parseInt(audio.volume*10)===i ? ' actual_vol' : (parseInt(audio.volume*10) > (i)) ? ' contained_vol' : '')
            volOption.id = i
            volOption.addEventListener(
                'click',
                e=>processVol(0,e.target.id)
                ,false
            )
            volOption.addEventListener(
                'mousedown',
                e=>processVol(0,e.target.id)
                ,false
            )
            volbox.appendChild(volOption)
        }while(i > 0)
        return i
    }
    ,processVol=(a,e)=>{
        e = e < 0 ? 0 : e > 10 ? 10 : e
        a < e ? a++ : a--
        if(a==e){
            let add = ((a*1)/10)
            audio.volume = add
            video.volume = add
            audio.volume = audio.volume.toFixed(1)
            video.volume = video.volume.toFixed(1)
            initVolBox()
            return e 
        }else{
            return processVol(a,e)
        }
    }
    ,processMediaOption=(e)=>{
        removeContextMenus()
        switch(e.target.className ){
            case 'play':
                if ($('.actual')[0]) $('.actual')[0].className = 'media'
                document.querySelectorAll('.media').forEach(
                    media=>{
                        if(media.innerText === e.target.parentNode.id){
                            media.className+= " actual"
                            ipcRenderer.send(
                                'play media',
                                e.target.parentNode.id
                            )
                        }
                    }
                )
            break
            case 'inplay':
                addToNowPlaying(e.target.parentNode.id)
                if ($('.actual')[0]) $('.actual')[0].className = 'media'
                if(now_playing.length===1){
                    document.querySelectorAll('.media').forEach(
                        media=>{
                            if(media.innerText === now_playing[n_playing]){
                                media.className+= " actual"
                                ipcRenderer.send(
                                    'play media',
                                    now_playing[n_playing]
                                )
                            }
                        }
                    )    
                }
            default:
            break
        }
    }
    ,removeContextMenus=()=>{
        document.querySelectorAll('.contextmenu').forEach(
            menu=>menu.parentNode.removeChild(menu)
        )
    }
    ,mediaContextMenu = (e)=>{
        removeContextMenus()
        let contextmenu = document.createElement('div')
        contextmenu.className ='contextmenu'
        contextmenu.id = e.target.innerText
        let play = document.createElement('div')
        play.className = 'play'
        play.innerText ='play'
        play.addEventListener(
            'click'
            ,processMediaOption
            ,false
        )
        contextmenu.appendChild(play)
        let inplay = document.createElement('div')
        inplay.className = 'inplay'
        inplay.innerText ='ajouter a la lecture courante'
        inplay.addEventListener(
            'click'
            ,processMediaOption
            ,false
        )
        contextmenu.appendChild(inplay)
        let inplaylist = document.createElement('div')
        inplaylist.className = 'inplaylist'
        inplaylist.innerText ='ajouter a une playlist'
        inplaylist.addEventListener(
            'click'
            ,processMediaOption
            ,false
        )
        contextmenu.appendChild(inplaylist)
        contextmenu.style.position = 'absolute'
        contextmenu.style.left= '30%'
        contextmenu.style.top = `${e.clientY-5}px`
        document.body.appendChild(contextmenu)
    }
    ,playSingle = (d,n,fn,infos)=>{
        actuallyPlayingData = infos
        if(now_playing[now_playing.length-1] !== n)
            addToNowPlaying(n)
        let dView = new Uint8Array(d.length)
        for (let i = 0; i < d.length; i++) {
            dView[i] = d[i];
        }
        let blob = new Blob([dView], { type: "text/plain;charset=utf-8" })
        ,blobUrl = URL.createObjectURL(blob)    
        if (n.match(/.mp3/) === null){
            $('#media_name')[0].innerText = n
            actuallyPlayingType = 'video'
            video.setAttribute("src", blobUrl);
            video.play ? video.play() : false
            // if(video.parentNode.requestFullscreen) video.parentNode.requestFullscreen()
            // .then(r=>console.log('fullscreen results : ',r))
            // .catch(e=>console.log('fullscreen error : ',e))
            video.controls = 1
            document.querySelector('#play_controls').style.display = 'none'
            audio.pause()
            audio.currentTime = 0;
            audio.src = ''
            return video
        }else{
            video.controls = 0
            document.querySelector('#play_controls').style.display = 'inline-table'
            $('#media_name')[0].innerText = n
            actuallyPlayingType = 'audio'
            audio.setAttribute("src", blobUrl);
            audio.play()
            video.pause ? video.pause() : false
            video.currentTime = 0;
            video.innerText = ""
            ipcRenderer.send(
                'get metadata',fn
            )
            return audio
        }
        
    }
    ,changeView = (e)=>{


        view = e.target.id ==='audio' | e.target.id ==='video' ?  e.target.id : view
        

        ipcRenderer.send(
            'get medias data',
            {}
        )

    }
    ,showMenu = (e) => {

    }
    ,hideMenu = (e) => {

    }
    ,openMedia = (e)=>{
        if(e.target.files.length){
            let {name,size,type,path} = e.target.files[0]
            ipcRenderer.send(
                'play opened media'
                ,{
                    name,
                    media :  path
                }
            )
        }
    }
ipcRenderer.send(
    'get medias data',
    {}
)
ipcRenderer.on(
    'medias data',
    (s,meds)=>{
        medias = meds
        $('#media_view_infos')[0].innerText = ""
        for(var folder in medias){
            let folderLabel = document.createElement('h4')
            folderLabel.className = 'media_folder'
            folderLabel.innerText = folder 
            medias[folder].length ? $('#media_view_infos')[0].appendChild(folderLabel) : folderLabel = undefined
            medias[folder].sort()
            medias[folder].forEach(
                media=>{
                    let 
                        splitted = media.split('/')
                        ,name = splitted[splitted.length-1]
                        if(view=='audio'||view=='video') if(name.match(view=='audio'? /.mp3/ : /.mp4|.avi|.mov/) && !name.split(view=='audio'?/.mp3/:/.avi|.mp4|.mov/)[1]){
                            let elem = document.createElement('div')
                            elem.className = 'media'
                            elem.innerText = name
                            elem.addEventListener(
                                'contextmenu'
                                ,mediaContextMenu
                                ,false
                            )

                            elem.addEventListener(
                                'click'
                                ,(e)=>removeContextMenus()
                                ,false
                            )
                            elem.addEventListener(
                                'dblclick'
                                ,(e)=>{
                                    removeContextMenus()
                                    now_playing = []
                                    if ($('.actual')[0]) $('.actual')[0].className = 'media'
                                    
                                    e.target.className+= " actual"
                                    ipcRenderer.send(
                                        'play media',
                                        e.target.innerText
                                    )
                                }
                                ,false
                            )
                            $('#media_view_infos')[0].appendChild(elem)
                        }
                        
                        
                    
                }
            )
        }
    }
)
$('#play')[0].addEventListener(
    'click',
    (e)=>{
        if(actuallyPlayingType === 'audio'){
            if(audio.src !== '' && $('#media_name')[0].innerText!=='No Song Playing...'){
                 audio.play()
                 video.pause()
                 video.currentTime = 0
             }
        }
        else{
            if(video.src !== '' && $('#media_name')[0].innerText!=='No Song Playing...'){
                video.play()
                audio.pause()
                audio.currentTime = 0
            }
        }
    },
    false
)
$('#pause')[0].addEventListener(
    'click',
    (e)=>{
        if(actuallyPlayingType === 'audio'){
            if(audio.src !== '' && $('#media_name')[0].innerText!=='No Song Playing...'){
                audio.pause()
                video.pause()
                video.currentTime = 0
            }
        }else{
            if(video.src !== '' && $('#media_name')[0].innerText!=='No Song Playing...'){
                video.pause()
                audio.pause()
                audio.currentTime = 0
            }
        }
    },
    false
)
$('#stop')[0].addEventListener(
    'click',
    (e)=>{
        if(actuallyPlayingType === 'audio'){
            audio.currentTime = 0 
            audio.pause()
        }else{
            video.currentTime = 0 
            video.pause()
        }

    }
    ,false
)
$('#repeat')[0].addEventListener(
    'click',
    (e)=>{
        if(actuallyPlayingType){
            e.target.parentNode.className = 'little control_box' + ((unique_loop) ? '  orangered' : '')
            if(actuallyPlayingType === 'audio'){
                audio.loop = audio.loop ? false : true
                unique_loop = audio.loop
            }else{
                video.loop = video.loop ? false : true
                unique_loop = video.loop
            }
        }

    }
    ,false
)
$('#refresh')[0].addEventListener(
    'click',
    (e)=>{
        ipcRenderer.send(
            'refresh medias data',
            {}
        )       
    },
    false
)
ipcRenderer.on(
    'play media',
    (s,{data,name,fn,infos})=>{
        playSingle(data,name,fn,infos)
    }
)
ipcRenderer.on(
    'lmedia stream reception start'
    ,(s,size)=>{
        streamArray = new Uint8Array(size)
    }
    ,false
)
ipcRenderer.on(
    'lmedia stream reception',
    (s,data)=>{
        for (var i = 0; i < data.length;i++) streamArray[i] = data[i]
    }
)
ipcRenderer.on(
    'lmedia stream reception end',
    (s,{data,name,fn,infos})=>{

        let 
            blob = new Blob([streamArray], { type: "text/plain;charset=utf-8" })
            ,blobUrl = URL.createObjectURL(blob)    
            ,n = name

        actuallyPlayingData = infos

        if(now_playing[now_playing.length-1] !== n)
            addToNowPlaying(n)
        if (n.match(/.mp3/) === null){
            $('#media_name')[0].innerText = n
            actuallyPlayingType = 'video'
            video.setAttribute("src", blobUrl);
            video.play ? video.play() : false
            audio.pause()
            audio.currentTime = 0;
            audio.src = ''
            return video
        }else{
            $('#media_name')[0].innerText = n
            actuallyPlayingType = 'audio'
            audio.setAttribute("src", blobUrl);
            audio.play()
            video.pause ? video.pause() : false
            video.currentTime = 0;
            video.innerText = ""
            ipcRenderer.send(
                'get metadata',fn
            )
            return audio
        }
    }
)
document.querySelectorAll('.view_label').forEach(
    tab=>{
        tab.addEventListener(
            'click',
            changeView,
            false
        )
    }
)
globos.elem.addEventListener(
    'click',
    e=>menu.actions[menu.state === 'visible'?'hide':'show'](e)
    ,
    false
)
progress_block.addEventListener(
    'click',
    e=>{
        if(actuallyPlayingData){
            let 
                zero = e.target.getBoundingClientRect().left
                ,distance = zero - e.clientX 
                ,un = e.target.getBoundingClientRect().width/100
                ,pourcent = ~(distance/un)
                pourcent = pourcent < 1 ? 0 : pourcent > 100 ? 100 : pourcent
                document.querySelector('#progress').style.width = `${parseInt(pourcent)}%`
            let
                position = (pourcent * actuallyPlayingData.format.duration) / 100
                
            actuallyPlayingData.format.filename.match('mp3')!==null ? audio.currentTime = position : video.currentTime = position
        }
    }
    ,false
)
if(initVolBox()){
    console.log(
        'Welcome to TexMP v0.1\nTek-Tech vous remercie de votre confiance :)'
    )
}
document.addEventListener(
    'keydown',
    listenArrow
    ,false
)
document.addEventListener(
    'fullscreenchange'
    ,e=>{
        if(document.fullscreenElement){
            let 
                exit = document.createElement('span')
            exit.id = 'fullscreen_exit'
            exit.innerText = "X"
            exit.style.position = 'absolute'
            exit.style.top = "2%"
            exit.style.left = "2%"
            exit.style.zIndex = 100
            document.fullscreenElement.parentNode.appendChild(exit)
            exit.addEventListener(
                'click'
                ,e=>{
                    document.exitFullscreen()
                    .then(()=>{console.log('exited fullscreen niceyly ;)')})
                    .catch(e=>console.log('exiting fullscreen error : ',e))
                    e.target.parentNode.removeChild(e.target)
                }
                ,false
            )
            video.parentNode.style.maxHeight = '100%'
            video.parentNode.style.height = '100%'
            video.style.position = 'absolute'
            video.style.top = 0
            video.style.left = 0
            video.style.backgroundSize = `${video.parentNode.width} ${video.parentNode.height}`
        }else{
            alert('way')
            // video.controls = 0
            video.parentNode.style.maxHeight = '80%'
            video.parentNode.style.height = '80%'
            video.style.position = 'relative'
            video.style.backgroundSize = 'cover'
            video.style.top = 'auto'
            video.style.left = 'auto'
        }
    }
    ,false
)
document.querySelector("#media_view").addEventListener(
    "mouseover"
    ,e=>{
        switchListeners("media_view")
    }
    ,false
)
document.querySelector("#play_view").addEventListener(
    "mouseover"
    ,e=>{
        switchListeners("play_view")
    }
    ,false
)
open.addEventListener(
    'change'
    ,openMedia
    ,false
)   

// video.addEventListener(
//     'click'
//     ,e=>{
//         if(document.fullscreenElement){
//             document.exitFullscreen()
//             .then(()=>{console.log('exited fullscreen niceyly ;)')})
//             .catch(e=>console.log('exiting fullscreen error : ',e))
//             document.querySelector('#fullscreen_exit').parentNode.removeChild(document.querySelector('#fullscreen_exit'))
//         }else{
//             video.parentNode.requestFullscreen()
//             .then(r=>console.log('fullscreen results : ',r))
//             .catch(e=>console.log('fullscreen error : ',e))
//         }
//     }
//     ,false
// )