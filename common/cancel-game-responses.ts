export enum CancelGameResponse {
    CreatorCanceled = 'La partie a été annulée par le créateur.',
    CreatorRejected = 'Le créateur de la partie ne veut pas jouer contre vous :(',
    OpponentLeft = 'Votre adversaire ne veut plus jouer.',
    GameStarted = 'La partie a commencée sans vous.',
    GameDeleted = 'La partie a été annulée, car le jeu a été supprimé.'
}
