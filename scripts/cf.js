let cfVersion = "0.1"

console.log(
    `createForm v ${cfVersion}\n`,
    'Auteur :   El Hadji Seybatou Mbengue\n',
    "Rocking..."
)
let cfIssue = (i,m) => {
    console.log(
    `createForm v ${cfVersion}\n`,
    `'issue < ${i} > : "${m}"'` 
    )
    return null
}
window.addEventListener(
    'load',
    e=>{
        (
            ()=>{
                window.createForm = (parent,fields=[],opts=[])    =>  {
                    let addField = (form,f,opts=[]) => {
                        let container = document.createElement('div')
                        container.className = 'cf-form-field-container'
                        let label = document.createElement('span')
                        label.className = 'cf-form-label'
                        label.innerText = f.label
                        let field =  document.createElement(
                            f.tag === 'input'   ?   
                            'input' 
                            :
                            f.tag === 'select'   ?   
                            'select'
                            :
                            'textarea' 
                        )
                        field.className = 'cf-form-field'+(f.type === "submit" ? " cf-form-submit" : "")
                        field.name = f.name
                        field.type  =   f.tag !== 'textarea' && f.tag !== 'select' ? f.type : ""
                        if  (f.tag === 'select' && f.select_options){
                            f.select_options.forEach(
                                opt=>{
                                    let option = document.createElement('option')
                                    option.value = opt.value
                                    option.name = opt.name
                                    option.innerText = opt.text
                                    field.appendChild(option)
                                }
                            )
                        }
                        if  (f.type === 'submit'){
                            field.value = f.text
                        }
                        opts.forEach(
                            opt =>   field[opt[0]] = opt[1]
                        )
                        if (f.type !== 'submit') container.appendChild(label)
                        container.appendChild(field)
                        form.appendChild(container)
                    }
                    let form = document.createElement(
                        'form'
                    )
                    opts.forEach(
                        opt =>   form[opt[0]] = opt[1]
                    )
                    form.className = 'cf-form'
                    fields.forEach(
                        field   =>  addField(form,field)
                    )
                    if (document.querySelectorAll(parent)[0]) return (
                        (form,parent)=>{
                            document.querySelector(parent).appendChild(form)
                            let elem = form
                            return {
                                elem,
                                addField
                            }
                        }
                    ) (form,parent)
                    else return cfIssue(
                        'argument invalide :',
                        "Le selecteur recu ne correspond a aucun element du D.O.M."
                    )
                }                  
            }
        )()
    }
)