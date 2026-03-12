import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BackendStore } from '../backend.store';
import { AdminGuard } from '../auth/admin.guard';
import { SessionGuard } from '../auth/session.guard';
import { PlanConfig } from '@streaming-platform/data-models';

@Controller('admin')
@UseGuards(SessionGuard, AdminGuard)
export class AdminController {
  constructor(private readonly store: BackendStore) {}

  @Get('analytics')
  analytics() {
    return this.store.analytics();
  }

  @Get('users')
  users() {
    return this.store.listUsers();
  }

  @Post('users/:id/revoke-session')
  revokeSession(@Param('id') id: string) {
    this.store.revokeSession(id);
    return { ok: true };
  }

  @Post('users/:id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    this.store.toggleUserStatus(id);
    return { ok: true };
  }

  @Get('plans')
  plans() {
    return this.store.getPlanConfig();
  }

  @Put('plans')
  updatePlans(@Body() config: PlanConfig) {
    return this.store.updatePlanConfig(config);
  }
}
