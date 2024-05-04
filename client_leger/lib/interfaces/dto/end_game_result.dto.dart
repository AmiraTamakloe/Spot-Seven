class EndGameResultDto {
  final bool isWinner;
  final bool isForfeit;
  // TODO: Factor in record Beaten
//   final bool recordBeaten;

  EndGameResultDto(this.isWinner, this.isForfeit);

  factory EndGameResultDto.fromJson(Map<String, dynamic> json) {
    // TODO: Factor in record Beaten
    // recordBeaten = json['recordBeaten'] != null
    return EndGameResultDto(json['isWinner'], json['isForfeit']);
  }
}
