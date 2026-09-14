Refonte de l'utilisation des clés d'API:
Désormais, les clés d'API sont globales.
Il faut modifier les points suivants:
- Un champ regex permettant de délimiter les endpoints accessibles
par la clé d'api. Si non-défini, tous les endpoints sont accessibles. 
Le champ regex est déjà mis mais il faut propager la feature.
- De façon optionnelle, une clé d'API peut être liée à une application
contrairement à l'ancienne version où c'est obligatoire.
- Je veux ajouter un gas price min et max in atomics dans la clé d'API pour ajouter une couche de sécurité. 
Par défaut le min vaut 0 et le max vaut 1000000.
