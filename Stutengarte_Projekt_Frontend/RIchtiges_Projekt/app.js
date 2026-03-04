let historyStack=[]

function loadPage(page){

historyStack.push(page)

fetch("pages/"+page+".html")

.then(res=>res.text())

.then(html=>{

document.getElementById("app").innerHTML=html

})

}

document.getElementById("back").onclick=()=>{

historyStack.pop()

let last=historyStack.pop()

if(last) loadPage(last)

}

document.getElementById("close").onclick=()=>{

document.body.innerHTML="<h1 style='text-align:center;margin-top:40vh'>Tschüss!</h1>"

}

loadPage("login")

/* Hacker Angriff alle 3 Minuten */

setInterval(()=>{

alert("⚠ Die Bank wurde gehackt! Drücke OK um die Bank zu retten!")

loadPage("hacker")

},180000)