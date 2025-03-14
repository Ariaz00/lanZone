const accueilRouter = require ("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");

const prisma = new PrismaClient();

accueilRouter.get("/accueil", authguard, async (req, res)=>{
    
})

module.exports = accueilRouter