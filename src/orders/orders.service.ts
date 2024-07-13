import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private logger: Logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  create(createOrderDto: CreateOrderDto) {
    return {
      service: 'Orders MS',
      createOrderDto
    }
    // return this.order.create({
    //   data: createOrderDto
    // });
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
      where: { id }
    });
    if (!order) {
      throw new RpcException({
        message: `Order with id ${id} not found`,
        statusCode: HttpStatus.NOT_FOUND
      })
    }
    return order;
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
