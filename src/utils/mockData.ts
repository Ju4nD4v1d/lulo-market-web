import createMockOrders from './createMockOrders';

export const initializeMockData = async () => {
  await createMockOrders();
};