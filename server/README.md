# Serveur NestJS
Projet de serveur pour le projet du cours LOG3900 de l'équipe 103.

Ce serveur nécessite Node.js et npm pour fonctionner.
## Requirements
- Node.js
- npm
- Docker (recommandé)


## Développement
Pour développer, il est utile d'avoir un environnement de développement. Pour ce faire, il est possible d'utiliser Docker pour avoir un environnement de développement similaire à celui de production.


Dans l'environnement de développement, votre dossier serveur est monté dans le conteneur Docker. Dans la plupart des cas cela fonctionne, mais dû à la librairie bcrypt qui nécessite des exécutables différents selon le type d'OS, il est plus optimisé d'installer les librairies node_modules dans le conteneur Docker. C'est long, mais cela permet de ne pas avoir de problèmes de compatibilité.

Pour démarrer le serveur en mode développement, utilisez la commande suivante:
```bash
docker compose -f docker-compose.dev.yml up
```

Le serveur est maintenant accessible à l'adresse suivante: http://localhost:3000 et vous avez accès à la documentation swagger associé à l'API.

Si vous avez besoin de ne pas prendre le terminal en otage, vous pouvez utiliser la commande suivante:
```bash
docker compose -f docker-compose.dev.yml up -d
```

Pour arrêter le serveur, utilisez la commande suivante:
```bash
docker compose -f docker-compose.dev.yml down
```
Pour inspecter les logs du serveur, utilisez la commande suivante:
```bash
docker compose -f docker-compose.dev.yml logs -f
```
Pour lancer les tests ou le lint, si vous n'êtes pas sur Linux, vous devrez le faire dans le bon conteneur.

```bash
docker compose -f docker-compose.yml run -it --entrypoint bash spot-seven
```

Ceci va vous ramener à un shell bash où vous pouvez exécuter les commandes normales : `npm run lint` ou `npm run test`


Afin de vous faciliter la tâche, vous pouvez définir un alias pour `docker compose -f docker-compose.dev.yml` dans votre terminal.
Selon votre terminal, voici une documentation :
- [Bash](https://linuxize.com/post/how-to-create-bash-aliases/)
- [Zsh](https://osxdaily.com/2023/05/13/how-to-configure-use-aliases-in-zsh/)



## Production
Pour démarrer le serveur en mode production, utilisez la commande suivante:
```bash
docker compose -f docker-compose.prod.yml up
```
