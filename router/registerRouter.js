const registerRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const bcrypt = require ("bcrypt");

const prisma = new PrismaClient().$extends(hashPasswordExtension)

registerRouter.get("/register", (req, res)=>{
    res.render("pages/register.twig", { current_page: 'register'});
});

registerRouter.post("/register", async (req, res)=>{
    try {
        if(req.body.password === req.body.confirm_password){
            const existingUser = await prisma.utilisateur.findUnique({
                where:{
                    mail: req.body.mail
                }
            });
            if (existingUser){
                throw new Error("Cet email est déjà utilisé");
            }

            const existingPseudo = await prisma.utilisateur.findUnique({
                where:{
                    pseudo: req.body.pseudo
                }
            });
            if (existingPseudo){
                throw new Error("Ce pseudo est déjà utilisé");
            }

            //Création d'un nouvel utilisateur dans la db
            const utilisateur = await prisma.utilisateur.create({
                data:{
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    date_naissance: new Date(req.body.date_naissance),
                    mail: req.body.mail,
                    pseudo: req.body.pseudo,
                    password: req.body.password,
                    role: 'utilisateur' //rôle par défaut
                }
            });

            req.session.utilisateur = {
                id: utilisateur.id,
                mail: utilisateur.mail,
                pseudo: utilisateur.pseudo,
                role: utilisateur.role
            };

            console.log("Utilisateur créé avec succès !", utilisateur);
            return res.redirect("/dashboard");
        }
        else{
            throw new Error("Les mots de passe ne correspondent pas");
        }
    } catch (error) {
        console.log(error);
        return res.render("pages/register.twig", { error: error.message, current_page: 'register'});
    }
});

module.exports = registerRouter