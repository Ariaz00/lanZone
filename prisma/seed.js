const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Ajout des badges
    await prisma.badge.createMany({
        data: [
            { nom_badge: "Nouvelle recrue", description: "A participé à sa première LAN", date_obtention: new Date() },
            { nom_badge: "Habitué", description: "A participé à 5 LANs", date_obtention: new Date() },
            { nom_badge: "Légende", description: "A participé à 10 LANs", date_obtention: new Date() },
        ],
    });

    console.log("Badges ajoutés avec succès !");

    // Récupération d'un utilisateur existant
    const utilisateur = await prisma.utilisateur.findFirst(); // Assurez-vous qu'il y a au moins un utilisateur dans la base de données

    if (!utilisateur) {
        console.log("Aucun utilisateur trouvé. Créez un utilisateur d'abord !");
        return;
    }

    // Attribution des badges à l'utilisateur
    await prisma.badgeUtilisateur.createMany({
        data: [
            { utilisateur_id: utilisateur.id, badge_id: 1 }, // On attribu le badge "Nouvelle recrue"
            { utilisateur_id: utilisateur.id, badge_id: 2 }, // On attrivue le badge "Habitué"
            { utilisateur_id: utilisateur.id, badge_id: 3 }, // On attribue le badge "Légende"
        ],
    });

    console.log(`Badges attribués à l'utilisateur ID ${utilisateur.id} !`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());