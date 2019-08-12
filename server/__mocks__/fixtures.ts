import { Socket as createSocket } from './socket';
import { Player } from '../Player';
import { IGameConfig } from '../../shared/types';

export const player1Data = {
  id: '1',
  name: 'bigjey',
};

export const player2Data = {
  id: '222',
  name: 'other_player',
};

export const socket1 = createSocket(player1Data.id) as any;
export const socket2 = createSocket(player2Data.id) as any;

export const player1 = new Player(socket1, player1Data) as any;
export const player2 = new Player(socket2, player2Data) as any;

export const normalGameConfig: IGameConfig = {
  name: 'new game',
  password: null,
  category: null,
  difficulty: null,
  numOfQuestions: 2,
  maxPlayers: 2,
};

export const MOCKED_TRIVIA_API_RESPONSE = {
  data: {
    response_code: 0,
    results: [
      {
        category: 'Entertainment: Video Games',
        type: 'multiple',
        difficulty: 'medium',
        question:
          'In Fallout 4, which type of power armor is first encountered in the early mission &quot;When Freedom Calls&quot; in a crashed Vertibird?',
        correct_answer: 'T-45',
        incorrect_answers: ['T-51', 'T-60', 'X-01'],
      },
      {
        category: 'Entertainment: Music',
        type: 'multiple',
        difficulty: 'medium',
        question:
          'Which song in Drake&#039;s &quot;Views&quot; features Future?',
        correct_answer: 'Grammys',
        incorrect_answers: ['Too Good', 'Faithful', 'Pop Style'],
      },
    ],
  },
};
