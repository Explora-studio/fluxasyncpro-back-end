

### 🎯 Objectif :

**Aider les responsables ou décideurs à ne pas rater d’e-mails importants**,
    en les filtrant, analysant, résumant et relayant **automatiquement sur WhatsApp**, le canal le plus utilisé.



###  Fonctionnement de l’automatisation des e-mails :

1. 📥 **Connexion à la boîte mail du client** (Gmail, Outlook, etc.)
2. 🤖 **Lecture intelligente des e-mails** (par notre système)
3. 🧠 **Classement automatique** par priorité :

   * 🔴 Critique (urgent, contrat, client important)
   * 🟡 Important
   * 🔵 Informatif
   * ⚪️ Spam ou sans intérêt
4. 📩 **Résumé de chaque e-mail jugé important** :

   * Sujet
   * Expéditeur
   * Degré de priorité
   * Suggestion d'action (répondre, appeler, ignorer...)
   * Indication s’il y a eu **action automatique effectuée**
5. 💬 **Transmission de ce résumé sur WhatsApp** au client ou à un responsable désigné

> Exemple : le responsable n’a pas besoin d’ouvrir sa boîte mail, il reçoit sur WhatsApp :
> “🚨 *Nouveau contrat de 15M FCFA reçu de [client.important@banque.ci](mailto:client.important@banque.ci) — deadline : aujourd’hui 17h*. Action recommandée : appeler ou signer.”


## 🧰 Bénéfices identifiés :

* ⏱ Gain de temps (plus besoin de trier 150+ e-mails/jour)
* ⚠ Moins de risques de rater une opportunité critique
* 📲 Meilleure réactivité (traitement via WhatsApp)
* 🧠 Automatisation intelligente, priorisée, contextuelle

pg_dump -h localhost -U postgres -d fluxasync_bd --no-owner --no-privileges --no-tablespaces --inserts --file="C:\Users\VotreNom\Desktop\fluxasync_supabase.sql"


## En résumé, :

onstruire un **assistant intelligent de lecture d’e-mails** qui :

* Lit les mails pour le client
* Les trie et les résume intelligemment
* Propose ou effectue des actions automatiques
* Envoie tout cela **sur WhatsApp**, en contexte

C’est une **extension logique et puissante** de notre système d’automatisation WhatsApp, car on ramènes tout ce qui est important **dans un seul canal prioritaire** pour nos clients.


# =================================================================================================

# 📘 FLUXASYNC – MODULE EMAIL INTELLIGENT

## 🧾 README TECHNIQUE – MODULE D’AUTOMATISATION DES EMAILS

Ce module fait partie de la plateforme **FluxAsync**, une solution intelligente d’automatisation des ventes et de communication multi-canal. Le présent module permet à nos utilisateurs de **connecter leur boîte e-mail professionnelle (Gmail, Outlook, etc.)**, de faire analyser automatiquement les e-mails via l’IA Gemini, et de **recevoir des résumés et alertes directement sur WhatsApp**.

---

## 🎯 Objectif principal

* Réduire le temps perdu à trier les e-mails
* Éviter de manquer des e-mails critiques
* Centraliser les actions importantes sur un seul canal : **WhatsApp**

---

## 🧰 Technologies utilisées

| Composant              | Technologie / Service         |
| ---------------------- | ----------------------------- |
| Authentification email | OAuth 2.0 (Google, Microsoft) |
| Accès boîte mail       | Gmail API / Microsoft Graph   |
| Backend                | NestJS (Node.js)              |
| Frontend               | React (Vite, TailwindCSS)     |
| IA NLP                 | Gemini API                    |
| Notification           | WhatsApp Cloud API (Meta)     |
| Base de données        | PostgreSQL (Supabase/VPS)     |
| Sécurité tokens        | Chiffrement AES-256           |
| Déploiement            | Render / Vercel               |

---

## 🧱 ARCHITECTURE TECHNIQUE GLOBALE

```plaintext
+---------------------+       OAuth2 + API       +--------------------+
|   Gmail / Outlook   | <----------------------> |   Backend NestJS   |
| (Compte client lié) |                         |  (Service email)   |
+---------------------+                         +--------------------+
                                                      |
                                                      | Analyse NLP
                                                      v
                                              +------------------+
                                              |     Gemini AI     |
                                              | Résumé + Actions  |
                                              +------------------+
                                                      |
                                                      | Synthèse
                                                      v
+---------------------+                         +---------------------+
| WhatsApp Cloud API  | <---- Message --------- |  WhatsApp Dispatcher |
+---------------------+                         +---------------------+
                                                      |
                                                      v
+---------------------+                         +---------------------+
| Frontend React      |  <-- État email ------> |    PostgreSQL DB     |
| (Email dashboard)   |                         | Résumés, statuts     |
+---------------------+                         +---------------------+
```

---

## ✅ Fonctionnalités clés du module

1. Connexion sécurisée à Gmail / Outlook (OAuth2)
2. Récupération automatique des e-mails récents (toutes les 5 minutes)
3. Analyse IA via Gemini (classification, résumé, action)
4. Envoi de la synthèse vers WhatsApp Cloud API
5. Historique dans base PostgreSQL
6. Tableau de bord React pour suivi des e-mails analysés

---

## 🛡 Sécurité

* Stockage chiffré des tokens e-mails (AES-256)
* Respect des scopes d’autorisations OAuth
* Logs sécurisés et auditables
* Aucune conservation des contenus bruts des e-mails

---

## 🧪 Suivi et monitoring

* **Cron / Scheduler** pour déclenchement des analyses
* **Webhook Meta** réutilisé pour messages WhatsApp
* **Sentry / UptimeRobot** pour surveillance disponibilité
* **Historique d’analyse** consultable dans le dashboard

---

## 🚀 Roadmap (prochaine étape)

* 📥 Intégration des pièces jointes critiques (PDF, docs, etc.)
* 📊 Dashboard de performance du module (temps gagné, taux de traitement)
* 💬 Réponse automatique optionnelle à certains mails (pré-approuvé)
* 🔁 Intégration aux CRM externes (HubSpot, Zoho...)

---

## 🧠 Auteur

Ce module est conçu et maintenu par l’équipe technique **Explora Studio**, avec une vision claire : **transformer chaque canal en un moteur intelligent d'opportunité et de croissance**.
