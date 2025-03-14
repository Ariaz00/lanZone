const createLanRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");
const axios = require("axios"); // Pour les requêtes API

const prisma = new PrismaClient();

// Affichage de la page de création des LANs
createLanRouter.get("/createLan", authguard, (req, res) => {
    res.render("pages/createLan.twig", { current_page: 'createLan' });
});

// Gère la soumission pour créer une LAN
createLanRouter.post("/createLan", authguard, async (req, res) => {
    try {
        const { nom, date, lieu, latitude, longitude, description, materiel, nb_max_participants } = req.body;

        // Crée la LAN et lie l'utilisateur connecté comme organisateur
        await prisma.lan.create({
            data: {
                nom_lan: nom,
                date: new Date(date),
                lieu: lieu,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,  
                description: description,
                materiel: materiel,
                max_participants: parseInt(nb_max_participants), 
                organisateur: { connect: { id: req.session.utilisateur.id } }
            }
        });
        console.log("Lan créée avec succès !");
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Erreur lors de la création de la lan:", error);
        res.render("pages/createLan.twig", {
            error: "Une erreur est survenue lors de la création de la LAN.",
            current_page: 'createLan'
        });
    }
});

module.exports = createLanRouter;
