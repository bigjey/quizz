import { Player, NewPlayer } from './Player';

import { Socket as createSocket } from './__mocks__/socket';

const playerData = {
  id: '1',
  name: 'bigjey',
};
const socket = createSocket(playerData.id) as any;

describe('Player', () => {
  describe('#constructor', () => {
    it('should create new player', () => {
      const player = new Player(socket, playerData);

      expect(player['id']).toBe(player.id);
      expect(player['name']).toBe(player.name);
      expect(player['socketId']).toBe(socket.id);
    });
  });
});
