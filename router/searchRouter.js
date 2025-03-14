const searchRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");

const prisma = new PrismaClient();

searchRouter.get("/search", authguard, async (req, res) => {
    try {
        const { query } = req.query;

        // Validation de la session utilisateur
        if (!req.session.utilisateur || !req.session.utilisateur.id) {
            console.log("Utilisateur non connecté.");
            return res.redirect("/login");
        }

        const utilisateurId = req.session.utilisateur.id;

        console.log("Recherche effectuée :", query);
        console.log("ID de l'utilisateur :", utilisateurId);

        // Recherche des LANs organisées par l'utilisateur connecté
        const lansCreees = await prisma.lan.findMany({
            where: {
                organisateur_id: utilisateurId,
                OR: [
                    { nom_lan: { contains: query.toLowerCase() } },
                    { lieu: { contains: query.toLowerCase() } },
                    { description: { contains: query.toLowerCase() } }
                ]
            }
        });

        // Recherche de toutes les LANs (partagées par d'autres utilisateurs)
        const allLans = await prisma.lan.findMany({
            where: {
                OR: [
                    { nom_lan: { contains: query.toLowerCase() } },
                    { lieu: { contains: query.toLowerCase() } },
                    { description: { contains: query.toLowerCase() } }
                ]
            },
            include: { organisateur: true }
        });

        console.log("LANs créées trouvées :", lansCreees.length);
        console.log("Toutes les LANs trouvées :", allLans.length);

        res.render("pages/searchResults.twig", {
            lansCreees,
            allLans,
            query,
            title: "Résultats de recherche de LANs"
        });
    } catch (error) {
        console.log("Erreur lors de la recherche", error);
        res.status(500).send("Erreur lors de la recherche : " + error.message);
    }
});

module.exports = searchRouter;
