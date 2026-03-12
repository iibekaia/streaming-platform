import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BackendStore } from './backend.store';
import { AdminController } from './admin/admin.controller';
import { AuthController } from './auth/auth.controller';
import { AdminGuard } from './auth/admin.guard';
import { RefreshGuard } from './auth/refresh.guard';
import { SessionGuard } from './auth/session.guard';
import { TokenService } from './auth/token.service';
import { CatalogController } from './catalog/catalog.controller';
import { OmdbService } from './catalog/omdb.service';
import { PurchasesController } from './purchases/purchases.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JwtModule.register({})],
  controllers: [AuthController, CatalogController, PurchasesController, AdminController],
  providers: [BackendStore, TokenService, SessionGuard, RefreshGuard, AdminGuard, OmdbService],
})
export class AppModule {}
