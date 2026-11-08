import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProdutoModule } from './produto/produto.module';
import { AuthModule } from './auth/auth.module';
import { CategoriaModule } from './categoria/categoria.module';

@Module({
  imports: [UserModule, ProdutoModule, AuthModule, CategoriaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
