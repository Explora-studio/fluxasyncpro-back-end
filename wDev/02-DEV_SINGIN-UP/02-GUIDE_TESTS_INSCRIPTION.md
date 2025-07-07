# 🧪 GUIDE DE TESTS - SYSTÈME D'INSCRIPTION FLUXASYNC

## 🚀 **DÉMARRAGE DU SERVEUR**

```bash
# Dans le dossier fluxasync-backend
npm run start:dev
```

**✅ Vérification** : Le serveur doit afficher :
```
🚀 FluxAsync Backend démarré sur le port 3000
📚 Documentation Swagger disponible sur http://localhost:3000/api
```

---

## 📋 **TESTS PAR ORDRE CHRONOLOGIQUE**

### **🏥 Test 1 : Health Check**
```bash
curl http://localhost:3000/api/v1/health
```

**✅ Réponse attendue :**
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "message": "Connexion Supabase PostgreSQL active"
  }
}
```

---

### **📝 Test 2 : Inscription avec OTP**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "adresse_email": "votre.email@gmail.com",
    "numero_telephone": "+225 07 11 22 33 44",
    "pays": "Côte d'\''Ivoire",
    "mot_de_passe": "Password123!"
  }'
```

**✅ Réponse attendue :**
```json
{
  "message": "Inscription réussie ! Vérifiez votre email pour le code OTP.",
  "email": "votre.email@gmail.com"
}
```

**✅ Vérifications :**
- [x] Email OTP reçu dans la boîte mail
- [x] Code à 6 chiffres présent
- [x] Template HTML bien formaté

---

### **🔐 Test 3 : Vérification OTP**
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "adresse_email": "votre.email@gmail.com",
    "otp_code": "123456"
  }'
```

**✅ Réponse attendue :**
```json
{
  "message": "Compte vérifié avec succès ! Vous pouvez maintenant vous connecter."
}
```

**✅ Vérifications :**
- [x] Email de bienvenue reçu
- [x] Compte marqué comme vérifié en base

---

### **🔑 Test 4 : Connexion JWT**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adresse_email": "votre.email@gmail.com",
    "mot_de_passe": "Password123!"
  }'
```

**✅ Réponse attendue :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_utilisateur": 1,
    "nom_complet": "User Test",
    "adresse_email": "votre.email@gmail.com",
    "plan_abonnement": "gratuit",
    "compte_verifie": true,
    "otp_verified": true
  }
}
```

**📝 Important :** Copiez l'`access_token` pour les tests suivants !

---

### **👤 Test 5 : Profil utilisateur (Protégé)**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**✅ Réponse attendue :**
```json
{
  "id_utilisateur": 1,
  "adresse_email": "votre.email@gmail.com",
  "nom_complet": "User Test",
  "plan_abonnement": "gratuit",
  "compte_verifie": true,
  "otp_verified": true
}
```

---

### **📊 Test 6 : Dashboard utilisateur (Protégé)**
```bash
curl -X GET http://localhost:3000/api/v1/auth/dashboard \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**✅ Réponse attendue :**
```json
{
  "utilisateur": {
    "id_utilisateur": 1,
    "nom_complet": "User Test",
    "adresse_email": "votre.email@gmail.com"
  },
  "statistiques": {
    "total_prospects": 0,
    "total_commandes": 0,
    "compte_cree_depuis": 1
  },
  "statut_compte": {
    "verifie": true,
    "otp_confirme": true,
    "plan": "gratuit"
  }
}
```

---

### **🔄 Test 7 : Refresh Token**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "VOTRE_REFRESH_TOKEN"
  }'
```

**✅ Réponse attendue :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **🚪 Test 8 : Déconnexion**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**✅ Réponse attendue :**
```json
{
  "message": "Déconnexion réussie"
}
```

---

## 🚨 **TESTS DE SÉCURITÉ**

### **❌ Test 9 : Accès sans token**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me
```

**✅ Réponse attendue :** `401 Unauthorized`

### **❌ Test 10 : Token invalide**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer token_invalide"
```

**✅ Réponse attendue :** `401 Unauthorized`

### **❌ Test 11 : OTP expiré**
```bash
# Attendre 10+ minutes après inscription, puis :
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "adresse_email": "email@test.com",
    "otp_code": "123456"
  }'
```

**✅ Réponse attendue :** `400 Bad Request - Code OTP expiré`

---

## 📋 **CHECKLIST DE VALIDATION**

### **✅ Infrastructure**
- [x] Serveur démarre sans erreur
- [x] Base de données connectée
- [x] Swagger accessible sur `/api`

### **✅ Email**
- [x] Configuration Gmail fonctionnelle
- [x] Template OTP bien formaté
- [x] Email de bienvenue envoyé
- [x] Pas d'erreur dans les logs

### **✅ Authentification**
- [x] Inscription avec validation des données
- [x] Génération OTP 6 chiffres
- [x] Vérification OTP avec expiration
- [x] Connexion avec JWT
- [x] Refresh token fonctionnel
- [x] Déconnexion avec invalidation

### **✅ Sécurité**
- [x] Routes protégées par JWT
- [x] Validation des données stricte
- [x] Erreurs appropriées (401, 400, 409)
- [x] Rate limiting activé
- [x] Mots de passe hachés

### **✅ User Experience**
- [x] Messages d'erreur clairs
- [x] Emails professionnels
- [x] Dashboard informatif
- [x] Documentation Swagger complète

---

## 🎯 **ENDPOINTS FINAUX DISPONIBLES**

### **🔐 Authentication (Public)**
- `POST /api/v1/auth/register` - Inscription + OTP
- `POST /api/v1/auth/verify-otp` - Vérification OTP
- `POST /api/v1/auth/resend-otp` - Renvoyer OTP
- `POST /api/v1/auth/login` - Connexion JWT
- `POST /api/v1/auth/refresh` - Renouveler token

### **👤 User Management (Protégé)**
- `GET /api/v1/auth/me` - Profil utilisateur
- `GET /api/v1/auth/dashboard` - Dashboard
- `POST /api/v1/auth/logout` - Déconnexion
- `PUT /api/v1/users/:id` - Modifier profil
- `GET /api/v1/users/stats/:id` - Statistiques

### **🏥 System (Public)**
- `GET /api/v1/health` - Health check
- `GET /api/v1/` - Hello world
- `GET /api/v1/version` - Version API

---

## 🎉 **SUCCÈS !**

Si tous ces tests passent, vous avez un **système d'inscription professionnel** avec :
- ✅ Vérification email par OTP
- ✅ Authentification JWT sécurisée  
- ✅ Dashboard utilisateur personnalisé
- ✅ Protection des routes sensibles
- ✅ Emails automatiques avec templates

**🚀 Votre backend FluxAsync est prêt pour la production !**