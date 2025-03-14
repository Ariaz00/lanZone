const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const authguard = async(req, res, next) => {
    try {
        if(req.session.utilisateur) {
            let utilisateur = await prisma.utilisateur.findUnique({
                where:{
                    id: req.session.utilisateur.id
                }
            });

            if(utilisateur){
                return next();
            }

            throw { authguard : "Utilisateur non connecté" };
        }
    } catch (error) {
        res.redirect("/login")
    }
}

module.exports = authguard