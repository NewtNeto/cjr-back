import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProdutoModule } from './produto/produto.module';

@Module({
  imports: [UserModule, ProdutoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
