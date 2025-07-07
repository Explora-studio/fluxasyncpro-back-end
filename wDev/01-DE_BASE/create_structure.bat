@echo off
cd /d "C:\Users\NGUESSAN.DESKTOP-38E6PIP\Desktop\Start-up Explora-Studio\Projets Internes\001-MTN_YELLOW_START-UP_2025\fluxasync-backend"

REM Création du dossier src principal
mkdir src

REM Création des modules principaux
mkdir src\auth
mkdir src\users
mkdir src\whatsapp
mkdir src\prospects
mkdir src\conversations
mkdir src\messages
mkdir src\products
mkdir src\orders
mkdir src\deliveries
mkdir src\emails
mkdir src\notifications
mkdir src\analytics
mkdir src\campaigns
mkdir src\subscriptions
mkdir src\webhooks

REM Création du dossier common et ses sous-dossiers
mkdir src\common
mkdir src\common\decorators
mkdir src\common\guards
mkdir src\common\interceptors
mkdir src\common\pipes
mkdir src\common\entities

REM Création du dossier config
mkdir src\config

echo Structure de dossiers créée avec succès!