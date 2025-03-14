const logoutRouter = require("express").Router();
const { PrismaClient, Prisma } = require("@prisma/client");
const authguard = require("../services/authguard");

const prisma = new PrismaClient();

logoutRouter.post("/logout", (req,res)=>{
    req.session.destroy()
    res.redirect("/login")
})

module.exports = logoutRouter