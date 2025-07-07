# 📧 CONFIGURATION GMAIL POUR FLUXASYNC

## 🔧 **ÉTAPES POUR CONFIGURER GMAIL**

### **1. Activer l'authentification à 2 facteurs**
1. Allez sur [Google Account](https://myaccount.google.com/)
2. **Sécurité** → **Authentification à 2 facteurs**
3. **Activez** l'authentification à 2 facteurs

### **2. Générer un mot de passe d'application**
1. Dans **Sécurité** → **Mots de passe des applications**
2. **Sélectionner l'application** : Autre (nom personnalisé)
3. **Nom** : FluxAsync Backend
4. **Générer** → Copiez le mot de passe généré (16 caractères)

### **3. Mettre à jour le fichier .env**
```env
# Configuration Email Gmail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=startup.explora.studio@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop  # Le mot de passe d'application généré
MAIL_FROM="FluxAsync <noreply@fluxasync.com>"
```

### **4. Alternative avec SendGrid (recommandé pour production)**
```env
# Configuration SendGrid (plus fiable pour production)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.votre_api_key_sendgrid
MAIL_FROM="FluxAsync <noreply@fluxasync.com>"
```

## 🧪 **TEST DE CONFIGURATION**

Une fois configuré, testez avec :

```bash
# Démarrer le serveur
npm run start:dev

# Tester l'inscription (envoi OTP)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "adresse_email": "votre.email.test@gmail.com",
    "numero_telephone": "+225 07 11 22 33 44",
    "pays": "Côte d'\''Ivoire",
    "mot_de_passe": "Password123!"
  }'
```

## 🚨 **RÉSOLUTION DES PROBLÈMES**

### **Erreur "Invalid login"**
- Vérifiez que l'authentification 2FA est activée
- Utilisez le mot de passe d'application, pas votre mot de passe Gmail
- Vérifiez que l'email est correct

### **Erreur "Connection timeout"**
- Vérifiez votre connexion internet
- Essayez avec le port 465 (SSL) au lieu de 587 (TLS)

### **Emails non reçus**
- Vérifiez le dossier spam
- Testez avec une autre adresse email
- Vérifiez les logs du serveur pour des erreurs

## 📋 **VARIABLES COMPLÈTES .env**

```env
# Configuration Base de Données Supabase
DATABASE_HOST=aws-0-eu-west-2.pooler.supabase.com
DATABASE_PORT=5432
DATABASE_USERNAME=postgres.wimxjmhmqqfhbmlpyymd
DATABASE_PASSWORD=6_Te@mExplora
DATABASE_NAME=postgres

# Configuration JWT
JWT_SECRET=super_secret_key_256_bits_minimum_pour_production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=refresh_secret_key_different_from_jwt_secret
JWT_REFRESH_EXPIRATION=7d

# Configuration API
PORT=3000
NODE_ENV=development

# Configuration Email Gmail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=startup.explora.studio@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_application_gmail
MAIL_FROM="FluxAsync <noreply@fluxasync.com>"

# Configuration OTP
OTP_EXPIRATION_MINUTES=10
OTP_LENGTH=6

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# WhatsApp Cloud API (pour plus tard)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Gemini AI (pour plus tard)
GEMINI_API_KEY=
```