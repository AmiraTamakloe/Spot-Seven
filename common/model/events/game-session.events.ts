export enum GameSessionEvent {
    GameStart = 'gameStart',
    GuessDifference = 'guessDifference',
    RemainingDifferences = 'remainingDifferences',
    EndGame = 'endGame',
    DifferenceFound = 'differenceFound',
    GiveUp = 'giveUp',
    Message = 'message',
    PlayerLeftWaitingRoom = 'playerLeftWaitingRoom',
    CancelGameSession = 'cancelGameSession',
    FetchWaitingRooms = 'fetchWaitingRooms',
    TimeLimitWaitingRoomsUpdate = 'timeLimitWaitingRoomsUpdate',
    ClassicWaitingRoomsUpdate = 'classicWaitingRoomsUpdate',
    GameStateChanged = 'gameStateChanged',
    WaitingRoomEmpty = 'waitingRoomEmpty',
    WaitingRoomStateUpdate = 'waitingRoomStateUpdate',
    StartFriendsWaitingRoom = 'startFriendsWaitingRoom',
    VerifyFriendships = "verifyFriendships",

    // New event
    StartGameSession = 'startGameSession',
    LaunchGame = 'launchGameSession',
    StartWaitingRoom = 'startWaitingRoom',
    NewOpponent = 'newOpponent',
    RejectOpponent = 'rejectOpponent',
    GameSessionCanceled = 'gameSessionCanceled',
    UseHint = 'hintUsed',
    WaitingRoomReady = 'waitingRoomReady',
    CancelWaitingRoom = 'cancelWaitingRoom',
    GetFriendGameUsers = 'getFriendGameUsers',
    GetFriendsOfFriendGameUsers = 'getFriendsOfFriendGameUsers',
    TimeLimitWaitingRoomsUpdateFriends = 'timeLimitWaitingRoomsUpdateFriends',
    ClassicWaitingRoomsUpdateFriends = 'classicWaitingRoomsUpdateFriends',
    JoinWaitingRoom = 'joinWaitingRoom',
    LeaveWaitingRoomPage = "leaveWaitingRoomPage"
}
