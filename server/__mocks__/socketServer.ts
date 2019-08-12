export let io = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnThis(),
  sockets: {
    sockets: {},
  },
};
