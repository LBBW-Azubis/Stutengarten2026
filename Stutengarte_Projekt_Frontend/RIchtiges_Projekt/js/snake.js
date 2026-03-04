const canvas=document.getElementById("snake")
const ctx=canvas.getContext("2d")

canvas.width=400
canvas.height=400

let snake=[{x:200,y:200}]
let food={x:100,y:100}

let dx=20
let dy=0

document.addEventListener("keydown",e=>{

if(e.key==="ArrowUp"){dx=0;dy=-20}
if(e.key==="ArrowDown"){dx=0;dy=20}
if(e.key==="ArrowLeft"){dx=-20;dy=0}
if(e.key==="ArrowRight"){dx=20;dy=0}

})

function game(){

ctx.clearRect(0,0,400,400)

snake.unshift({x:snake[0].x+dx,y:snake[0].y+dy})

if(snake[0].x===food.x && snake[0].y===food.y){

food={

x:Math.floor(Math.random()*20)*20,
y:Math.floor(Math.random()*20)*20

}

}else{

snake.pop()

}

ctx.fillStyle="green"

snake.forEach(s=>{

ctx.fillRect(s.x,s.y,20,20)

})

ctx.fillStyle="red"

ctx.fillRect(food.x,food.y,20,20)

}

setInterval(game,120)