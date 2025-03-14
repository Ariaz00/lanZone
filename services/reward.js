const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Reward {
    /**
     * Vérifie et met à jour les badges d'un utilisateur en fonction du nombre de LANs auxquelles il est inscrit.
     * @param {number} utilisateurId - L'ID de l'utilisateur.
     */
    static async applyReward(utilisateurId) {
        try {
            // 🔍 1. Compter le nombre de LANs actuelles
            const count = await prisma.participant.count({
                where: { utilisateur_id: utilisateurId }
            });

            console.log(`L'utilisateur ${utilisateurId} est inscrit à ${count} LAN(s).`);

            // 🎖️ 2. Déterminer quel badge il doit avoir
            let newBadgeId = null;

            if (count >= 10) {
                newBadgeId = 5;
            } else if (count >= 5) {
                newBadgeId = 4; 
            } else if (count >= 1) {
                newBadgeId = 3; 
            }

            // 🎯 3. Récupérer tous ses badges actuels
            const existingBadges = await prisma.badgeUtilisateur.findMany({
                where: { utilisateur_id: utilisateurId }
            });

            const existingBadgeIds = existingBadges.map(b => b.badge_id);

            // 🏅 4. Ajouter le nouveau badge s'il ne l'a pas
            if (newBadgeId && !existingBadgeIds.includes(newBadgeId)) {
                await prisma.badgeUtilisateur.create({
                    data: {
                        utilisateur_id: utilisateurId,
                        badge_id: newBadgeId
                    }
                });
                console.log(`🎉 Badge ${newBadgeId} attribué à l'utilisateur ${utilisateurId} !`);
            }

            // ❌ 5. Supprimer les anciens badges qu'il ne mérite plus
            for (let badgeId of existingBadgeIds) {
                if (badgeId !== newBadgeId) {
                    await prisma.badgeUtilisateur.deleteMany({
                        where: {
                            utilisateur_id: utilisateurId,
                            badge_id: badgeId
                        }
                    });
                    console.log(`🗑️ Badge ${badgeId} retiré de l'utilisateur ${utilisateurId}.`);
                }
            }

        } catch (error) {
            console.error("Erreur dans applyReward :", error);
        }
    }
}

module.exports = Reward;
