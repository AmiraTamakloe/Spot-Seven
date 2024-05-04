enum WaitingRoomStatus { created, joined, full, waiting }

WaitingRoomStatus stringToWaitingStatus(String status) {
  switch (status) {
    case 'created':
      return WaitingRoomStatus.created;
    case 'joined':
      return WaitingRoomStatus.joined;
    case 'waiting':
      return WaitingRoomStatus.waiting;
    default:
      return WaitingRoomStatus.full;
  }
}
