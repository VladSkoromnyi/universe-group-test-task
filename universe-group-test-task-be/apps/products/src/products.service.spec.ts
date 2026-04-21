import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { DRIZZLE } from '@libs/database';
import { RABBITMQ_CLIENT, PRODUCT_EVENTS } from '@libs/rabbitmq';
import { ProductsService } from './products.service';

type InsertChain = { values: jest.Mock; returning: jest.Mock };
type DeleteChain = { where: jest.Mock; returning: jest.Mock };
type SelectChain = {
  from: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  offset: jest.Mock;
};

describe('ProductsService', () => {
  let service: ProductsService;
  let rmqClient: { emit: jest.Mock };
  let insertChain: InsertChain;
  let deleteChain: DeleteChain;
  let selectChain: SelectChain;

  beforeEach(async () => {
    insertChain = { values: jest.fn(), returning: jest.fn() };
    insertChain.values.mockReturnValue(insertChain);

    deleteChain = { where: jest.fn(), returning: jest.fn() };
    deleteChain.where.mockReturnValue(deleteChain);

    selectChain = {
      from: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      offset: jest.fn(),
    };
    selectChain.from.mockReturnValue(selectChain);
    selectChain.orderBy.mockReturnValue(selectChain);
    selectChain.limit.mockReturnValue(selectChain);

    const db = {
      insert: jest.fn(() => insertChain),
      delete: jest.fn(() => deleteChain),
      select: jest.fn(() => selectChain),
    };

    rmqClient = { emit: jest.fn(() => of(undefined)) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: DRIZZLE, useValue: db },
        { provide: RABBITMQ_CLIENT, useValue: rmqClient as unknown as ClientProxy },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('create → inserts row and emits product.created event', async () => {
    const row = {
      id: 'uuid-1',
      name: 'A',
      description: 'd',
      price: '10.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    insertChain.returning.mockResolvedValue([row]);

    const result = await service.create({ name: 'A', description: 'd', price: 10 });

    expect(result).toEqual(row);
    expect(insertChain.values).toHaveBeenCalledWith({
      name: 'A',
      description: 'd',
      price: '10.00',
    });
    expect(rmqClient.emit).toHaveBeenCalledWith(
      PRODUCT_EVENTS.CREATED,
      expect.objectContaining({
        event: PRODUCT_EVENTS.CREATED,
        payload: expect.objectContaining({ id: 'uuid-1', name: 'A' }),
      }),
    );
  });

  it('remove → emits product.deleted when row existed', async () => {
    const row = { id: 'uuid-1', name: 'A', description: 'd', price: '10.00' };
    deleteChain.returning.mockResolvedValue([row]);

    await service.remove('uuid-1');

    expect(rmqClient.emit).toHaveBeenCalledWith(
      PRODUCT_EVENTS.DELETED,
      expect.objectContaining({ event: PRODUCT_EVENTS.DELETED }),
    );
  });

  it('remove → throws NotFoundException when no row deleted', async () => {
    deleteChain.returning.mockResolvedValue([]);
    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    expect(rmqClient.emit).not.toHaveBeenCalled();
  });
});
