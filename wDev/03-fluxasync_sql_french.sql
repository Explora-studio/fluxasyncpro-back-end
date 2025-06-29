
-- Table principale des clients FluxAsync (vendeurs)
CREATE TABLE utilisateurs_fluxasync (
    id_utilisateur SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse_email VARCHAR(255) UNIQUE NOT NULL,
    numero_telephone VARCHAR(20) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    secteur_activite VARCHAR(255),
    nom_entreprise VARCHAR(255),
    plan_abonnement VARCHAR(20) DEFAULT 'gratuit' CHECK (plan_abonnement IN ('gratuit', 'pro', 'entreprise')),
    statut_abonnement VARCHAR(20) DEFAULT 'actif' CHECK (statut_abonnement IN ('actif', 'inactif', 'suspendu')),
    compte_verifie BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comptes WhatsApp Business liés aux utilisateurs
CREATE TABLE comptes_whatsapp (
    id_compte_whatsapp SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    identifiant_compte_business VARCHAR(255) NOT NULL,
    identifiant_numero_telephone VARCHAR(255) NOT NULL,
    numero_telephone_whatsapp VARCHAR(20) NOT NULL,
    jeton_acces TEXT NOT NULL,
    url_webhook VARCHAR(500),
    jeton_verification_webhook VARCHAR(255),
    compte_actif BOOLEAN DEFAULT TRUE,
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_synchronisation TIMESTAMP
);

-- Comptes email connectés (Gmail, Outlook, etc.)
CREATE TABLE comptes_email (
    id_compte_email SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    fournisseur_email VARCHAR(20) NOT NULL CHECK (fournisseur_email IN ('gmail', 'outlook', 'yahoo')),
    adresse_email VARCHAR(255) NOT NULL,
    jeton_acces TEXT NOT NULL,
    jeton_rafraichissement TEXT,
    expiration_jeton TIMESTAMP,
    compte_actif BOOLEAN DEFAULT TRUE,
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_synchronisation TIMESTAMP
);

-- ==========================================
-- 💬 GESTION DES CONVERSATIONS ET MESSAGES
-- ==========================================

-- Prospects qui contactent via WhatsApp
CREATE TABLE prospects (
    id_prospect SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    numero_telephone VARCHAR(20) NOT NULL,
    nom_complet VARCHAR(255),
    source_acquisition VARCHAR(30) DEFAULT 'direct' CHECK (source_acquisition IN ('pub_facebook', 'pub_instagram', 'pub_whatsapp', 'direct', 'recommandation')),
    statut_prospect VARCHAR(20) DEFAULT 'prospect' CHECK (statut_prospect IN ('prospect', 'qualifie', 'client', 'inactif')),
    localisation VARCHAR(255),
    notes_personnelles TEXT,
    date_premier_contact TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_activite TIMESTAMP,
    nombre_commandes_total INTEGER DEFAULT 0,
    montant_depense_total DECIMAL(12,2) DEFAULT 0.00
);

-- Sessions de conversation WhatsApp
CREATE TABLE conversations (
    id_conversation SERIAL PRIMARY KEY,
    id_prospect INTEGER NOT NULL REFERENCES prospects(id_prospect) ON DELETE CASCADE,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    id_compte_whatsapp INTEGER NOT NULL REFERENCES comptes_whatsapp(id_compte_whatsapp) ON DELETE CASCADE,
    statut_conversation VARCHAR(20) DEFAULT 'active' CHECK (statut_conversation IN ('active', 'en_pause', 'terminee', 'archivee')),
    dernier_message_recu TIMESTAMP,
    ia_activee BOOLEAN DEFAULT TRUE,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP
);

-- Messages individuels dans les conversations
CREATE TABLE messages (
    id_message SERIAL PRIMARY KEY,
    id_conversation INTEGER NOT NULL REFERENCES conversations(id_conversation) ON DELETE CASCADE,
    identifiant_message_whatsapp VARCHAR(255),
    contenu_message TEXT,
    type_message VARCHAR(20) DEFAULT 'texte' CHECK (type_message IN ('texte', 'image', 'document', 'audio', 'video', 'localisation')),
    direction_message VARCHAR(10) NOT NULL CHECK (direction_message IN ('entrant', 'sortant')),
    nom_expediteur VARCHAR(255),
    genere_par_ia BOOLEAN DEFAULT FALSE,
    score_confiance_ia DECIMAL(3,2),
    statut_livraison VARCHAR(20) DEFAULT 'envoye' CHECK (statut_livraison IN ('envoye', 'livre', 'lu', 'echec')),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 🛒 GESTION DES PRODUITS ET COMMANDES
-- ==========================================

-- Catalogue de produits par vendeur
CREATE TABLE produits (
    id_produit SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    nom_produit VARCHAR(255) NOT NULL,
    description_produit TEXT,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    quantite_stock INTEGER DEFAULT 0,
    categorie_produit VARCHAR(100),
    reference_produit VARCHAR(100),
    urls_images TEXT,
    produit_actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commandes passées par les prospects
CREATE TABLE commandes (
    id_commande SERIAL PRIMARY KEY,
    id_prospect INTEGER NOT NULL REFERENCES prospects(id_prospect) ON DELETE CASCADE,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    id_conversation INTEGER REFERENCES conversations(id_conversation),
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    montant_total DECIMAL(12,2) NOT NULL,
    adresse_livraison TEXT NOT NULL,
    telephone_livraison VARCHAR(20),
    statut_commande VARCHAR(20) DEFAULT 'en_attente' CHECK (statut_commande IN ('en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee', 'echec')),
    methode_paiement VARCHAR(30) DEFAULT 'paiement_livraison' CHECK (methode_paiement IN ('paiement_livraison', 'orange_money', 'mtn_money', 'wave', 'virement_bancaire')),
    statut_paiement VARCHAR(20) DEFAULT 'en_attente' CHECK (statut_paiement IN ('en_attente', 'paye', 'echec', 'rembourse')),
    notes_commande TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_confirmation TIMESTAMP,
    date_livraison TIMESTAMP
);

-- Détails des articles dans chaque commande
CREATE TABLE details_commande (
    id_detail_commande SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes(id_commande) ON DELETE CASCADE,
    id_produit INTEGER NOT NULL REFERENCES produits(id_produit) ON DELETE CASCADE,
    quantite_commandee INTEGER NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    prix_total_ligne DECIMAL(10,2) NOT NULL
);

-- ==========================================
-- 🚚 GESTION DES LIVRAISONS
-- ==========================================

-- Base de données des livreurs
CREATE TABLE livreurs (
    id_livreur SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    nom_complet_livreur VARCHAR(255) NOT NULL,
    numero_telephone_livreur VARCHAR(20) NOT NULL,
    email_livreur VARCHAR(255),
    zones_couverture TEXT,
    type_vehicule VARCHAR(20) DEFAULT 'moto' CHECK (type_vehicule IN ('moto', 'velo', 'voiture', 'camion')),
    note_moyenne DECIMAL(2,1) DEFAULT 0.0,
    nombre_livraisons_total INTEGER DEFAULT 0,
    disponible_maintenant BOOLEAN DEFAULT TRUE,
    livreur_actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Livraisons planifiées et effectuées
CREATE TABLE livraisons (
    id_livraison SERIAL PRIMARY KEY,
    id_commande INTEGER UNIQUE NOT NULL REFERENCES commandes(id_commande) ON DELETE CASCADE,
    id_livreur INTEGER REFERENCES livreurs(id_livreur),
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    date_livraison_prevue TIMESTAMP NOT NULL,
    adresse_recuperation TEXT NOT NULL,
    adresse_destination TEXT NOT NULL,
    statut_livraison VARCHAR(20) DEFAULT 'assignee' CHECK (statut_livraison IN ('assignee', 'recuperee', 'en_transit', 'livree', 'echec', 'annulee')),
    frais_livraison DECIMAL(8,2),
    duree_estimee_minutes INTEGER,
    duree_reelle_minutes INTEGER,
    preuve_livraison TEXT,
    notes_livraison TEXT,
    date_assignation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_recuperation TIMESTAMP,
    date_livraison_effective TIMESTAMP
);

-- ==========================================
-- 📧 GESTION DES EMAILS INTELLIGENTS
-- ==========================================

-- Emails reçus et traités
CREATE TABLE emails_recus (
    id_email SERIAL PRIMARY KEY,
    id_compte_email INTEGER NOT NULL REFERENCES comptes_email(id_compte_email) ON DELETE CASCADE,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    identifiant_message_email VARCHAR(255) UNIQUE NOT NULL,
    email_expediteur VARCHAR(255) NOT NULL,
    nom_expediteur VARCHAR(255),
    sujet_email VARCHAR(500) NOT NULL,
    apercu_contenu TEXT,
    contenu_complet TEXT,
    niveau_priorite VARCHAR(20) DEFAULT 'normal' CHECK (niveau_priorite IN ('critique', 'important', 'normal', 'faible', 'spam')),
    contient_pieces_jointes BOOLEAN DEFAULT FALSE,
    identifiant_fil_discussion VARCHAR(255),
    date_reception TIMESTAMP NOT NULL,
    date_traitement TIMESTAMP,
    email_traite BOOLEAN DEFAULT FALSE
);

-- Analyses IA des emails
CREATE TABLE analyses_emails (
    id_analyse SERIAL PRIMARY KEY,
    id_email INTEGER UNIQUE NOT NULL REFERENCES emails_recus(id_email) ON DELETE CASCADE,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    classification_email VARCHAR(30) NOT NULL CHECK (classification_email IN ('urgent', 'contrat', 'reunion', 'facture', 'marketing', 'spam', 'autre')),
    resume_contenu TEXT NOT NULL,
    action_suggeree VARCHAR(30) NOT NULL CHECK (action_suggeree IN ('repondre_urgent', 'appeler', 'planifier_reunion', 'ignorer', 'transferer', 'archiver')),
    score_confiance DECIMAL(3,2) NOT NULL,
    mots_cles TEXT,
    sentiment_detecte VARCHAR(20) DEFAULT 'neutre' CHECK (sentiment_detecte IN ('positif', 'neutre', 'negatif', 'urgent')),
    alerte_whatsapp_envoyee BOOLEAN DEFAULT FALSE,
    date_analyse TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 🔔 GESTION DES NOTIFICATIONS ET ANALYTIQUES
-- ==========================================

-- Historique des notifications envoyées
CREATE TABLE notifications (
    id_notification SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    type_notification VARCHAR(30) NOT NULL CHECK (type_notification IN ('mise_jour_commande', 'mise_jour_livraison', 'alerte_email', 'alerte_systeme', 'marketing')),
    titre_notification VARCHAR(255) NOT NULL,
    contenu_notification TEXT NOT NULL,
    canal_envoi VARCHAR(20) NOT NULL CHECK (canal_envoi IN ('whatsapp', 'sms', 'email', 'push')),
    destinataire VARCHAR(255) NOT NULL,
    statut_envoi VARCHAR(20) DEFAULT 'en_attente' CHECK (statut_envoi IN ('en_attente', 'envoye', 'livre', 'echec')),
    reference_element_id INTEGER,
    type_reference VARCHAR(30) CHECK (type_reference IN ('commande', 'livraison', 'email', 'conversation')),
    date_envoi TIMESTAMP,
    date_livraison TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions d'analytics quotidiennes
CREATE TABLE sessions_analytiques (
    id_session SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    date_session DATE NOT NULL,
    messages_recus INTEGER DEFAULT 0,
    messages_envoyes INTEGER DEFAULT 0,
    reponses_ia INTEGER DEFAULT 0,
    interventions_manuelles INTEGER DEFAULT 0,
    commandes_creees INTEGER DEFAULT 0,
    commandes_completees INTEGER DEFAULT 0,
    chiffre_affaires_genere DECIMAL(12,2) DEFAULT 0.00,
    emails_traites INTEGER DEFAULT 0,
    emails_critiques INTEGER DEFAULT 0,
    duree_session_minutes INTEGER DEFAULT 0,
    UNIQUE(id_utilisateur, date_session)
);

-- ==========================================
-- 🎯 GESTION DES CAMPAGNES ET MARKETING
-- ==========================================

-- Campagnes publicitaires et de marketing
CREATE TABLE campagnes_marketing (
    id_campagne SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    nom_campagne VARCHAR(255) NOT NULL,
    type_campagne VARCHAR(30) NOT NULL CHECK (type_campagne IN ('pub_facebook', 'pub_instagram', 'diffusion_whatsapp', 'campagne_email')),
    statut_campagne VARCHAR(20) DEFAULT 'brouillon' CHECK (statut_campagne IN ('brouillon', 'active', 'en_pause', 'terminee', 'annulee')),
    budget_campagne DECIMAL(10,2),
    audience_cible TEXT,
    modele_message TEXT,
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métriques de performance des campagnes
CREATE TABLE metriques_campagnes (
    id_metrique SERIAL PRIMARY KEY,
    id_campagne INTEGER NOT NULL REFERENCES campagnes_marketing(id_campagne) ON DELETE CASCADE,
    date_metrique DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clics INTEGER DEFAULT 0,
    conversations_initiees INTEGER DEFAULT 0,
    commandes_generees INTEGER DEFAULT 0,
    chiffre_affaires_genere DECIMAL(12,2) DEFAULT 0.00,
    cout_par_clic DECIMAL(8,4) DEFAULT 0.0000,
    taux_conversion DECIMAL(5,4) DEFAULT 0.0000,
    UNIQUE(id_campagne, date_metrique)
);

-- ==========================================
-- 🔧 GESTION SYSTÈME ET LOGS
-- ==========================================

-- Logs des actions système
CREATE TABLE journaux_systeme (
    id_journal SERIAL PRIMARY KEY,
    id_utilisateur INTEGER REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE SET NULL,
    type_action VARCHAR(50) NOT NULL CHECK (type_action IN ('connexion', 'deconnexion', 'message_envoye', 'commande_creee', 'livraison_assignee', 'email_traite')),
    description_action TEXT NOT NULL,
    adresse_ip VARCHAR(45),
    user_agent TEXT,
    donnees_supplementaires TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Utilisation des APIs externes
CREATE TABLE utilisation_apis (
    id_utilisation SERIAL PRIMARY KEY,
    id_utilisateur INTEGER REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE SET NULL,
    service_api VARCHAR(20) NOT NULL CHECK (service_api IN ('whatsapp', 'gemini', 'email', 'sms')),
    endpoint_appele VARCHAR(255),
    nombre_requetes INTEGER DEFAULT 1,
    date_heure TIMESTAMP NOT NULL,
    temps_reponse_ms INTEGER,
    code_statut INTEGER,
    message_erreur TEXT
);

-- ==========================================
-- 💰 GESTION FACTURATION ET PAIEMENTS
-- ==========================================

-- Abonnements des utilisateurs
CREATE TABLE abonnements (
    id_abonnement SERIAL PRIMARY KEY,
    id_utilisateur INTEGER UNIQUE NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    nom_plan VARCHAR(100) NOT NULL,
    prix_plan DECIMAL(8,2) NOT NULL,
    cycle_facturation VARCHAR(20) DEFAULT 'mensuel' CHECK (cycle_facturation IN ('mensuel', 'annuel')),
    statut_abonnement VARCHAR(20) DEFAULT 'actif' CHECK (statut_abonnement IN ('actif', 'annule', 'expire', 'suspendu')),
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP,
    renouvellement_automatique BOOLEAN DEFAULT TRUE,
    methode_paiement VARCHAR(100)
);

-- Factures générées
CREATE TABLE factures (
    id_facture SERIAL PRIMARY KEY,
    id_abonnement INTEGER NOT NULL REFERENCES abonnements(id_abonnement) ON DELETE CASCADE,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs_fluxasync(id_utilisateur) ON DELETE CASCADE,
    numero_facture VARCHAR(100) UNIQUE NOT NULL,
    montant_ht DECIMAL(10,2) NOT NULL,
    montant_tva DECIMAL(10,2) DEFAULT 0.00,
    montant_ttc DECIMAL(10,2) NOT NULL,
    statut_facture VARCHAR(20) DEFAULT 'en_attente' CHECK (statut_facture IN ('en_attente', 'payee', 'en_retard', 'annulee')),
    date_emission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_echeance TIMESTAMP,
    date_paiement TIMESTAMP
);

-- ==========================================
-- 📊 INDEX POUR OPTIMISATION DES PERFORMANCES
-- ==========================================

-- Index sur les colonnes fréquemment utilisées
CREATE INDEX idx_utilisateurs_email ON utilisateurs_fluxasync(adresse_email);
CREATE INDEX idx_prospects_telephone ON prospects(numero_telephone);
CREATE INDEX idx_prospects_utilisateur ON prospects(id_utilisateur);
CREATE INDEX idx_conversations_prospect ON conversations(id_prospect);
CREATE INDEX idx_messages_conversation ON messages(id_conversation);
CREATE INDEX idx_commandes_prospect ON commandes(id_prospect);
CREATE INDEX idx_commandes_statut ON commandes(statut_commande);
CREATE INDEX idx_livraisons_commande ON livraisons(id_commande);
CREATE INDEX idx_emails_compte ON emails_recus(id_compte_email);
CREATE INDEX idx_emails_reception ON emails_recus(date_reception);
CREATE INDEX idx_notifications_utilisateur ON notifications(id_utilisateur);
CREATE INDEX idx_analytics_date ON sessions_analytiques(date_session);


-- ==========================================
-- 🛡️ FONCTIONS ET TRIGGERS on dois revoir s'il faut le gérer coté base de données ou dans le back-end
-- ==========================================

-- Fonction pour mettre à jour automatiquement date_modification
CREATE OR REPLACE FUNCTION mettre_a_jour_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour la mise à jour automatique
CREATE TRIGGER trigger_maj_utilisateurs
    BEFORE UPDATE ON utilisateurs_fluxasync
    FOR EACH ROW
    EXECUTE FUNCTION mettre_a_jour_date_modification();

CREATE TRIGGER trigger_maj_produits
    BEFORE UPDATE ON produits
    FOR EACH ROW
    EXECUTE FUNCTION mettre_a_jour_date_modification();

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generer_numero_commande()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_commande = 'CMD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(nextval('seq_numero_commande')::text, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de commande
CREATE SEQUENCE seq_numero_commande START 1;

-- Trigger pour générer automatiquement le numéro de commande
CREATE TRIGGER trigger_numero_commande
    BEFORE INSERT ON commandes
    FOR EACH ROW
    WHEN (NEW.numero_commande IS NULL)
    EXECUTE FUNCTION generer_numero_commande();


-- ==========================================
-- 🎯 COMMENTAIRES SUR LES TABLES
-- ==========================================
COMMENT ON TABLE utilisateurs_fluxasync IS 'Table principale des clients FluxAsync (vendeurs utilisant la plateforme)';
COMMENT ON TABLE comptes_whatsapp IS 'Comptes WhatsApp Business connectés via l''API Meta';
COMMENT ON TABLE comptes_email IS 'Comptes email connectés pour l''automatisation intelligente';
COMMENT ON TABLE prospects IS 'Personnes qui contactent les vendeurs via WhatsApp';
COMMENT ON TABLE conversations IS 'Sessions de discussion entre prospects et vendeurs';
COMMENT ON TABLE messages IS 'Messages individuels dans les conversations WhatsApp';
COMMENT ON TABLE produits IS 'Catalogue de produits de chaque vendeur';
COMMENT ON TABLE commandes IS 'Commandes passées par les prospects';
COMMENT ON TABLE details_commande IS 'Détail des articles dans chaque commande';
COMMENT ON TABLE livreurs IS 'Base de données des livreurs disponibles';
COMMENT ON TABLE livraisons IS 'Livraisons planifiées et effectuées';
COMMENT ON TABLE emails_recus IS 'Emails reçus et analysés par l''IA';
COMMENT ON TABLE analyses_emails IS 'Résultats d''analyse des emails par Gemini';
COMMENT ON TABLE notifications IS 'Historique des notifications envoyées';
COMMENT ON TABLE sessions_analytiques IS 'Métriques de performance quotidiennes';
COMMENT ON TABLE campagnes_marketing IS 'Campagnes publicitaires et marketing';
COMMENT ON TABLE metriques_campagnes IS 'Performances des campagnes marketing';
COMMENT ON TABLE journaux_systeme IS 'Logs des actions utilisateurs et système';
COMMENT ON TABLE utilisation_apis IS 'Monitoring de l''utilisation des APIs externes';
COMMENT ON TABLE abonnements IS 'Gestion des abonnements utilisateurs';
COMMENT ON TABLE factures IS 'Facturation et paiements des abonnements';