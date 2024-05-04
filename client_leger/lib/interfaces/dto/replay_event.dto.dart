// The fields are overridden to ensure the right event is set
// ignore_for_file: overridden_fields

import 'package:client_leger/interfaces/base_game_info.dart';
import 'package:client_leger/interfaces/chat/chat_message.dart';
import 'package:client_leger/interfaces/dto/end_game_result.dto.dart';
import 'package:client_leger/interfaces/dto/guess.dart';
import 'package:client_leger/interfaces/guess_result.dart';

abstract class BaseReplayEventDto {
  final String userId;
  final int time;
  final ReplayEvent event;

  BaseReplayEventDto(
      {required this.userId, required this.time, required this.event});
}

class GameStartReplayDto extends BaseReplayEventDto {
  final BaseGameInfo response;

  GameStartReplayDto(
      {required super.userId,
      required super.time,
      required this.response,
      super.event = ReplayEvent.gameStart});

  factory GameStartReplayDto.fromJson(Map<String, dynamic> json) {
    return GameStartReplayDto(
      userId: json['userId'],
      time: json['time'],
      response: BaseGameInfo.fromJson(json['response']),
    );
  }
}

class GuessDifferenceReplayDto extends BaseReplayEventDto {
  final Guess body;
  final GuessResult response;

  GuessDifferenceReplayDto(
      {required super.userId,
      required super.time,
      required this.body,
      required this.response,
      super.event = ReplayEvent.guessDifference});

  factory GuessDifferenceReplayDto.fromJson(Map<String, dynamic> json) {
    GuessResult response = GuessResult.fromJson(json['response']);

    if (response.type == ResultType.success) {
      response = ClassicSuccessGuessResult.fromJson(json['response']);
    }

    return GuessDifferenceReplayDto(
      userId: json['userId'],
      time: json['time'],
      body: Guess.fromJson(json['body']),
      response: response,
    );
  }
}

// FIXME: Implement hint
class UseHintReplayDto extends BaseReplayEventDto {
  // final Hint response;

  UseHintReplayDto({
    required super.userId,
    required super.time,
    super.event = ReplayEvent.useHint,
  });
  // required this.response});

  factory UseHintReplayDto.fromJson(Map<String, dynamic> json) {
    return UseHintReplayDto(
      userId: json['userId'],
      time: json['time'],
      // response: Hint.fromJson(json['response']),
    );
  }
}

class MessageReplayDto extends BaseReplayEventDto {
  final ChatMessage body;

  MessageReplayDto(
      {required super.userId,
      required super.time,
      required this.body,
      super.event = ReplayEvent.message});

  factory MessageReplayDto.fromJson(Map<String, dynamic> json) {
    return MessageReplayDto(
      userId: json['userId'],
      time: json['time'],
      body: ChatMessage.fromJson(json['body']),
    );
  }
}

class EndGameReplayDto extends BaseReplayEventDto {
  @override
  final ReplayEvent event = ReplayEvent.endGame;
  final EndGameResultDto response;

  EndGameReplayDto(
      {required super.userId,
      required super.time,
      required this.response,
      super.event = ReplayEvent.endGame});

  factory EndGameReplayDto.fromJson(Map<String, dynamic> json) {
    return EndGameReplayDto(
      userId: json['userId'],
      time: json['time'],
      response: EndGameResultDto.fromJson(json['response']),
    );
  }
}

enum ReplayEvent {
  gameStart,
  guessDifference,
  useHint,
  message,
  endGame,
}
