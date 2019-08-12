import { Player } from '../Player';

export const Socket = (pId: string) => ({
  id: `socket-id-${pId}`,
  join: jest.fn().mockReturnThis(),
  leave: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnThis(),
});
