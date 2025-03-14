const dashboardRouter = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authguard = require("../services/authguard");

const prisma = new PrismaClient();

const fetch = require('node-fetch');

async function getCoordinates(city) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
    return { latitude: null, longitude: null };
}

dashboardRouter.get("/dashboard", authguard, async(req, res) => {
    try {
        if (req.session.utilisateur) {
            // On récupère l'utilisateur connecté et ses LANs créées
            const utilisateur = await prisma.utilisateur.findUnique({
                where: {
                    id: req.session.utilisateur.id
                },
                include: {
                    lan_crees: true,
                    participations: { include: { lan: true } },
                }
            });

            // On récupère toutes les LANs créées par tout le monde et le nombre de participants
            const allLans = await prisma.lan.findMany({
                select: {
                    id: true,
                    nom_lan: true,
                    latitude: true,
                    longitude: true,
                    lieu: true,
                    description: true,
                    materiel: true,
                    max_participants: true,
                    organisateur: {
                        select: { pseudo: true } // Sélectionne seulement le pseudo de l'organisateur
                    },
                    participants: true
                }
            });
            for (let lan of allLans) {
                if (lan.latitude === null || lan.longitude === null) {
                    const coords = await getCoordinates(lan.lieu);
                    if (coords.latitude !== null && coords.longitude !== null) {
                        // Mettre à jour la base de données
                        await prisma.lan.update({
                            where: { id: lan.id },
                            data: { latitude: coords.latitude, longitude: coords.longitude }
                        });
                        // Met à jour dans la liste
                        lan.latitude = coords.latitude;
                        lan.longitude = coords.longitude;
                    }
                }
            }
            console.log("Liste des LANs récupérées :", allLans); // Vérification des données

            const allLansWithCounts = allLans.map(lan => ({
                ...lan,
                nombre_participants: lan.participants.length,
                materiel: lan.materiel
            }));

            const badgeUtilisateur = await prisma.badgeUtilisateur.findMany({
                where: {
                    utilisateur_id: req.session.utilisateur.id },
                include: {
                    badge: true
                }
            });

            if (utilisateur) {
                return res.render("pages/dashboard.twig", {
                    current_page: 'dashboard',
                    lans: utilisateur.lan_crees,
                    allLans: allLansWithCounts,
                    utilisateur: utilisateur,
                    badges: badgeUtilisateur.map(b => b.badge)
                });
            }
        }
        res.redirect("/login")
    } catch (error) {
        console.log(error);
        res.redirect("/login")
    }
});

// Route pour afficher la page de création des LANs (redirige vers createLanRouter.js)
dashboardRouter.get("/lanCreate", authguard, (req, res) => {
    res.redirect("/createLan"); // Redirige vers la page de création de LANs
});

// Route pour modifier une LAN
dashboardRouter.get("/lan/edit/:id", authguard, async (req, res) => {
    try {
        const lanId = parseInt(req.params.id);
        const lan = await prisma.lan.findUnique({
            where: { id: lanId }
        });

        if (!lan || lan.organisateur_id !== req.session.utilisateur.id) {
            return res.redirect("/dashboard");
        }
        res.render("pages/editLan.twig", { lan, current_page: 'editLan' });
    } catch (error) {
        console.log("Erreur lors de la récupération de la lan", error);
        res.redirect("/dashboard");
    }
});

// Traitement de la modification d'une LAN
dashboardRouter.post("/lan/edit/:id", authguard, async(req, res) => {
    try {
        const lanId = parseInt(req.params.id);
        const { nom, date, lieu, description } = req.body;

        const updatedLan = await prisma.lan.updateMany({
            where: {
                id: lanId,
                organisateur_id: req.session.utilisateur.id
            },
            data: {
                nom_lan: nom,
                date: new Date(date),
                lieu,
                description
            }
        });

        if (updatedLan.count === 0) {
            return res.redirect("/dashboard");
        }
        res.redirect("/dashboard");
    } catch (error) {
        console.log("Erreur lors de la modification de la lan", error);
        res.redirect("/dashboard");
    }
});

// Suppression d'une LAN
dashboardRouter.post("/lan/delete/:id", authguard, async (req, res) => {
    try {
        const lanId = parseInt(req.params.id);

        await prisma.lan.deleteMany({
            where: {
                id: lanId,
                organisateur_id: req.session.utilisateur.id
            }
        });
        res.redirect("/dashboard");
    } catch (error) {
        console.log("Erreur lors de la suppression de la lan", error);
        res.redirect("/dashboard");
    }
});

// // Désinscription d'une LAN
// dashboardRouter.post("/desinscription/:id", authguard, async (req, res) => {
//     try {
//         const lanId = parseInt(req.params.id);

//         // Vérifier si l'utilisateur est inscrit à cette LAN
//         const participation = await prisma.participant.findFirst({
//             where: {
//                 utilisateur_id: req.session.utilisateur.id,
//                 lan_id: lanId
//             }
//         });

//         if (!participation) {
//             console.log("L'utilisateur n'est pas inscrit à cette LAN.");
//             return res.redirect("/dashboard");
//         }

//         // Supprimer l'inscription
//         await prisma.participant.delete({
//             where: {
//                 id: participation.id
//             }
//         });

//         console.log("Désinscription réussie !");
//         res.redirect("/dashboard");
//     } catch (error) {
//         console.log("Erreur lors de la désinscription", error);
//         res.redirect("/dashboard");
//     }
// });

// // Inscription à une LAN
// dashboardRouter.post("/inscription/:id", authguard, async (req, res) => {
//     try {
//         const lanId = parseInt(req.params.id);

//         const lan = await prisma.lan.findUnique({
//             where: { id: lanId },
//             include: { participants: true }
//         });

//         if (!lan) {
//             console.log("La LAN n'existe pas");
//             return res.redirect("/dashboard");
//         }

//         if (lan.participants.length >= lan.max_participants) {
//             console.log("La LAN est pleine");
//             return res.redirect("/dashboard");
//         }

//         const dejaInscrit = await prisma.participant.findFirst({
//             where: {
//                 lan_id: lanId,
//                 utilisateur_id: req.session.utilisateur.id
//             }
//         });

//         if (dejaInscrit) {
//             console.log("Vous êtes déjà inscrit à cette LAN");
//             return res.redirect("/dashboard");
//         }

//         await prisma.participant.create({
//             data: {
//                 lan_id: lanId,
//                 utilisateur_id: req.session.utilisateur.id,
//                 date_inscription: new Date()
//             }
//         });

//         console.log("Inscription réussie !");

//         const nombreLanInscrit = await prisma.participant.count({
//             where: {
//                 utilisateur_id: req.session.utilisateur.id
//             }
//         });

//         let badgeId = null;

//         if (nombreLanInscrit === 1) {
//             badgeId = await prisma.badge.findFirst({
//                 where: {
//                     nom_badge: "Nouvelle recrue"
//                 }
//             });
//         }
//         else if (nombreLanInscrit === 5) {
//             badgeId = await prisma.badge.findFirst({
//                 where: {
//                     nom_badge: "Habitué"
//                 }
//             });
//         }
//         else if (nombreLanInscrit === 10) {
//             badgeId = await prisma.badge.findFirst({
//                 where: {
//                     nom_badge: "Légende"
//                 }
//             });
//         }

//         if (badgeId) {
//             const dejaBadge = await prisma.badgeUtilisateur.findFirst({
//                 where: {
//                     utilisateur_id: req.session.utilisateur.id,
//                     badge_id: badgeId.id
//                 }
//             });

//             if (!dejaBadge){
//                 await prisma.badgeUtilisateur.create({
//                     data: {
//                         utilisateur_id: req.session.utilisateur.id,
//                         badge_id: badgeId.id
//                     }
//                 });
//                 log(`Badge attribué : ${badgeId.nom_badge}`);
//             }
//         }
//         res.redirect("/dashboard");
//     } catch (error) {
//         console.log("Erreur lors de l'inscription", error);
//         res.redirect("/dashboard");
//     }
// });

module.exports = dashboardRouter;
