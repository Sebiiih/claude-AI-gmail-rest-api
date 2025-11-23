# 🇬🇧 Gmail API Server for Claude AI

> A REST API server that enables Claude AI (Code & .ai) to manage your Gmail without context limitations.
>
> **[Version française disponible ci-dessous](#gmail-api-server-pour-claude-ai)**

---

## Table of Contents

- [Overview](#overview)
- [Why This Server?](#why-this-server)
- [Prerequisites](#prerequisites)
- [Google Cloud Setup](#google-cloud-setup)
- [Installation](#installation)
- [OAuth Authentication](#oauth-authentication)
- [Usage](#usage)
  - [With Claude Code (VSCode)](#with-claude-code-vscode)
  - [With Claude.ai (Web)](#with-claudeai-web)
- [API Routes](#api-routes)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [License](#license)

---

## Overview

This server exposes Gmail management capabilities via a REST API, allowing Claude (Code or .ai) to interact with your Gmail account without the context limitations of Claude Desktop.

**Key Features:**
- Search and filter emails
- Batch delete or trash messages
- Manage labels
- Full OAuth2 security
- Works with Claude Code (200k tokens context) or Claude.ai

---

## Why This Server?

**The problem with Claude Desktop MCP:**

Claude Desktop uses the Model Context Protocol (MCP) to connect to services like Gmail. However, MCP has inherent context limitations (~20-30k tokens) regardless of your subscription tier. This makes it impractical for large tasks like sorting through thousands of emails.

**The solution: HTTP REST API**

This server exposes Gmail via standard HTTP endpoints, allowing you to use:

- **Claude Code (VSCode)**: Full model context window, works locally
- **Claude.ai (Web)**: Access from anywhere via ngrok

**Important notes:**
- Both Claude Code and Claude.ai have usage limits based on your subscription (Free, Pro, or API)
- The advantage here is **not** unlimited usage, but rather **better context handling** for large Gmail operations
- Unlike MCP which is context-limited by design, HTTP APIs allow the full model context to be utilized

---

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- A **Google account** with Gmail access
- **VSCode** with Claude Code extension (recommended)

---

## Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** (top left) → **"New Project"**
3. Enter project name: `Gmail API Server` (or any name)
4. Click **"Create"**
5. Wait for the project to be created and select it

### Step 2: Enable Gmail API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"**
4. Click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `Gmail API Server`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. On **"Scopes"** page, click **"Add or Remove Scopes"**
7. Search and select: `https://mail.google.com/` (full Gmail access)
8. Click **"Update"** → **"Save and Continue"**
9. On **"Test users"** page, click **"Add Users"**
10. Add your Gmail address
11. Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Enter name: `Gmail API Server Client`
5. Under **"Authorized redirect URIs"**, click **"Add URI"** and add:
   ```
   http://localhost:3000/oauth2callback
   ```
6. Click **"Create"**
7. A popup shows your **Client ID** and **Client Secret**
8. Click **"Download JSON"**

### Step 5: Save Credentials

1. Create directory (if it doesn't exist):
   ```bash
   # Windows
   mkdir %USERPROFILE%\.gmail-mcp

   # macOS/Linux
   mkdir -p ~/.gmail-mcp
   ```

2. Rename the downloaded JSON file to: `gcp-oauth.keys.json`

3. Move it to the directory:
   ```bash
   # Windows
   move Downloads\gcp-oauth.keys.json %USERPROFILE%\.gmail-mcp\

   # macOS/Linux
   mv ~/Downloads/gcp-oauth.keys.json ~/.gmail-mcp/
   ```

---

## Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd gmail-api-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## OAuth Authentication

Before using the server, you need to authenticate with your Google account.

1. Navigate to the OAuth setup directory:
   ```bash
   cd ~/.gmail-mcp
   # or on Windows: cd %USERPROFILE%\.gmail-mcp
   ```

2. Run the authentication script (from the Claude MCP Gmail project):
   ```bash
   node auth.js
   ```

3. Follow the instructions:
   - A URL will be displayed
   - Open it in your browser
   - Sign in with your Google account
   - Authorize the application
   - Copy the authorization code
   - Paste it back in the terminal

4. A `credentials.json` file will be created in `~/.gmail-mcp/`

**Directory structure should be:**
```
~/.gmail-mcp/
├── gcp-oauth.keys.json  (OAuth client credentials)
└── credentials.json     (Access token - created after auth)
```

---

## Usage

### With Claude Code (VSCode)

**Recommended for large tasks (200k tokens context)**

#### 1. Start the server

```bash
cd path/to/gmail-api-server
node server.js
```

The server will display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Gmail API Server started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: http://localhost:3000
🔑 API Key: gmail-api-xxxxxxxxx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copy the API key!**

#### 2. Open VSCode with Claude Code

1. Open VSCode
2. Start a conversation with Claude Code

#### 3. Give Claude Code access

Paste this message in the conversation:

```
I have a Gmail API server running on localhost:3000
API Key: gmail-api-xxxxxxxxx
The code is in "path/to/gmail-api-server/server.js"

Help me manage my Gmail emails.
```

**Replace `gmail-api-xxxxxxxxx` with your actual API key!**

Claude Code will automatically read `server.js` to discover available endpoints.

---

### With Claude.ai (Web)

**For access from anywhere (requires ngrok)**

#### 1. Install ngrok

Download from: https://ngrok.com/download

**Windows:**
- Extract `ngrok.exe` to a folder
- Add to PATH or run directly

**macOS:**
```bash
brew install ngrok
```

**Linux:**
```bash
sudo snap install ngrok
```

#### 2. Expose the server

In a **new terminal** (keep the server running):

```bash
ngrok http 3000
```

You'll get a public URL:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL!**

#### 3. Use with Claude.ai

Go to https://claude.ai and start a conversation:

```
I have a Gmail API server running on https://abc123.ngrok.io
API Key: gmail-api-xxxxxxxxx

Help me manage my Gmail emails.
```

---

## API Routes

All routes require the header:
```
X-Api-Key: gmail-api-xxxxxxxxx
```

### Labels

**List labels**
```http
POST /api/labels/list
Content-Type: application/json

{}
```

**Create label**
```http
POST /api/labels/create
Content-Type: application/json

{
  "name": "New Label"
}
```

### Messages

**Search emails**
```http
POST /api/messages/search
Content-Type: application/json

{
  "query": "from:example.com",
  "maxResults": 100
}
```

Query syntax: [Gmail search operators](https://support.google.com/mail/answer/7190)

**Get email**
```http
POST /api/messages/get
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5"
}
```

**Delete email**
```http
POST /api/messages/delete
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5"
}
```

**Batch delete emails**
```http
POST /api/messages/batch-delete
Content-Type: application/json

{
  "messageIds": ["id1", "id2", "id3"]
}
```

**Batch trash emails**
```http
POST /api/messages/batch-trash
Content-Type: application/json

{
  "messageIds": ["id1", "id2", "id3"]
}
```

**Add label to email**
```http
POST /api/messages/add-label
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5",
  "labelId": "Label_123"
}
```

**Remove label from email**
```http
POST /api/messages/remove-label
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5",
  "labelId": "Label_123"
}
```

---

## Troubleshooting

### Server won't start

**Error: "address already in use"**
- The server is already running on port 3000
- Check with: `netstat -ano | grep 3000` (Windows/Linux) or `lsof -i :3000` (macOS)
- Kill the process or change the port in `server.js`

**Error: "Cannot find module"**
- Install dependencies: `npm install`

### Gmail authentication errors

**Error: "Invalid credentials"**
- Ensure `gcp-oauth.keys.json` and `credentials.json` exist in `~/.gmail-mcp/`
- Re-run the authentication: `node auth.js`

**Error: "Access denied"**
- Make sure you added your email as a test user in Google Cloud Console
- Check that the Gmail API is enabled
- Verify the OAuth scope includes `https://mail.google.com/`

### API key errors

**Error: "Invalid API key"**
- Use the exact key displayed when the server started
- Header must be: `X-Api-Key: gmail-api-xxxxxxxxx`
- The key changes every time you restart the server

---

## Best Practices & Rate Limits

### Gmail API Rate Limits

Google Gmail API has rate limits to prevent abuse:
- **Per-user limits**: 250 quota units per second
- **Batch operations**: Limited to 100 messages per batch request
- **Daily quotas**: Vary by operation type

### Recommendations

**When performing bulk operations** (deleting 1000+ emails):
- Process in batches of 100 messages maximum
- Add delays between batches (500ms - 1s recommended)
- Monitor for rate limit errors (HTTP 429)

**Example rate-limiting implementation:**
```javascript
// Process emails in batches of 100
for (let i = 0; i < messageIds.length; i += 100) {
  const batch = messageIds.slice(i, i + 100);
  await deleteBatch(batch);

  // Wait 500ms between batches to avoid rate limits
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

**Why these delays?**
- Prevents hitting Google's rate limits
- Avoids temporary account suspension
- Ensures reliable operation for large tasks

**Performance vs Safety:**
- Without delays: Risk of being blocked by Google
- With delays: Slower but reliable (e.g., 1000 emails in ~5 minutes)

---

## Security

- **API Key**: Generated randomly on each server start. Do not share it.
- **OAuth Credentials**: Never commit `gcp-oauth.keys.json` or `credentials.json` to git.
- **Local Use**: For maximum security, use with Claude Code (localhost only).
- **Public Use**: If using ngrok, the URL is temporary but publicly accessible. Stop ngrok when done.
- **.gitignore**: The included `.gitignore` prevents sensitive files from being committed.

---

## Author

**Created by Sebiiih**

[![GitHub](https://img.shields.io/badge/GitHub-Sebiiih-181717?style=for-the-badge&logo=github)](https://github.com/Sebiiih)

**Professional development services:** [Evonia Tech - evonia.tech](https://evonia.tech)

---

## License

MIT

---
---
---

# 🇫🇷 Gmail API Server pour Claude AI

> Un serveur API REST qui permet à Claude AI (Code & .ai) de gérer votre Gmail sans limites de contexte.

---

## Table des matières

- [Aperçu](#aperçu)
- [Pourquoi ce serveur ?](#pourquoi-ce-serveur)
- [Prérequis](#prérequis)
- [Configuration Google Cloud](#configuration-google-cloud)
- [Installation](#installation-1)
- [Authentification OAuth](#authentification-oauth)
- [Utilisation](#utilisation-1)
  - [Avec Claude Code (VSCode)](#avec-claude-code-vscode)
  - [Avec Claude.ai (Web)](#avec-claudeai-web-1)
- [Routes API](#routes-api)
- [Dépannage](#dépannage)
- [Sécurité](#sécurité)
- [Licence](#licence)

---

## Aperçu

Ce serveur expose les fonctionnalités de gestion Gmail via une API REST, permettant à Claude (Code ou .ai) d'interagir avec votre compte Gmail sans les limites de contexte de Claude Desktop.

**Fonctionnalités principales :**
- Rechercher et filtrer des emails
- Supprimer ou mettre à la corbeille en masse
- Gérer les libellés
- Sécurité OAuth2 complète
- Fonctionne avec Claude Code (contexte de 200k tokens) ou Claude.ai

---

## Pourquoi ce serveur ?

**Le problème avec Claude Desktop MCP :**

Claude Desktop utilise le Model Context Protocol (MCP) pour se connecter à des services comme Gmail. Cependant, MCP a des limites de contexte intrinsèques (~20-30k tokens) quel que soit votre abonnement. Cela le rend peu pratique pour les grandes tâches comme trier des milliers d'emails.

**La solution : API REST HTTP**

Ce serveur expose Gmail via des endpoints HTTP standards, vous permettant d'utiliser :

- **Claude Code (VSCode)** : Fenêtre de contexte complète du modèle, fonctionne en local
- **Claude.ai (Web)** : Accès depuis n'importe où via ngrok

**Notes importantes :**
- Claude Code et Claude.ai ont tous deux des limites d'usage selon votre abonnement (Gratuit, Pro, ou API)
- L'avantage ici n'est **pas** un usage illimité, mais une **meilleure gestion du contexte** pour les opérations Gmail volumineuses
- Contrairement au MCP qui est limité en contexte par design, les API HTTP permettent d'utiliser la fenêtre de contexte complète du modèle

---

## Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** (fourni avec Node.js)
- Un **compte Google** avec accès Gmail
- **VSCode** avec l'extension Claude Code (recommandé)

---

## Configuration Google Cloud

### Étape 1 : Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Sélectionner un projet"** (en haut à gauche) → **"Nouveau projet"**
3. Entrez le nom du projet : `Gmail API Server` (ou tout autre nom)
4. Cliquez sur **"Créer"**
5. Attendez la création du projet et sélectionnez-le

### Étape 2 : Activer l'API Gmail

1. Dans la barre latérale gauche, allez à **"API et services"** → **"Bibliothèque"**
2. Recherchez **"Gmail API"**
3. Cliquez sur **"Gmail API"**
4. Cliquez sur **"Activer"**

### Étape 3 : Configurer l'écran de consentement OAuth

1. Allez à **"API et services"** → **"Écran de consentement OAuth"**
2. Sélectionnez **"Externe"** (sauf si vous avez Google Workspace)
3. Cliquez sur **"Créer"**
4. Remplissez les champs obligatoires :
   - **Nom de l'application** : `Gmail API Server`
   - **E-mail d'assistance utilisateur** : Votre email
   - **E-mail du développeur** : Votre email
5. Cliquez sur **"Enregistrer et continuer"**
6. Sur la page **"Champs d'application"**, cliquez sur **"Ajouter ou supprimer des champs d'application"**
7. Recherchez et sélectionnez : `https://mail.google.com/` (accès complet Gmail)
8. Cliquez sur **"Mettre à jour"** → **"Enregistrer et continuer"**
9. Sur la page **"Utilisateurs de test"**, cliquez sur **"Ajouter des utilisateurs"**
10. Ajoutez votre adresse Gmail
11. Cliquez sur **"Enregistrer et continuer"** → **"Retour au tableau de bord"**

### Étape 4 : Créer les identifiants OAuth

1. Allez à **"API et services"** → **"Identifiants"**
2. Cliquez sur **"Créer des identifiants"** → **"ID client OAuth"**
3. Sélectionnez **"Application Web"**
4. Entrez le nom : `Gmail API Server Client`
5. Sous **"URI de redirection autorisés"**, cliquez sur **"Ajouter un URI"** et ajoutez :
   ```
   http://localhost:3000/oauth2callback
   ```
6. Cliquez sur **"Créer"**
7. Une popup affiche votre **ID client** et **Secret client**
8. Cliquez sur **"Télécharger JSON"**

### Étape 5 : Enregistrer les identifiants

1. Créez le répertoire (s'il n'existe pas) :
   ```bash
   # Windows
   mkdir %USERPROFILE%\.gmail-mcp

   # macOS/Linux
   mkdir -p ~/.gmail-mcp
   ```

2. Renommez le fichier JSON téléchargé en : `gcp-oauth.keys.json`

3. Déplacez-le dans le répertoire :
   ```bash
   # Windows
   move Downloads\gcp-oauth.keys.json %USERPROFILE%\.gmail-mcp\

   # macOS/Linux
   mv ~/Downloads/gcp-oauth.keys.json ~/.gmail-mcp/
   ```

---

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone <url-de-votre-repo>
   cd gmail-api-server
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

---

## Authentification OAuth

Avant d'utiliser le serveur, vous devez vous authentifier avec votre compte Google.

1. Naviguez vers le répertoire de configuration OAuth :
   ```bash
   cd ~/.gmail-mcp
   # ou sur Windows : cd %USERPROFILE%\.gmail-mcp
   ```

2. Exécutez le script d'authentification (du projet Claude MCP Gmail) :
   ```bash
   node auth.js
   ```

3. Suivez les instructions :
   - Une URL sera affichée
   - Ouvrez-la dans votre navigateur
   - Connectez-vous avec votre compte Google
   - Autorisez l'application
   - Copiez le code d'autorisation
   - Collez-le dans le terminal

4. Un fichier `credentials.json` sera créé dans `~/.gmail-mcp/`

**Structure du répertoire :**
```
~/.gmail-mcp/
├── gcp-oauth.keys.json  (Identifiants client OAuth)
└── credentials.json     (Token d'accès - créé après auth)
```

---

## Utilisation

### Avec Claude Code (VSCode)

**Recommandé pour les grandes tâches (contexte de 200k tokens)**

#### 1. Démarrer le serveur

```bash
cd chemin/vers/gmail-api-server
node server.js
```

Le serveur affichera :
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Gmail API Server démarré !
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Serveur: http://localhost:3000
🔑 API Key: gmail-api-xxxxxxxxx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copiez la clé API !**

#### 2. Ouvrir VSCode avec Claude Code

1. Ouvrez VSCode
2. Démarrez une conversation avec Claude Code

#### 3. Donner accès à Claude Code

Collez ce message dans la conversation :

```
J'ai un serveur Gmail API qui tourne sur localhost:3000
Clé API : gmail-api-xxxxxxxxx
Le code est dans "chemin/vers/gmail-api-server/server.js"

Aide-moi à gérer mes emails Gmail.
```

**Remplacez `gmail-api-xxxxxxxxx` par votre vraie clé API !**

Claude Code lira automatiquement `server.js` pour découvrir les endpoints disponibles.

---

### Avec Claude.ai (Web)

**Pour un accès depuis n'importe où (nécessite ngrok)**

#### 1. Installer ngrok

Téléchargez depuis : https://ngrok.com/download

**Windows :**
- Extrayez `ngrok.exe` dans un dossier
- Ajoutez au PATH ou exécutez directement

**macOS :**
```bash
brew install ngrok
```

**Linux :**
```bash
sudo snap install ngrok
```

#### 2. Exposer le serveur

Dans un **nouveau terminal** (laissez le serveur tourner) :

```bash
ngrok http 3000
```

Vous obtiendrez une URL publique :
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

**Copiez l'URL HTTPS !**

#### 3. Utiliser avec Claude.ai

Allez sur https://claude.ai et démarrez une conversation :

```
J'ai un serveur Gmail API qui tourne sur https://abc123.ngrok.io
Clé API : gmail-api-xxxxxxxxx

Aide-moi à gérer mes emails Gmail.
```

---

## Routes API

Toutes les routes nécessitent le header :
```
X-Api-Key: gmail-api-xxxxxxxxx
```

### Libellés

**Lister les libellés**
```http
POST /api/labels/list
Content-Type: application/json

{}
```

**Créer un libellé**
```http
POST /api/labels/create
Content-Type: application/json

{
  "name": "Nouveau Libellé"
}
```

### Messages

**Rechercher des emails**
```http
POST /api/messages/search
Content-Type: application/json

{
  "query": "from:exemple.com",
  "maxResults": 100
}
```

Syntaxe de recherche : [Opérateurs de recherche Gmail](https://support.google.com/mail/answer/7190)

**Obtenir un email**
```http
POST /api/messages/get
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5"
}
```

**Supprimer un email**
```http
POST /api/messages/delete
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5"
}
```

**Supprimer plusieurs emails**
```http
POST /api/messages/batch-delete
Content-Type: application/json

{
  "messageIds": ["id1", "id2", "id3"]
}
```

**Déplacer à la corbeille**
```http
POST /api/messages/batch-trash
Content-Type: application/json

{
  "messageIds": ["id1", "id2", "id3"]
}
```

**Ajouter un libellé**
```http
POST /api/messages/add-label
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5",
  "labelId": "Label_123"
}
```

**Retirer un libellé**
```http
POST /api/messages/remove-label
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5",
  "labelId": "Label_123"
}
```

---

## Dépannage

### Le serveur ne démarre pas

**Erreur : "address already in use"**
- Le serveur tourne déjà sur le port 3000
- Vérifiez avec : `netstat -ano | grep 3000` (Windows/Linux) ou `lsof -i :3000` (macOS)
- Tuez le processus ou changez le port dans `server.js`

**Erreur : "Cannot find module"**
- Installez les dépendances : `npm install`

### Erreurs d'authentification Gmail

**Erreur : "Invalid credentials"**
- Assurez-vous que `gcp-oauth.keys.json` et `credentials.json` existent dans `~/.gmail-mcp/`
- Relancez l'authentification : `node auth.js`

**Erreur : "Access denied"**
- Vérifiez que vous avez ajouté votre email comme utilisateur de test dans Google Cloud Console
- Vérifiez que l'API Gmail est activée
- Vérifiez que le scope OAuth inclut `https://mail.google.com/`

### Erreurs de clé API

**Erreur : "Invalid API key"**
- Utilisez exactement la clé affichée au démarrage du serveur
- Le header doit être : `X-Api-Key: gmail-api-xxxxxxxxx`
- La clé change à chaque redémarrage du serveur

---

## Bonnes pratiques & Limites de débit

### Limites de l'API Gmail

L'API Gmail de Google impose des limites de débit pour éviter les abus :
- **Limites par utilisateur** : 250 unités de quota par seconde
- **Opérations par lots** : Limitées à 100 messages par requête batch
- **Quotas journaliers** : Varient selon le type d'opération

### Recommandations

**Lors d'opérations en masse** (suppression de 1000+ emails) :
- Traiter par lots de 100 messages maximum
- Ajouter des délais entre les lots (500ms - 1s recommandé)
- Surveiller les erreurs de limite de débit (HTTP 429)

**Exemple d'implémentation avec gestion des limites :**
```javascript
// Traiter les emails par lots de 100
for (let i = 0; i < messageIds.length; i += 100) {
  const batch = messageIds.slice(i, i + 100);
  await deleteBatch(batch);

  // Attendre 500ms entre les lots pour éviter les limites
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

**Pourquoi ces délais ?**
- Évite de dépasser les limites de Google
- Prévient la suspension temporaire du compte
- Garantit un fonctionnement fiable pour les grandes tâches

**Performance vs Sécurité :**
- Sans délais : Risque d'être bloqué par Google
- Avec délais : Plus lent mais fiable (ex: 1000 emails en ~5 minutes)

---

## Sécurité

- **Clé API** : Générée aléatoirement à chaque démarrage. Ne la partagez pas.
- **Identifiants OAuth** : Ne commitez jamais `gcp-oauth.keys.json` ou `credentials.json` sur git.
- **Usage local** : Pour une sécurité maximale, utilisez avec Claude Code (localhost uniquement).
- **Usage public** : Si vous utilisez ngrok, l'URL est temporaire mais publiquement accessible. Arrêtez ngrok quand vous avez terminé.
- **.gitignore** : Le `.gitignore` inclus empêche les fichiers sensibles d'être commités.

---

## Auteur

**Créé par Sebiiih**

[![GitHub](https://img.shields.io/badge/GitHub-Sebiiih-181717?style=for-the-badge&logo=github)](https://github.com/Sebiiih)

**Services de développement professionnel :** [Evonia Tech - evonia.tech](https://evonia.tech)

---

## Licence

MIT
