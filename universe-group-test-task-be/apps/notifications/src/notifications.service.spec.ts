import { Test } from '@nestjs/testing';
import { DRIZZLE } from '@libs/database';
import { PRODUCT_EVENTS } from '@libs/rabbitmq';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let logSpy: jest.SpyInstance;
  let insertValuesSpy: jest.Mock;

  beforeEach(async () => {
    insertValuesSpy = jest.fn().mockResolvedValue(undefined);
    const db = {
      insert: jest.fn().mockReturnValue({ values: insertValuesSpy }),
    };

    const module = await Test.createTestingModule({
      providers: [NotificationsService, { provide: DRIZZLE, useValue: db }],
    }).compile();
    service = module.get(NotificationsService);
    // silence / observe logger
    logSpy = jest.spyOn((service as any).logger, 'log').mockImplementation();
  });

  afterEach(() => logSpy.mockRestore());

  it('persists and logs a created event', async () => {
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

    expect(insertValuesSpy).toHaveBeenCalledTimes(1);
    expect(insertValuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: PRODUCT_EVENTS.CREATED,
        productId: 'abc',
      }),
    );
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toMatch(/CREATED.*abc.*Widget/);
  });

  it('persists and logs a deleted event', async () => {
    await service.handleProductEvent({
      event: PRODUCT_EVENTS.DELETED,
      payload: { id: 'abc', timestamp: '2026-01-01T00:00:00.000Z' },
    });

    expect(insertValuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: PRODUCT_EVENTS.DELETED,
        productId: 'abc',
      }),
    );
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toMatch(/DELETED.*abc/);
  });
});
