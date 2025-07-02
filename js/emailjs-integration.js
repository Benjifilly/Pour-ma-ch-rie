/**
 * Intégration EmailJS pour envoyer des emails de notification
 * lors des modifications importantes dans l'application Date Planner
 */

// Configuration EmailJS
const EMAILJS_CONFIG = {
    serviceID: "service_v301a6g", // À remplacer par votre Service ID EmailJS
    templateID: "template_ce0f1zo", // À remplacer par votre Template ID EmailJS
    userID: "iRZEUyns5_gal-B1Z", // À remplacer par votre User ID/Public Key EmailJS
    // Informations des utilisateurs
    users: {
        benjamin: {
            email: "benji.filly@gmail.com",
            name: "Benjamin"
        },
        sanaa: {
            email: "sanaa.shrf07@gmail.com",
            name: "Sanaa"
        }
    }
};

/**
 * Fonction pour initialiser EmailJS
 * À appeler une seule fois au chargement de la page
 */
function initEmailJS() {
    // Vérifier si la bibliothèque EmailJS est chargée
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.userID);
        console.log("EmailJS initialisé avec succès");
    } else {
        console.error("EmailJS n'est pas chargé. Vérifiez que le script est bien inclus dans la page.");
    }
}

/**
 * Envoyer une notification par email à l'autre utilisateur
 * @param {Object} options - Options pour l'email
 * @param {string} options.action - Type d'action (create, update, confirm, cancel, etc.)
 * @param {Object} options.date - Objet contenant les détails du rendez-vous
 * @param {string} [options.customMessage] - Message personnalisé (optionnel)
 * @returns {Promise} - Promise résolue lorsque l'email est envoyé
 */
async function notifyUserByEmail(options) {
    try {
        // Déterminer l'utilisateur courant et le destinataire
        const currentUser = sessionStorage.getItem('currentUser') || 'Benjamin';
        const isBen = currentUser.toLowerCase() === 'benjamin';
        
        // Définir l'expéditeur et le destinataire
        const sender = isBen ? EMAILJS_CONFIG.users.benjamin : EMAILJS_CONFIG.users.sanaa;
        const recipient = isBen ? EMAILJS_CONFIG.users.sanaa : EMAILJS_CONFIG.users.benjamin;

        // Formater la date pour l'email
        const formattedDate = options.date.date ? new Date(options.date.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'Date non spécifiée';

        // Créer le message selon le type d'action
        let subject, message;
        
        switch(options.action) {
            case 'create':
                subject = `Nouveau rendez-vous proposé par ${sender.name}`;
                message = `${sender.name} vient de te proposer un nouveau rendez-vous : "${options.date.title}" le ${formattedDate} à ${options.date.time || 'heure non spécifiée'} à ${options.date.location || 'lieu non spécifié'}.`;
                break;
            case 'confirm':
                subject = `Rendez-vous confirmé par ${sender.name}`;
                message = `${sender.name} a confirmé votre rendez-vous : "${options.date.title}" le ${formattedDate} à ${options.date.time || 'heure non spécifiée'}.`;
                break;
            case 'cancel':
                subject = `Rendez-vous annulé par ${sender.name}`;
                message = `${sender.name} a annulé votre rendez-vous : "${options.date.title}" le ${formattedDate}.`;
                break;
            case 'update':
                subject = `Rendez-vous modifié par ${sender.name}`;
                message = `${sender.name} a modifié les détails du rendez-vous : "${options.date.title}" le ${formattedDate} à ${options.date.time || 'heure non spécifiée'} à ${options.date.location || 'lieu non spécifié'}.`;
                break;
            case 'reactivate':
                subject = `Rendez-vous réactivé par ${sender.name}`;
                message = `${sender.name} a réactivé un rendez-vous annulé : "${options.date.title}" le ${formattedDate} à ${options.date.time || 'heure non spécifiée'}.`;
                break;
            case 'unarchive':
                subject = `Rendez-vous désarchivé par ${sender.name}`;
                message = `${sender.name} a désarchivé un ancien rendez-vous : "${options.date.title}" maintenant prévu le ${formattedDate} à ${options.date.time || 'heure non spécifiée'}.`;
                break;
            case 'delete':
                subject = `Rendez-vous supprimé par ${sender.name}`;
                message = `${sender.name} a supprimé définitivement un rendez-vous : "${options.date.title}" qui était prévu le ${formattedDate}.`;
                break;
            default:
                subject = `Notification de rendez-vous de ${sender.name}`;
                message = `${sender.name} a effectué une action sur un rendez-vous : "${options.date.title}" le ${formattedDate}.`;
        }

        // Ajouter le message personnalisé si fourni
        if (options.customMessage) {
            message += `\n\nMessage de ${sender.name}: ${options.customMessage}`;
        }

        // Paramètres pour EmailJS - assurons-nous que tous les paramètres sont des chaînes de caractères
        // et ajoutons tout paramètre manquant qui pourrait être nécessaire au template
        const templateParams = {
            to_name: recipient.name,
            to_email: recipient.email,
            from_name: sender.name,
            from_email: sender.email,
            subject: subject,
            message: message,
            // Convertir explicitement en chaînes pour éviter les erreurs de variables dynamiques
            date_title: String(options.date.title || 'Sans titre'),
            date_day: String(formattedDate),
            date_time: String(options.date.time || 'Non spécifiée'),
            date_location: String(options.date.location || 'Non spécifié'), 
            date_category: String(options.date.category || 'Autre'),
            date_description: String(options.date.description || 'Pas de description'),
            // Ajouter des paramètres additionnels utilisés dans le template
            title: String(options.date.title || 'Sans titre'), // Pour la compatibilité avec {{title}}
            name: sender.name, // Pour la compatibilité avec {{name}}
            reply_to: sender.email // Garantir que les réponses vont à l'expéditeur
        };

        // Envoyer l'email via EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceID,
            EMAILJS_CONFIG.templateID,
            templateParams
        );
        
        console.log('Email envoyé!', response.status, response.text);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return false;
    }
}

/**
 * Fonction utilitaire pour journaliser les échecs d'envoi d'email
 * et les réessayer plus tard
 */
function logEmailFailure(options) {
    try {
        // Stocker les emails qui ont échoué
        const failedEmails = JSON.parse(localStorage.getItem('failedEmails') || '[]');
        failedEmails.push({
            timestamp: Date.now(),
            options: options
        });
        
        // Limiter à 10 derniers échecs pour ne pas surcharger le localStorage
        if (failedEmails.length > 10) {
            failedEmails.shift();
        }
        
        localStorage.setItem('failedEmails', JSON.stringify(failedEmails));
    } catch (error) {
        console.error('Erreur lors de la journalisation des échecs d\'email:', error);
    }
}

/**
 * Fonction pour réessayer d'envoyer les emails qui ont échoué
 * Peut être appelée périodiquement
 */
async function retryFailedEmails() {
    try {
        const failedEmails = JSON.parse(localStorage.getItem('failedEmails') || '[]');
        if (failedEmails.length === 0) return;
        
        const stillFailed = [];
        
        for (const failedEmail of failedEmails) {
            // Ne réessayer que les emails de moins de 24h
            if (Date.now() - failedEmail.timestamp < 24 * 60 * 60 * 1000) {
                const success = await notifyUserByEmail(failedEmail.options);
                if (!success) {
                    stillFailed.push(failedEmail);
                }
            }
        }
        
        localStorage.setItem('failedEmails', JSON.stringify(stillFailed));
    } catch (error) {
        console.error('Erreur lors de la réessai des emails échoués:', error);
    }
}