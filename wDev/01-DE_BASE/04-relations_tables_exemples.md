# 🔗 RELATIONS ENTRE TABLES FLUXASYNC

## 🎯 SCÉNARIO COMPLET : "KOUADIO VEND DES CHAUSSURES"

### 👤 **1. CRÉATION DU COMPTE VENDEUR**

**Table principale** : `utilisateurs_fluxasync`
```sql
-- Kouadio s'inscrit sur FluxAsync
INSERT INTO utilisateurs_fluxasync (
    nom, prenom, adresse_email, numero_telephone, pays, secteur_activite
) VALUES (
    'Kouadio', 'Jean', 'kouadio@gmail.com', '+225 07 12 34 56 78', 
    'Côte d''Ivoire', 'Vente chaussures'
);
-- Résultat : id_utilisateur = 1
```

### 📱 **2. CONNEXION WHATSAPP BUSINESS**

**Relation** : `comptes_whatsapp` ➔ `utilisateurs_fluxasync`
```sql
-- Kouadio connecte son WhatsApp Business
INSERT INTO comptes_whatsapp (
    id_utilisateur, business_account_id, numero_telephone_whatsapp, access_token
) VALUES (
    1, 'WABA_123456', '+225 07 12 34 56 78', 'EAAGxyz...'
);
-- Résultat : id_compte_whatsapp = 1
```

### 📧 **3. CONNEXION EMAIL GMAIL**

**Relation** : `comptes_email` ➔ `utilisateurs_fluxasync`
```sql
-- Kouadio connecte son Gmail pour automatisation
INSERT INTO comptes_email (
    id_utilisateur, fournisseur_email, adresse_email, jeton_acces
) VALUES (
    1, 'gmail', 'kouadio@gmail.com', 'ya29.abc...'
);
-- Résultat : id_compte_email = 1
```

### 👟 **4. AJOUT DE PRODUITS AU CATALOGUE**

**Relation** : `produits` ➔ `utilisateurs_fluxasync`
```sql
-- Kouadio ajoute ses chaussures
INSERT INTO produits (id_utilisateur, nom_produit, prix_unitaire, quantite_stock) VALUES
(1, 'Nike Air Max 90', 45000, 10),
(1, 'Adidas Stan Smith', 35000, 15),
(1, 'Puma Suede Classic', 30000, 8);
-- Résultats : id_produit = 1, 2, 3
```

---

## 💬 **CYCLE COMPLET : PROSPECT → COMMANDE → LIVRAISON**

### 📲 **5. PROSPECT CONTACTE VIA WHATSAPP**

**Relation** : `prospects` ➔ `utilisateurs_fluxasync`
```sql
-- Aminata voit une pub Facebook et clique
INSERT INTO prospects (
    id_utilisateur, numero_telephone, nom_complet, source_acquisition
) VALUES (
    1, '+225 05 98 76 54 32', 'Aminata Traoré', 'pub_facebook'
);
-- Résultat : id_prospect = 1
```

### 💭 **6. DÉBUT DE CONVERSATION**

**Relations multiples** : `conversations` ➔ `prospects` + `utilisateurs_fluxasync` + `comptes_whatsapp`
```sql
-- Conversation automatique initiée
INSERT INTO conversations (
    id_prospect, id_utilisateur, id_compte_whatsapp, statut_conversation
) VALUES (
    1, 1, 1, 'active'
);
-- Résultat : id_conversation = 1
```

### 💬 **7. ÉCHANGE DE MESSAGES**

**Relation** : `messages` ➔ `conversations`
```sql
-- Messages échangés
INSERT INTO messages (id_conversation, contenu_message, direction_message, genere_par_ia) VALUES
(1, 'Bonjour, je suis intéressée par vos chaussures Nike', 'entrant', FALSE),
(1, 'Bonjour Aminata ! Je serais ravi de vous aider. Quelle pointure cherchez-vous ?', 'sortant', TRUE),
(1, 'Je fais du 38', 'entrant', FALSE),
(1, 'Parfait ! J''ai des Nike Air Max 90 en 38 à 45.000 FCFA. Voulez-vous les voir ?', 'sortant', TRUE);
```

### 🛒 **8. CRÉATION DE COMMANDE**

**Relations multiples** : `commandes` ➔ `prospects` + `utilisateurs_fluxasync` + `conversations`
```sql
-- Aminata confirme sa commande
INSERT INTO commandes (
    id_prospect, id_utilisateur, id_conversation, numero_commande,
    total_amount, adresse_livraison, telephone_livraison
) VALUES (
    1, 1, 1, 'CMD-20250628-000001',
    45000, 'Cocody, Angré 7ème tranche, Villa 123', '+225 05 98 76 54 32'
);
-- Résultat : id_commande = 1
```

### 📦 **9. DÉTAILS DE LA COMMANDE**

**Relations multiples** : `details_commande` ➔ `commandes` + `produits`
```sql
-- Détail des articles commandés
INSERT INTO details_commande (
    id_commande, id_produit, quantite_commandee, prix_unitaire, prix_total_ligne
) VALUES (
    1, 1, 1, 45000, 45000  -- 1 paire Nike Air Max 90
);
```

### 🚚 **10. AJOUT D'UN LIVREUR**

**Relation** : `livreurs` ➔ `utilisateurs_fluxasync`
```sql
-- Kouadio ajoute Mamadou comme livreur
INSERT INTO livreurs (
    id_utilisateur, nom_complet_livreur, numero_telephone_livreur, zones_couverture
) VALUES (
    1, 'Mamadou Diabaté', '+225 07 11 22 33 44', 'Cocody, Marcory, Plateau'
);
-- Résultat : id_livreur = 1
```

### 🏍️ **11. PLANIFICATION LIVRAISON**

**Relations multiples** : `livraisons` ➔ `commandes` + `livreurs` + `utilisateurs_fluxasync`
```sql
-- Système assigne automatiquement Mamadou
INSERT INTO livraisons (
    id_commande, id_livreur, id_utilisateur, date_livraison_prevue,
    adresse_recuperation, adresse_destination, frais_livraison
) VALUES (
    1, 1, 1, '2025-06-29 14:00:00',
    'Abobo, Magasin Kouadio Chaussures', 'Cocody, Angré 7ème tranche, Villa 123',
    2000
);
```

---

## 📧 **MODULE EMAIL INTELLIGENT**

### 📨 **12. EMAIL IMPORTANT REÇU**

**Relation** : `emails_recus` ➔ `comptes_email` + `utilisateurs_fluxasync`
```sql
-- Kouadio reçoit un email de son fournisseur
INSERT INTO emails_recus (
    id_compte_email, id_utilisateur, identifiant_message_email,
    email_expediteur, sujet_email, niveau_priorite
) VALUES (
    1, 1, 'gmail_msg_789',
    'fournisseur@nike-ci.com', 'Nouveau stock Nike disponible - Livraison urgent',
    'important'
);
-- Résultat : id_email = 1
```

### 🤖 **13. ANALYSE IA DE L'EMAIL**

**Relation** : `analyses_emails` ➔ `emails_recus` + `utilisateurs_fluxasync`
```sql
-- IA Gemini analyse l'email
INSERT INTO analyses_emails (
    id_email, id_utilisateur, classification_email, resume_contenu,
    action_suggeree, score_confiance
) VALUES (
    1, 1, 'urgent', 'Nouveau stock Nike disponible. Commande à passer avant 17h.',
    'repondre_urgent', 0.95
);
```

---

## 🔔 **NOTIFICATIONS ET SUIVI**

### 📱 **14. NOTIFICATION WHATSAPP**

**Relation** : `notifications` ➔ `utilisateurs_fluxasync`
```sql
-- Notification envoyée à Kouadio sur WhatsApp
INSERT INTO notifications (
    id_utilisateur, type_notification, titre_notification, contenu_notification,
    canal_envoi, destinataire, reference_element_id, type_reference
) VALUES (
    1, 'mise_jour_commande', 'Nouvelle commande reçue',
    'Aminata Traoré a commandé 1x Nike Air Max 90 - Total: 45.000 FCFA',
    'whatsapp', '+225 07 12 34 56 78', 1, 'commande'
);
```

### 📊 **15. ANALYTICS QUOTIDIENNES**

**Relation** : `sessions_analytiques` ➔ `utilisateurs_fluxasync`
```sql
-- Métriques de la journée pour Kouadio
INSERT INTO sessions_analytiques (
    id_utilisateur, date_session, messages_recus, commandes_creees,
    chiffre_affaires_genere, emails_traites
) VALUES (
    1, '2025-06-28', 15, 3, 120000, 5
);
```

---

## 🎯 **EXEMPLES DE REQUÊTES INTER-TABLES**

### **Récupérer toutes les commandes d'un vendeur avec détails**
```sql
SELECT 
    u.nom || ' ' || u.prenom AS vendeur,
    p.nom_complet AS client,
    c.numero_commande,
    pr.nom_produit,
    dc.quantite_commandee,
    c.statut_commande,
    l.statut_livraison
FROM utilisateurs_fluxasync u
JOIN prospects p ON p.id_utilisateur = u.id_utilisateur
JOIN commandes c ON c.id_prospect = p.id_prospect
JOIN details_commande dc ON dc.id_commande = c.id_commande
JOIN produits pr ON pr.id_produit = dc.id_produit
LEFT JOIN livraisons l ON l.id_commande = c.id_commande
WHERE u.id_utilisateur = 1;
```

### **Historique complet d'une conversation**
```sql
SELECT 
    p.nom_complet AS prospect,
    m.contenu_message,
    m.direction_message,
    m.genere_par_ia,
    m.date_creation
FROM prospects p
JOIN conversations conv ON conv.id_prospect = p.id_prospect
JOIN messages m ON m.id_conversation = conv.id_conversation
WHERE p.id_prospect = 1
ORDER BY m.date_creation;
```

### **Dashboard vendeur complet**
```sql
SELECT 
    u.nom || ' ' || u.prenom AS vendeur,
    COUNT(DISTINCT p.id_prospect) AS total_prospects,
    COUNT(DISTINCT c.id_commande) AS total_commandes,
    SUM(c.montant_total) AS chiffre_affaires,
    COUNT(DISTINCT CASE WHEN l.statut_livraison = 'livree' THEN l.id_livraison END) AS livraisons_reussies
FROM utilisateurs_fluxasync u
LEFT JOIN prospects p ON p.id_utilisateur = u.id_utilisateur
LEFT JOIN commandes c ON c.id_prospect = p.id_prospect
LEFT JOIN livraisons l ON l.id_commande = c.id_commande
WHERE u.id_utilisateur = 1
GROUP BY u.id_utilisateur, u.nom, u.prenom;
```

---

## 🔄 **FLUX DE DONNÉES AUTOMATIQUES**

1. **Prospect contacte** → `prospects` créé
2. **Message reçu** → `conversations` + `messages` 
3. **IA répond** → nouveau `message` (genere_par_ia = TRUE)
4. **Commande confirmée** → `commandes` + `details_commande`
5. **Livreur assigné** → `livraisons` mis à jour
6. **Notifications envoyées** → `notifications` créé
7. **Métriques calculées** → `sessions_analytiques` mis à jour

---

## 📈 **AVANTAGES DE CETTE STRUCTURE**

✅ **Traçabilité complète** : Chaque action est liée à un utilisateur
✅ **Scalabilité** : Multi-vendeurs avec isolation des données  
✅ **Analytics précises** : Relations permettent calculs complexes
✅ **Intégrité des données** : Contraintes Foreign Key
✅ **Performance optimisée** : Index sur colonnes de jointure


##### -------------------------------------------------------------------------------- ####

# 🔗 RELATIONS ENTRE TABLES FLUXASYNC - EXPLICATIONS CONCRÈTES

## 📊 VUE D'ENSEMBLE DES RELATIONS## 💾 COMMANDES D'EXPORT POSTGRESQL

### **🎯 EXPORT COMPLET DE LA BASE DE DONNÉES**

```bash
# Export structure + données (recommandé)
pg_dump -h localhost -U postgres -d fluxasync_bd > fluxasync_export_complet.sql

# Avec compression (plus rapide)
pg_dump -h localhost -U postgres -d fluxasync_bd | gzip > fluxasync_export_complet.sql.gz

# Format personnalisé (plus flexible)
pg_dump -h localhost -U postgres -d fluxasync_bd -Fc > fluxasync_export.dump
```

### **🏗️ EXPORT STRUCTURE UNIQUEMENT**

```bash
# Structure seulement (sans données)
pg_dump -h localhost -U postgres -d fluxasync_bd --schema-only > fluxasync_structure.sql

# Structure + commentaires
pg_dump -h localhost -U postgres -d fluxasync_bd --schema-only --verbose > fluxasync_structure_detaille.sql
```

### **📊 EXPORT DONNÉES UNIQUEMENT**

```bash
# Données seulement (sans structure)
pg_dump -h localhost -U postgres -d fluxasync_bd --data-only > fluxasync_donnees.sql

# Données avec format INSERT
pg_dump -h localhost -U postgres -d fluxasync_bd --data-only --inserts > fluxasync_donnees_insert.sql
```

### **🎯 EXPORT TABLES SPÉCIFIQUES**

```bash
# Une table spécifique
pg_dump -h localhost -U postgres -d fluxasync_bd -t utilisateurs_fluxasync > users_only.sql

# Plusieurs tables
pg_dump -h localhost -U postgres -d fluxasync_bd -t utilisateurs_fluxasync -t produits -t commandes > tables_principales.sql

# Exclure certaines tables
pg_dump -h localhost -U postgres -d fluxasync_bd --exclude-table=journaux_systeme --exclude-table=utilisation_apis > sans_logs.sql
```

### **🔐 EXPORT AVEC AUTHENTIFICATION**

```bash
# Si mot de passe requis
PGPASSWORD=votre_mot_de_passe pg_dump -h localhost -U postgres -d fluxasync_bd > export.sql

# Ou avec prompt sécurisé
pg_dump -h localhost -U postgres -d fluxasync_bd -W > export.sql
```

### **🌐 EXPORT POUR MIGRATION**

```bash
# Compatible avec d'autres versions PostgreSQL
pg_dump -h localhost -U postgres -d fluxasync_bd --no-owner --no-privileges > migration.sql

# Format SQL pur (compatible MySQL avec adaptations)
pg_dump -h localhost -U postgres -d fluxasync_bd --inserts --no-owner > export_universel.sql
```

### **📁 COMMANDE RECOMMANDÉE POUR VOTRE CAS**

```bash
# Export complet avec toutes les options
pg_dump -h localhost -U postgres -d fluxasync_bd \
  --verbose \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file=fluxasync_backup_$(date +%Y%m%d_%H%M%S).dump
```

### **🔄 RESTAURATION DE L'EXPORT**

```bash
# Restaurer un export SQL
psql -h localhost -U postgres -d nouvelle_base < fluxasync_export_complet.sql

# Restaurer un dump custom
pg_restore -h localhost -U postgres -d nouvelle_base fluxasync_backup.dump

# Créer nouvelle base + restaurer
createdb -h localhost -U postgres nouvelle_fluxasync_bd
pg_restore -h localhost -U postgres -d nouvelle_fluxasync_bd fluxasync_backup.dump
```

### **📋 VÉRIFICATION POST-EXPORT**

```bash
# Vérifier la taille du fichier
ls -lh fluxasync_export_complet.sql

# Compter les lignes
wc -l fluxasync_export_complet.sql

# Vérifier les tables dans l'export
grep "CREATE TABLE" fluxasync_export_complet.sql
```

## 🎯 **RÉSUMÉ DES RELATIONS CLÉS**

**Relations 1:1** (One-to-One) :
- `utilisateurs_fluxasync` ↔ `comptes_whatsapp`
- `commandes` ↔ `livraisons`
- `emails_recus` ↔ `analyses_emails`

**Relations 1:N** (One-to-Many) :
- `utilisateurs_fluxasync` → `prospects`
- `prospects` → `conversations`  
- `conversations` → `messages`
- `utilisateurs_fluxasync` → `produits`
- `prospects` → `commandes`

**Relations N:M** (Many-to-Many) :
- `commandes` ↔ `produits` (via `details_commande`)

Cette structure permet une **traçabilité complète** depuis l'inscription du vendeur jusqu'à la livraison finale, avec tous les analytics nécessaires pour optimiser les performances !