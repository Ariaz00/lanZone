const loginRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

loginRouter.get("/login", async(req, res)=>{
    res.render("pages/login.twig", { current_page: 'login' });
})

loginRouter.post("/login", async(req, res)=>{
   try {
    const utilisateur = await prisma.utilisateur.findUnique({
        where: { pseudo: req.body.pseudo }
    });

    if (utilisateur){
        const isPasswordCorrect = await bcrypt.compare(req.body.password, utilisateur.password);
        if (isPasswordCorrect){
            req.session.utilisateur = {
                id: utilisateur.id,
                pseudo: utilisateur.pseudo,
                role: utilisateur.role
            };
            return res.redirect("/dashboard");
        } else{
            throw { password: "Mot de passe incorrect" };
        }
    } else{
        throw { pseudo: "Pseudo inexistant" };
    }
   } catch (error) {
        console.log(error);
        res.render("pages/login.twig", {
            error,
            current_page: 'login'
        });
   }
});

module.exports = loginRouter