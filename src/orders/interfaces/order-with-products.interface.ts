import { OrderStatus } from "@prisma/client";

export interface orderWithProducts {
   OrderItem: {
      name: any;
      price: number;
      productId: number;
      quantity: number;
   }[];
   id: string;
   totalAmount: number;
   totalItems: number;
   status: OrderStatus;
   paid: boolean;
   paiddAt: Date | null;
   createdAt: Date;
   updatedAt: Date;
}