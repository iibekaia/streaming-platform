import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { BackendStore } from '../backend.store';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionGuard } from '../auth/session.guard';
import { User } from '@streaming-platform/data-models';

@Controller('purchases')
@UseGuards(SessionGuard)
export class PurchasesController {
  constructor(private readonly store: BackendStore) {}

  @Post('tickets/:movieId')
  buyTicket(@CurrentUser() user: Omit<User, 'password'>, @Param('movieId') movieId: string) {
    return this.store.buyTicket(user.id, movieId);
  }

  @Post('unlimited')
  buyUnlimited(@CurrentUser() user: Omit<User, 'password'>) {
    return this.store.buyUnlimited(user.id);
  }
}
