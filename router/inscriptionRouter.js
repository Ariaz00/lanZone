const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");
const Reward = require("../services/reward");

const prisma = new PrismaClient();
const inscriptionRouter = express.Router();

// ✅ INSCRIPTION À UNE LAN
inscriptionRouter.post("/inscription/:lanId", authguard, async (req, res) => {
    try {
        const lanId = parseInt(req.params.lanId);
        const utilisateurId = req.session.utilisateur.id;

        const existingParticipant = await prisma.participant.findFirst({
            where: {
                utilisateur_id: utilisateurId,
                lan_id: lanId
            }
        });

        if (existingParticipant) {
            return res.status(400).send("Vous êtes déjà inscrit à cette LAN.");
        }

        await prisma.participant.create({
            data: {
                utilisateur_id: utilisateurId,
                lan_id: lanId,
                date_inscription: new Date()
            }
        });
        
        // ✅ Vérifier et attribuer un badge si nécessaire
        await Reward.applyReward(utilisateurId);

        console.log("Utilisateur inscrit avec succès !");
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Erreur lors de l'inscription à la LAN", error);
        res.status(500).send("Une erreur s'est produite.");
    }
});

// ✅ DÉSINSCRIPTION D'UNE LAN
inscriptionRouter.post("/desinscription/:lanId", authguard, async (req, res) => {
    try {
        const lanId = parseInt(req.params.lanId);
        const utilisateurId = req.session.utilisateur.id;

        const existingParticipant = await prisma.participant.findFirst({
            where: {
                utilisateur_id: utilisateurId,
                lan_id: lanId
            }
        });

        if (!existingParticipant) {
            return res.status(400).send("Vous n'êtes pas inscrit à cette LAN.");
        }

        await prisma.participant.deleteMany({
            where: {
                utilisateur_id: utilisateurId,
                lan_id: lanId
            }
        });
        
        // ✅ Vérifier si l'utilisateur doit perdre un badge
        await Reward.applyReward(utilisateurId);

        console.log("Utilisateur désinscrit avec succès !");
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Erreur lors de la désinscription de la LAN", error);
        res.status(500).send("Une erreur s'est produite.");
    }
});

module.exports = inscriptionRouter;
