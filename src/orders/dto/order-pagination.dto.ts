import { PaginationDto } from "src/common";
import { OrderStatusList } from "../enum/order.enum";
import { IsEnum, IsOptional } from "class-validator";
import { OrderStatus } from "@prisma/client";


export class OrderPaginationDto extends PaginationDto {

   @IsOptional()
   @IsEnum(OrderStatusList, {
      message: `status must be one of the following values: ${OrderStatusList.join(', ')}`
   })
   status: OrderStatus;

}