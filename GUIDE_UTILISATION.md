# Guide d'utilisation - Gmail API Server

## 📋 Table des matières

- [Démarrage rapide](#démarrage-rapide)
- [Utilisation avec Claude Code](#utilisation-avec-claude-code)
- [Utilisation avec Claude.ai (web)](#utilisation-avec-claudeai-web)
- [Routes API disponibles](#routes-api-disponibles)
- [Arrêter le serveur](#arrêter-le-serveur)
- [Dépannage](#dépannage)

---

## 🚀 Démarrage rapide

### 1. Lancer le serveur

Ouvre un terminal et lance :

```bash
cd "C:\Users\Raize\OneDrive\Bureau\Dev applis\Gmail API Server"
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

### 2. Récupérer la clé API

**⚠️ IMPORTANT : Copie la clé API affichée dans le terminal !**

La clé change à chaque démarrage du serveur. Tu en auras besoin pour toutes les requêtes.

---

## 💻 Utilisation avec Claude Code

**Avantage** : Contexte large (200k tokens) pour gérer de grosses tâches sans recommencer.

### Étapes

1. **Ouvre VSCode** avec Claude Code
2. **Dans la conversation**, colle ce message :

```
J'ai un serveur Gmail API qui tourne sur localhost:3000
Clé API : gmail-api-xxxxxxxxx
Le code est dans "C:\Users\Raize\OneDrive\Bureau\Dev applis\Gmail API Server\server.js"

Aide-moi à gérer mes emails Gmail.
```

**Remplace `gmail-api-xxxxxxxxx` par la vraie clé !**

> 💡 **Note** : Claude Code lira automatiquement le fichier `server.js` pour découvrir les routes disponibles.

---

## 🌐 Utilisation avec Claude.ai (web)

**Avantage** : Accessible depuis n'importe quel navigateur.

### 1. Installer ngrok

**Windows** :
1. Télécharge ngrok : https://ngrok.com/download
2. Extrais `ngrok.exe` dans un dossier
3. Ajoute-le au PATH ou lance-le directement

### 2. Exposer le serveur avec ngrok

Dans un **nouveau terminal** (laisse le serveur tourner dans l'autre) :

```bash
ngrok http 3000
```

Tu obtiendras une URL publique temporaire :

```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

**Copie cette URL HTTPS !**

### 3. Utiliser avec Claude.ai

Dans la conversation sur https://claude.ai, colle :

```
J'ai un serveur Gmail API qui tourne sur https://abc123.ngrok.io
Clé API : gmail-api-xxxxxxxxx

Aide-moi à gérer mes emails Gmail.
```

---

## 📡 Routes API disponibles

Toutes les routes nécessitent le header :
```
X-Api-Key: gmail-api-xxxxxxxxx
```

### 📋 Libellés

#### Lister tous les libellés
```bash
POST /api/labels/list
Content-Type: application/json

{}
```

**Réponse** :
```json
{
  "labels": [
    { "id": "Label_123", "name": "Vinted", "type": "user" }
  ]
}
```

#### Créer un libellé
```bash
POST /api/labels/create
Content-Type: application/json

{
  "name": "Nouveau Label"
}
```

---

### 📧 Messages

#### Rechercher des emails
```bash
POST /api/messages/search
Content-Type: application/json

{
  "query": "from:vinted.fr",
  "maxResults": 100
}
```

**Paramètres** :
- `query` : Recherche Gmail (ex: `from:exemple.com`, `subject:urgent`, `is:unread`)
- `maxResults` : Nombre max de résultats (défaut: 100)

**Réponse** :
```json
{
  "messages": [
    { "id": "18c7d1919656d2e5", "threadId": "..." }
  ]
}
```

#### Obtenir un email
```bash
POST /api/messages/get
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5"
}
```

#### Supprimer un email
```bash
POST /api/messages/delete
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5"
}
```

#### Supprimer plusieurs emails (BATCH)
```bash
POST /api/messages/batch-delete
Content-Type: application/json

{
  "messageIds": [
    "18c7d1919656d2e5",
    "188a9ba8e1f8f72e",
    "16b83a7f0064a5bf"
  ]
}
```

**Réponse** :
```json
{
  "success": true,
  "deletedCount": 3,
  "failedCount": 0,
  "total": 3
}
```

#### Déplacer vers la corbeille (BATCH)
```bash
POST /api/messages/batch-trash
Content-Type: application/json

{
  "messageIds": ["id1", "id2", "id3"]
}
```

---

### 🏷️ Gestion des libellés

#### Ajouter un libellé à un email
```bash
POST /api/messages/add-label
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5",
  "labelId": "Label_123"
}
```

#### Retirer un libellé d'un email
```bash
POST /api/messages/remove-label
Content-Type: application/json

{
  "messageId": "18c7d1919656d2e5",
  "labelId": "Label_123"
}
```

---

## 🛑 Arrêter le serveur

### Méthode 1 : Ctrl+C
Dans le terminal où le serveur tourne, fais `Ctrl+C`

### Méthode 2 : Tuer le processus
```bash
# Trouver le processus
netstat -ano | grep :3000

# Tuer le processus (remplace PID par le numéro)
taskkill //PID <PID> //F
```

---

## 🔧 Dépannage

### Le serveur ne démarre pas

**Erreur : "address already in use"**
- Le serveur tourne déjà sur le port 3000
- Vérifie avec : `netstat -ano | grep :3000`
- Tue le processus existant ou change le port dans `server.js`

**Erreur : "Cannot find module"**
- Installe les dépendances : `npm install`

### Erreur d'authentification Gmail

**Erreur : "Invalid credentials"**
- Vérifie que les fichiers OAuth sont présents dans `~/.gmail-mcp/` :
  - `gcp-oauth.keys.json`
  - `credentials.json`
- Consulte le README principal pour la configuration OAuth

### Erreur "Invalid API key"

- Vérifie que tu utilises la bonne clé affichée au démarrage
- Le header doit être : `X-Api-Key: gmail-api-xxxxxxxxx`
- La clé change à chaque redémarrage du serveur

---

## 📊 Comparaison des méthodes

| Fonctionnalité | Claude Code (VSCode) | Claude.ai (web) |
|----------------|---------------------|-----------------|
| Limite de contexte | ✅ Large (200k tokens) | ⚠️ Moyenne (~100k tokens) |
| Configuration | Simple (local) | Moyenne (ngrok requis) |
| Connexion Internet | ❌ Pas nécessaire | ✅ Requise |
| URL publique | ❌ Non | ✅ Oui (temporaire) |
| Sécurité | ✅ Local uniquement | ⚠️ Exposé sur Internet |

---

## 💡 Conseils d'utilisation

- **Pour trier 3000+ emails** : Utilise Claude Code (contexte plus large)
- **Pour un accès rapide depuis n'importe où** : Utilise Claude.ai + ngrok
- **Garde la clé API secrète** : Ne la partage jamais publiquement
- **Ngrok URLs sont temporaires** : Elles changent à chaque redémarrage de ngrok

---

**Créé pour permettre à Claude (Code ou .ai) d'accéder à Gmail sans les limites de Claude Desktop.**
