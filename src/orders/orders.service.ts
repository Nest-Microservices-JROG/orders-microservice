import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto';
import { envs } from 'src/config/envs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private logger: Logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  constructor(
    @Inject(envs.natsServiceName) private readonly client: ClientProxy
  ) { super(); }


  async create(createOrderDto: CreateOrderDto) {
    try {
      const productIds = createOrderDto.items.map(item => item.productId);
      const products: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productIds)
      )
      const totalAmount = createOrderDto.items.reduce((acc, item) => {
        const { price } = products.find(product => product.id === item.productId);
        return acc + (price * item.quantity);
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, item) => acc + item.quantity, 0);

      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map(item => ({
                price: products.find(product => product.id === item.productId).price,
                quantity: item.quantity,
                productId: item.productId
              }))
            }
          }
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map(item => ({
          ...item,
          name: products.find(product => product.id === item.productId).name
        }))
      };

    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.BAD_REQUEST
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalOrders = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    });
    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        where: {
          status: orderPaginationDto.status
        },
        skip: (currentPage - 1) * perPage,
        take: perPage,
      }),
      meta: {
        total: totalOrders,
        page: currentPage,
        lastPage: Math.ceil(totalOrders / perPage)
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    });
    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        statusCode: HttpStatus.NOT_FOUND
      })
    }

    const productIds = order.OrderItem.map(item => item.productId);
    const products: any[] = await firstValueFrom(
      this.client.send({ cmd: 'validate_products' }, productIds)
    );

    return {
      ...order,
      OrderItem: order.OrderItem.map(item => ({
        ...item,
        name: products.find(product => product.id === item.productId).name
      }))
    };
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.order.findUnique({
      where: { id }
    });
    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        statusCode: HttpStatus.NOT_FOUND
      })
    }
    if (order.status === status) {
      return order;
    }
    return this.order.update({
      where: { id },
      data: { status }
    });
  }

}
