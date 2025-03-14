const express = require("express");
const session = require("express-session");
const userRouter = require("./router/userRouter");
const loginRouter = require("./router/loginRouter");
const registerRouter = require("./router/registerRouter");
const dashboardRouter = require("./router/dashboardRouter");
const accueilRouter = require("./router/accueilRouter");
const logoutRouter = require("./router/logoutRouter");
const createLanRouter = require("./router/createLanRouter");
const searchRouter = require("./router/searchRouter");
const inscriptionRouter = require("./router/inscriptionRouter");

const app = express();
app.use(express.static("./public"))
app.use(express.urlencoded({extended:true})) // avant le router on lit les contenus des forms
app.use(session({
    secret: "hfjkdshbklsqmk,!:!kerpozn:;kjk'_è-è34",
    resave:true, // durée de vie, tant qu'on fait des choses sur le site ça le refresh
    saveUninitialized:true
}))


app.use(userRouter)
app.use(loginRouter)
app.use(registerRouter)
app.use(dashboardRouter)
app.use(accueilRouter)
app.use(logoutRouter)
app.use(createLanRouter)
app.use(searchRouter)
app.use(inscriptionRouter)

app.listen(3000, ()=>{
    console.log("Connecté sur le port 3000");
})