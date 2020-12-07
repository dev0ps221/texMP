const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let fs = require('fs')
class Tables{
    show(conditions,call,table){
        try{
            let rows = JSON.parse(fs.readFileSync(`./tables/${table}.json`)).rows
            let f = []
            rows.forEach(
                row=>{
                    conditions.length != 0 ? conditions.forEach(
                        cond=>{
                            for(let condition in cond){
                                for(var r in row){
                                    if(row[r][condition] && row[r][condition] == cond[condition]){
                                        f.push(row)
                                    }
                                }
                            }
                        }
                    ) : f.push(row)
                }
            )
            if(f.length){
                call(0,f)
            }else{
                this.errr('not found',"",call)
            }
        }catch(e){
            this.errr(e,"",call)
        }
    }
    describe(table,call,opt=""){
        try{
            call(0,JSON.parse(fs.readFileSync(`./tables/${table}.json`)))
        }catch(e){
            this.errr(e,"",call)
        }
    }
    create(table,call,opt=""){
        this.insert(table,call,opt)
    }
    insert(table=false,call,tables=""){
        this.syncDown()
        let ret
        if(ret =  table != false ){
            if(tables == "") { 
                if(this.tables.length ){ 
                    this.tables.forEach(
                        tbl=>{
                            if (tbl.name == 'tables'){
                                this.exec(`touch ./tables/${tbl.name}.json && ls ./tables`,(e,res,err)=>{
                                    if(!e && !err){
                                        fs.writeFileSync(`./tables/${tbl.name}.json`,JSON.stringify(tbl))
                                        fs.writeFileSync(`./tables/tables.json`,JSON.stringify(this.tables))
                                        call(0,"insert done ..")
                                    }
                                })
                            }
                        }
                    ) 
                }else{ 
                    let tables = {
                        name : "tables",
                        fields : [
                            {
                                name:'name',
                                options:['text']
                            },
                            {
                                name:'fields',
                                options:['array']
                            },
                            {
                                name:'rows',
                                options:['array']
                            }
                        ],
                        rows:[
                        ]
                    }
                    this.tables = tables
                    if(tables.rows.indexOf(table.name) == -1){
                        tables.rows.push(table.name)
                        this.exec(`touch ./tables/${table.name}.json && ls ./tables`,(e,res,err)=>{
                            if(!e && !err){
                                fs.writeFileSync(`./tables/${table.name}.json`,JSON.stringify(table))
                                fs.writeFileSync(`./tables/${tables.name}.json`,JSON.stringify(tables))
                                call(0,"insert done .")
                            }else{
                                this.errr(e?e:err,"",call)
                            }
                        })
                    }else{
                        this.errr("table does exists","",call)
                    }
                }
            }else{
                let tbl = JSON.parse(fs.readFileSync(`./tables/${tables}.json`)) 
                tbl.rows.push(table)
                fs.writeFileSync(`./tables/${tables}.json`,JSON.stringify(tbl))
                call(0,"insert done .")           
            }
        }else this.errr('wrong input !!',"",call=call)
        this.syncUp()
    }
    update({values,conditions},call,table){
        try{
            let tab = JSON.parse(fs.readFileSync(`./tables/${table}.json`))
            let rows = tab.rows
            let f = []
            rows.forEach(
                row=>{
                    let ok = 1
                    conditions.length != 0 ? conditions.forEach(
                        cond=>{
                            for(let condition in cond){
                                for(var r in row){
                                    if(row[r][condition] !== undefined){
                                        if(!(row[r][condition] == cond[condition])){
                                            ok = 0
                                        }
                                    }
                                }
                            }
                        }
                    ) : false
                    if(conditions.length != 0 && ok) f.push(row)
                }
            )
            if(f.length){
                for(var value in f[0]){
                    for(var val in values){
                        if(value === val){
                            let r = 0
                            rows.forEach(
                                row=>{
                                    if(row===f[0]){
                                        tab.rows[r][value] = values[val]
                                    }
                                    r++
                                }
                            )
                        }
                    }
                }
                fs.writeFileSync(`./tables/${table}.json`,JSON.stringify(tab))
                console.log("update done .")
            }else{
                this.errr('not found',"",call)
            }
        }catch(e){
            this.errr(e,"",call)
        }
    }
    remove(conditions,call,table){
        try{
            let tab = JSON.parse(fs.readFileSync(`./tables/${table}.json`))
            let rws = [] 
            let rows = tab.rows
            let f = []
            rows.forEach(
                row=>{
                    let ok = 1
                    conditions.length != 0 ? conditions.forEach(
                        cond=>{
                            for(let condition in cond){
                                for(var r in row){
                                    if(row[r][condition] !== undefined){
                                        if((row[r][condition] !== cond[condition])){
                                            ok = 0
                                        }
                                    }
                                }
                            }
                        }
                    ) : false
                    if(conditions.length != 0 && ok) f.push(row)
                }
            )
            if(f.length){
                rows.forEach(
                    row=>{
                        if(row!==f[0]){
                            rws.push(row)
                        }
                    }
                )
                    
                tab.rows = rws
                fs.writeFileSync(`./tables/${table}.json`,JSON.stringify(tab))
                console.log("update done .")
                call(0,"update done .")
            }else{
                this.errr('not found',"",call)
            }
        }catch(e){
            console.log(e)
            this.errr(e,"",call)
        }
    }
    syncUp(){
        fs.writeFileSync(this.tables_link,JSON.stringify(this.tables))
    }
    syncDown(){
        this.tables = JSON.parse(fs.readFileSync(this.tables_link))
    }
    errr(err="erreur : ",mes=" ",call=false){
        call ? call(err,0)
        : console.error(err,mes)
    }
    process(res="",call=(e,r)=>console.log('PersoDb> RESULTS:\n',(!e)?(r):(e))){
        let opt = ""
        let entree = res.split(' ')
        let a = entree.shift().toLowerCase()
        let ret = this.errr
        let table
        let conditions = []
        let conds = ""
        if(a!==""){
            let go = false
            if(typeof this[a] === 'function'){
                go = true
                let entry = false
                switch(a){
                    case "create" || "CREATE":   
                        let name =  entree[0]
                        let fields = []
                        let rows = []
                        entree = res.split(',')
                        entree[0] = entree[0].replace(`${a}`,"")
                        entree[0] = entree[0].replace(`${name}`,"").trim()
                        entree.forEach(
                            e=>{
                                let ae = e.split(" ")
                                let name = ae[0]
                                fields.push(
                                    {
                                        name:ae.shift(),
                                        options : ae
                                    }
                                )
                            }
                        )
                        entry = {
                            name,rows,fields
                        }
                        break
                    case "insert" || "INSERT":
                        if (res.match('INTO')!=null){
                            table = res.split('INTO')[1].trim().split(' ')[0]
                        }else if (res.match('into')!=null){
                            table = res.split('into')[1].trim().split(' ')[0]
                        }else{
                            table = false
                            go = false
                        }
                        if(table){
                            let values = res.split(table)[1].split(',')
                            let f_values = []
                            values.forEach(
                                value=>{
                                    value = value.trim()
                                    let v = {}
                                    v[value.split(' ')[0]] = value.split(' ')[1]
                                    f_values.push(v)
                                }
                            )
                            opt = table
                            entry = f_values
                        }
                        break
                    case "update" || "UPDATE":
                        if (res.match('UPDATE')!=null){
                            table = res.split('UPDATE')[1].trim().split(' ')[0]
                        }else if (res.match('update')!=null){
                            table = res.split('update')[1].trim().split(' ')[0]
                        }else{
                            console.log('fila')
                            table = false
                            go = false
                        }
                        conditions = []
                        conds = ""
                        if(res.match('WHERE') !== null){
                            conds = res.split('WHERE')[1]
                            res = res.split('WHERE')[0]
                        }else if(res.match('where') !== null){
                            conds = res.split('where')[1]
                            res = res.split('where')[0]
                        }else{
                            table = false
                            go = false
                        }
                        if(table){

                            let values = conds.trim().split(',')
                            let f_values = []
                            values.forEach(
                                value=>{
                                    value = value.trim()
                                    let v = {}
                                    v[value.split(' ')[0]] = value.split(' ')[1]
                                    f_values.push(v)
                                }
                            )
                            conditions = f_values

                            values = res.split(table)[1].split(',')
                            f_values = []
                            values.forEach(
                                value=>{
                                    value = value.trim()
                                    let v = {}
                                    v[value.split(' ')[0]] = value.split(' ')[1]
                                    f_values.push(v)
                                }
                            )
                            opt = table
                            entry = {conditions,values:f_values}
                        }
                        break
                    case "remove" || "REMOVE":
                        if (res.match('from')!=null){
                            table = res.split('from')[1].trim().split(' ')[0]
                        }else if (res.match('FROM')!=null){
                            table = res.split('FROM')[1].trim().split(' ')[0]
                        }else{
                            table = false
                            go = false
                        }
                        if (conditions !== undefined) {
                            conditions = []
                        }else{
                            conditions = []
                        }
                        conds = ""
                        if(res.match('WHERE') !== null){
                            conds = res.split('WHERE')[1]
                            res = res.split('WHERE')[0]
                        }else if(res.match('WHERE') !== null){
                            conds = res.split('where')[1]
                            res = res.split('where')[0]
                        }else{
                            table = false
                            go = false
                        }
                        if(table){

                            let values = conds.trim().split(',')
                            let f_values = []
                            values.forEach(
                                value=>{
                                    value = value.trim()
                                    let v = {}
                                    v[value.split(' ')[0]] = value.split(' ')[1]
                                    f_values.push(v)
                                }
                            )
                            conditions = f_values
                            opt = table
                            entry = conditions
                        }
                        break
                    case "show" || "SHOW":
                        if (res.match('FROM')!=null){
                            table = res.split('FROM')[1].trim().split(' ')[0]
                        }else if (res.match('from')!=null){
                            
                            table = res.split('from')[1].trim().split(' ')[0]
                        }else{
                            go = false
                        }
                        if(table){
                            conditions =  res.split(table)[1].trim().split(',')
                            let f_conditions = []
                            conditions.forEach(
                                cond=>{
                                    cond = cond.trim()
                                    let c = {}
                                    c[cond.split(' ')[0]] = cond.split(' ')[1]
                                    cond.split(' ')[1] !== undefined ? f_conditions.push(c) : false
                                }
                            )
                            opt = table
                            entry = f_conditions
                        }    
                        break
                    case "describe" || "DESCRIBE":
                        entry = res.match('DESCRIBE') !== null ? res.split('DESCRIBE')[1].trim().split(' ')[0] : res.match('describe') !== null ? res.split('describe')[1].trim().split(' ')[0] : false
                        break
                    default:
                        break                    
                }
                ret = go ? this[a](
                    entry,(e,r)=>{
                        call(e,r)
                    },opt
                ) : 
                    ret('Une erreur non comprise est survenue !!\n')
            }else{
                ret = ret('Avertissement !\n',"Cette commande n'est pas comprise : [["+a+"]]")
            }
        }
        return ret
    }
    async prompt(p='owner@PersoDb >'){
        rl.question(
            p,
            (a)=>{
                this.process(
                    a,
                    (e,r)=>console.log('PersoDb> RESULTS:\n',(!e)?(r):(e))
                )
                
                this.syncUp()
                this.syncDown()
                this.prompt()
            }
        )
    }
    constructor(tables,{exec}=require('child_process')){
        this.tables = []
        this.exec = exec
        this.tables_link = tables
        this.syncDown
    }
}
module.exports = Tables