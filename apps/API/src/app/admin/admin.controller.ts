import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BackendStore } from '../backend.store';
import { AdminGuard } from '../auth/admin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionGuard } from '../auth/session.guard';
import { PlanConfig } from '@streaming-platform/data-models';
import { PaginationQueryDto } from '../catalog/catalog.dto';

@Controller('admin')
@UseGuards(SessionGuard, AdminGuard)
export class AdminController {
  constructor(private readonly store: BackendStore) {}

  @Get('analytics')
  analytics() {
    return this.store.analytics();
  }

  @Get('users')
  users(@Query() query: PaginationQueryDto) {
    return this.store.listUsers(query.page, query.pageSize);
  }

  @Post('users/:id/revoke-session')
  @UseGuards(CsrfGuard, SessionGuard, AdminGuard)
  revokeSession(@Param('id') id: string) {
    this.store.revokeSession(id);
    return { ok: true };
  }

  @Post('users/:id/toggle-status')
  @UseGuards(CsrfGuard, SessionGuard, AdminGuard)
  toggleStatus(@Param('id') id: string) {
    this.store.toggleUserStatus(id);
    return { ok: true };
  }

  @Get('plans')
  plans() {
    return this.store.getPlanConfig();
  }

  @Put('plans')
  @UseGuards(CsrfGuard, SessionGuard, AdminGuard)
  updatePlans(@Body() config: PlanConfig) {
    return this.store.updatePlanConfig(config);
  }
}
