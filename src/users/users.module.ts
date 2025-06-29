import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UtilisateurFluxasync } from './entities/utilisateur-fluxasync.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UtilisateurFluxasync])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}