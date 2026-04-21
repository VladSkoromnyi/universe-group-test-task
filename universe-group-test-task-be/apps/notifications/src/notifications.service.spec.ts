import { Test } from '@nestjs/testing';
import { PRODUCT_EVENTS } from '@libs/rabbitmq';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();
    service = module.get(NotificationsService);
    // silence / observe logger
    logSpy = jest.spyOn((service as any).logger, 'log').mockImplementation();
  });

  afterEach(() => logSpy.mockRestore());

  it('logs created event with id and name', async () => {
    await service.handleProductEvent({
      event: PRODUCT_EVENTS.CREATED,
      payload: {
        id: 'abc',
        name: 'Widget',
        description: 'd',
        price: '1.00',
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toMatch(/CREATED.*abc.*Widget/);
  });

  it('logs deleted event', async () => {
    await service.handleProductEvent({
      event: PRODUCT_EVENTS.DELETED,
      payload: { id: 'abc', timestamp: '2026-01-01T00:00:00.000Z' },
    });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toMatch(/DELETED.*abc/);
  });
});
