window.globos = {
    elem : document.querySelector('#globos')
    ,menu : {
        tabs : [
            {
                name:'open'
                ,options:[
                    'file'
                    ,'stream'
                ]
                ,tabs:[]
            }
            ,{
                name:'settings'
                ,options:[]
                ,tabs:[]
            }
            ,{
                name:'files'
                ,options:[]
                ,tabs:[]
            }
        ]
        ,actions : {
            show : (e)=>{
                let globos_style = window.getComputedStyle(e.target,'')
                ,references = {
                    top:globos_style.top
                    ,left:globos_style.left
                }
                ,elem_menu = window.globos.menu.elem
                elem_menu.style.position = 'absolute'
                elem_menu.style.top = `${parseInt(references.top.split('px')) + 10}px` 
                elem_menu.style.left = `${parseInt(references.left.split('px')) / 2}px`
                elem_menu.style.right = `${parseInt(references.left.split('px')) / 2}px`
                elem_menu.style.bottom = `${parseInt(references.left.split('px')) / 2}px`
                // elem_menu.style.left = `0`
                elem_menu.id = 'globos_menu'
                elem_menu.innerText = ""
                window.globos.menu.tabs.forEach(
                    tab=>{
                        let tab_elem = document.createElement('span')
                        tab_elem.className = 'globos_menu_tab'
                        tab_elem.innerText = tab.name
                        elem_menu.appendChild(tab_elem)
                        switch(tab.name){
                            case "open":
                                tab_elem.addEventListener('click',e=>document.querySelector(`#${tab.name}`).click(),false)
                                break
                            default:
                                break
                        }
                    }
                )
                window.globos.menu.state = 'visible'
                window.globos.elem.parentNode.insertBefore(elem_menu,window.globos.elem) 
            }
            ,hide : (e)=>{
                let elem_menu = window.globos.menu.elem
                window.globos.menu.state = 'hidden'
                window.globos.elem.parentNode.removeChild(elem_menu)
            }
        },
        state : 'hidden'
        ,elem : document.createElement('span')
    }    
}