import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { envs } from 'src/config/envs';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    ClientsModule.register([
      {
        name: envs.productServiceName,
        transport: Transport.TCP,
        options: {
          host: envs.productServiceHost,
          port: envs.productServicePort
        }
      }
    ])
  ],
})
export class OrdersModule {}
