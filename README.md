# lib-scan

Librairie de détection de vulnérabilités pour pipelines de sécurité distribués

## 📌 Introduction

**lib-scan** est une bibliothèque modulaire de détection de vulnérabilités destinée à être intégrée dans un orchestrateur de sécurité.  
Elle analyse des événements normalisés (`NormalizedEvent`) et produit des résultats de détection (`ScanFinding`) pour un service de scoring externe, chargé de la corrélation et de l’évaluation du risque.

La lib est conçue pour être :

- **légère** : aucun scoring, aucune corrélation, uniquement de la détection.
- **rapide** : patterns optimisés, pas de dépendances lourdes.
- **modulaire** : chaque vulnérabilité possède son détecteur et ses patterns.
- **interopérable** : compatible avec un orchestrateur multi‑services (HTTP, DNS, réseau, WAF, OAST…).
- **testée** : chaque détecteur possède des tests unitaires avec couverture complète.

Elle couvre l’ensemble des vulnérabilités définies dans le type `Vulnerability` et supporte toutes les sources définies dans `EventSource`.

---

## 🔒 Vulnérabilités prises en charge

La lib détecte automatiquement les vulnérabilités suivantes :

### 🕸️ Web / HTTP

- XSS
- SQL Injection
- Path Traversal
- LFI / RFI
- Open Redirect
- Command Injection
- CRLF Injection
- Header Injection
- MIME Confusion
- Prototype Pollution
- SSTI
- XXE
- NoSQL Injection
- Upload Abuse
- UA anomalies
- JWT anomalies
- Rate Limit Abuse
- HTTP anomalies

### 🌐 Réseau / Infrastructure

- IP anomalies
- DNS anomalies
- Port Scan (vertical, horizontal, burst)

### 🧩 Autres

- Anomalies génériques
- Événements WAF
- Événements OAST

Chaque vulnérabilité possède :

- un fichier `*.patterns.ts`
- un fichier `*.detector.ts`
- des tests unitaires

---

## 🏗️ Architecture du projet

```bash
C:\DEV\LIB-SCAN\SRC
|   index.ts
|
+---adapters
|   +---oast
|   |       oast.adapter.ts
|   |       oast.types.ts
|   |
|   +---scoring
|   |       scoring.adapter.ts
|   |       scoring.types.ts
|   |
|   \---waf
|           waf.adapter.ts
|           waf.types.ts
|
+---config
|       scan.config.ts
|       scan.presets.ts
|
+---core
|       scan.context.ts
|       scan.error.ts
|       scan.instance.ts
|       scan.pipeline.ts
|       scan.registry.ts
|       scan.result.ts
|       scan.types.ts
|
+---detectors
|   +---headers
|   |       header.detector.ts
|   |       header.patterns.ts
|   |
|   +---http
|   |   +---anomaly
|   |   |       anomaly.detector.ts
|   |   |       anomaly.patterns.ts
|   |   |
|   |   +---command
|   |   |       command.detector.ts
|   |   |       command.patterns.ts
|   |   |
|   |   +---crlf
|   |   |       crlf.detector.ts
|   |   |       crlf.patterns.ts
|   |   |
|   |   +---dns
|   |   |       dns.detector.ts
|   |   |       dns.patterns.ts
|   |   |
|   |   +---ip
|   |   |       ip.detector.ts
|   |   |       ip.patterns.ts
|   |   |
|   |   +---jwt
|   |   |       jwt.detector.ts
|   |   |       jwt.patterns.ts
|   |   |
|   |   +---mime
|   |   |       mime.detector.ts
|   |   |       mime.patterns.ts
|   |   |
|   |   +---no-sql
|   |   |       no-sql.detector.ts
|   |   |       no-sql.patterns.ts
|   |   |
|   |   +---openredirect
|   |   |       openredirect.detector.ts
|   |   |       openredirect.patterns.ts
|   |   |
|   |   +---prototype-pollution
|   |   |       prototype-pollution.detectors.ts
|   |   |       prototype-pollution.patterns.ts
|   |   |
|   |   +---rate-limit
|   |   |       rate-limit.detector.ts
|   |   |       rate-limit.patterns.ts
|   |   |
|   |   +---rfi
|   |   |       rfi.detector.ts
|   |   |       rfi.patterns.ts
|   |   |
|   |   +---ssti
|   |   |       ssti.detector.ts
|   |   |       ssti.patterns.ts
|   |   |
|   |   +---ua
|   |   |       ua.detector.ts
|   |   |       ua.patterns.ts
|   |   |
|   |   +---upload
|   |   |       upload.detector.ts
|   |   |       upload.patterns.ts
|   |   |
|   |   \---xxe
|   |           xxe.detector.ts
|   |           xxe.patterns.ts
|   |
|   +---lfi
|   |       lfi.detector.ts
|   |       lfi.patterns.ts
|   |
|   +---network
|   |   \---portscan
|   |           portscan.detector.ts
|   |           portscan.patterns.ts
|   |
|   +---path
|   |       path.detector.ts
|   |       path.patterns.ts
|   |
|   +---sqli
|   |       sqli.detector.ts
|   |       sqli.patterns.ts
|   |
|   \---xss
|           xss.detector.ts
|           xss.patterns.ts
|
+---utils
|       extract.ts
|       logger.ts
|       match.ts
|       normalize.ts
|
\---__tests__
    +---core
    |       scan-error.test.ts
    |       scan-instance.test.ts
    |       scan.context.test.ts
    |       scan.error.static.test.ts
    |       scan.instance.name.test.ts
    |       scan.pipeline.extra.test.ts
    |       scan.pipeline.test.ts
    |       scan.registry.test.ts
    |       scan.result.severity.test.ts
    |       scan.result.test.ts
    |
    \---detector
        |   header.test.ts
        |   lfi.test.ts
        |   path.test.ts
        |   sqli.test.ts
        |   xss.test.ts
        |
        +---http
        |       anomaly.test.ts
        |       command.test.ts
        |       crlf.test.ts
        |       dns.test.ts
        |       ip.test.ts
        |       jwt.test.ts
        |       mime.test.ts
        |       no-sql.test.ts
        |       openredirect.test.ts
        |       prototype.pollution.test.ts
        |       rate-limit.test.ts
        |       rfi.test.ts
        |       ssti.test.ts
        |       ua.test.ts
        |       upload.test.ts
        |       xxe.test.ts
        |
        \---network
                portscan.test.ts

```

### 📁 Dossiers

#### `detectors/`

Contient tous les détecteurs classés par catégorie :

- `http/` → toutes les vulnérabilités HTTP
- `network/` → détection réseau (portscan)
- `dns/` → détection DNS
- `path/`, `sqli/`, `xss/`, `lfi/` → vulnérabilités spécifiques
- `headers/` → injections dans les en‑têtes

Chaque détecteur suit la même structure :

```bash
vuln/
├── vuln.detector.ts
└── vuln.patterns.ts
```

#### `core/`

Contient les types fondamentaux :

- `NormalizedEvent`
- `ScanFinding`
- `ScanContext`
- `ScanDetector`
- `ScanAdapter`
- `ScanResult`
- `CorrelationChain` (géré par le scoring externe)

---

## 🔧 Fonctionnement

### 1️⃣ L’orchestrateur envoie des `NormalizedEvent[]`

Chaque événement contient :

- `source` (http, dns, scan, waf, oast)
- `payload`
- `metadata`
- `timestamp`

### 2️⃣ lib-scan exécute tous les détecteurs

Chaque détecteur :

- vérifie si l’événement est pertinent (`applies()`)
- analyse payload + metadata
- applique ses patterns
- retourne des `ScanFinding[]`

### 3️⃣ L’orchestrateur transmet les findings au service de scoring

Le scoring :

- regroupe les findings
- calcule les scores
- génère les `CorrelationChain[]`
- renvoie un `ScanResult` final

👉 **lib-scan ne fait pas de scoring, ne corrèle rien.**  
👉 Elle est purement dédiée à la détection.

---

## 🧪 Tests

Chaque détecteur possède :

- tests unitaires Vitest
- couverture complète (branches, patterns, metadata, payload)
- tests de non‑détection
- tests de cas limites (metadata vide, payload absent, events vides)

---

## 🚀 Objectif

lib-scan est conçue pour être intégrée dans un pipeline de sécurité distribué :

- micro‑services spécialisés
- orchestrateur central
- scoring externe
- corrélation multi‑sources
- détection temps réel

Elle constitue la **couche de détection** du système.

---

## 📜 Licence

Projet interne — utilisation contrôlée.
