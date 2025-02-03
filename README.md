# club_ia_imsp_backend

## Description

Le Projet est une application web conçue pour relayer les informations sur le club d'IA de l'IMSP.

## Installation

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/sogancarmen1/club_ia_imsp_backend.git

   ```

2. Accédez au dossier du projet :
   cd club_ia_imsp_backend

3. Installez les dépendances
   pnpm install

4. Lancez le projet
   pnpm dev

#### **5. Configuration**

Si le projet nécessite une configuration (comme des variables d'environnement), expliquez comment le faire.

````markdown
## Configuration

Créez un fichier `.env` semblable au `.env.example` à la racine du projet et ajoutez les variables suivantes :

```plaintext
PORT=yourPort
DB_USER=database_user
DB_PASSWORD=database_password
DB_DATABASE=database_name
DB_HOST=database_host
DB_PORT=database_port
```

Après la création de la base de donnée, vous pouvez exécuter les commandes suivantes :

1. Pour initialiser la base de donnée : pnpm init-db

2. Pour insérer l'administrateur : pnpm seed
````

## Build

1. pnpm build
