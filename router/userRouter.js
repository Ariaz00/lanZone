const userRouter = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authguard = require('../services/authguard');

const prisma = new PrismaClient();

userRouter.get("/profil", authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findUnique({
            where: {
                id: req.session.utilisateur.id
            },
            include: {
                lan_crees: true,
                participations: { include: { lan: true } },
                materiels: { 
                    include: { 
                        materiel: true 
                    } 
                },
                badges: {
                    include: {
                        badge: true
                    }
                }
            }
        });
        console.log("Matériels récupérés :", utilisateur.materiels);
        console.log("Badges récupérés :", utilisateur.badges);
        

        if (utilisateur) {
            return res.render("pages/profil.twig", {
                current_page: 'profil',
                utilisateur: utilisateur,
                lan_crees: utilisateur.lan_crees,
                participations: utilisateur.participations,
                materiels: utilisateur.materiels,
                badges: utilisateur.badges.map(b => b.badge)
            });
        }
        res.redirect("/login");
    } catch (error) {
        console.log(error);
        res.redirect("/login");
    }
});

// userRouter.post("/inscription/:lanId", authguard, async (req, res) => {
//     try {
//         const lanId = parseInt(req.params.lanId);
//         const utilisateurId = req.session.utilisateur.id;

//         const existingParticipant = await prisma.participant.findFirst({
//             where: {
//                 utilisateur_id: utilisateurId,
//                 lan_id: lanId
//             }
//         });

//         if (existingParticipant) {
//             return res.status(400).send("Vous êtes déjà inscrit à cette LAN.");
//         }
//         const date_inscription = new Date();
//         // Créer la participation
//         const newParticipation = await prisma.participant.create({
//             data: {
//                 utilisateur_id: utilisateurId,
//                 lan_id: lanId,
//                 date_inscription: date_inscription
//             }
//         });

//         console.log("Utilisateur inscrit à la LAN avec succès:", newParticipation);
//         res.redirect("/profil");
//     } catch (error) {
//         console.log("Erreur lors de l'inscription à la LAN:", error);
//         res.status(500).send("Une erreur s'est produite.");
//     }
// });

// userRouter.get("/desinscription/:lanId", authguard, async (req, res) => {
//     try {
//         const lanId = parseInt(req.params.lanId);
//         const utilisateurId = req.session.utilisateur.id;

//         await prisma.participant.deleteMany({
//             where: {
//                 utilisateur_id: utilisateurId,
//                 lan_id: lanId
//             }
//         });
//         console.log("Utilisateur désinscrit de la LAN avec succès");
//         res.redirect("/dashboard");
//     } catch (error) {
//         console.log("Erreur lors de la désinscription de la LAN:", error);
//         res.status(500).send("Une erreur s'est produite.");
//     }
// });

userRouter.get("/profil/modify", authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findUnique({
            where: {
                id: req.session.utilisateur.id
            }
        });

        if (utilisateur) {
            return res.render("pages/modifyProfile.twig", {
                current_page: 'modifyProfile',
                utilisateur: utilisateur
            });
        }
        res.redirect("/login");
    } catch (error) {
        console.log(error);
        res.redirect("/login");
    }
});

userRouter.post("/profil/modify", authguard, async (req, res) => {
    try {
        const { email, nom, pseudo } = req.body;
        const utilisateurId = req.session.utilisateur.id;

        const updatedUtilisateur = await prisma.utilisateur.update({
            where: { id: utilisateurId },
            data: {
                email: email,
                nom: nom,
                pseudo: pseudo
            }
        });

        console.log("Informations mises à jour avec succès:", updatedUtilisateur);
        req.session.utilisateur = updatedUtilisateur;

        res.redirect("/profil");
    } catch (error) {
        console.log("Erreur lors de la mise à jour du profil:", error);
        res.status(500).send("Une erreur s'est produite.");
    }
});

userRouter.post("/profil/materiel", authguard, async (req, res) => {
    try {
        const { nom_materiel, description } = req.body;
        const utilisateurId = req.session.utilisateur.id;

        const newMateriel = await prisma.materiel.create({
            data: {
                nom_materiel: nom_materiel,
            }
        });
        await prisma.materielUtilisateur.create({
            data: {
                utilisateur_id: utilisateurId,
                materiel_id: newMateriel.id,
                quantite: 1
            }
        });
        console.log("Matériel ajouté avec succès", newMateriel);
        res.redirect("/profil");

    } catch (error) {
        console.log("Erreur lors de l'ajout du matériel", error);
        res.status(500).send("Une erreur s'est produite");
    }
});

userRouter.post("/profil/badge", authguard, async (req, res) => {
    try{
        const { badgeId } = req.body;
        const utilisateurId = req.session.utilisateur.id;

        await prisma.badgeUtilisateur.create({
            data: {
                utilisateur_id: utilisateurId,
                badge_id: badgeId
            }
        });

        console.log("Badge attribué avec succès");
        res.redirect("/profil"); 
    } catch (error) {
        console.log("Erreur lors de l'attribution du badge", error);
        res.status(500).send("Une erreur s'est produite");
    }
});

userRouter.post("/profil/assign-badge", authguard, async (req, res) => {
    try {
        const utilisateurId = req.session.utilisateur.id;
        const { badgeId } = req.body;

        await prisma.badgeUtilisateur.create({
            data: {
                utilisateur_id: utilisateurId,
                badge_id: badgeId
            }
        });

        console.log(`Badge ${badgeId} attribué à l'utilisateur ${utilisateurId}`);
        res.redirect("/profil");
    } catch (error) {
        console.error("Erreur lors de l'attribution du badge :", error);
        res.status(500).send("Une erreur s'est produite.");
    }
});

userRouter.get("/profil/debug", authguard, async (req, res) => {
    try {
        console.log("ID utilisateur en session :", req.session.utilisateur.id);

        // Vérifie si l'utilisateur existe et récupère ses badges
        const utilisateur = await prisma.utilisateur.findUnique({
            where: { id: req.session.utilisateur.id },
            include: {
                badges: { include: { badge: true } }
            }
        });

        if (!utilisateur) {
            console.log("Utilisateur non trouvé !");
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        console.log("Données utilisateur récupérées :", utilisateur);
        console.log("Badges récupérés :", utilisateur.badges);

        // Vérifie si des badges existent en base
        const badgesEnBase = await prisma.badge.findMany();
        console.log("Badges en base de données :", badgesEnBase);

        // Vérifie si des badges sont attribués
        const badgesUtilisateur = await prisma.badgeUtilisateur.findMany({
            where: { utilisateur_id: req.session.utilisateur.id },
            include: { badge: true }
        });
        console.log("Badges attribués à l'utilisateur :", badgesUtilisateur);

        res.json({
            utilisateur: utilisateur,
            badgesPossédés: utilisateur.badges.map(b => b.badge),
            tousLesBadges: badgesEnBase
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des badges :", error);
        res.status(500).json({ error: "Une erreur s'est produite." });
    }
});
module.exports = userRouter