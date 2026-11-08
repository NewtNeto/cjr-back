import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, type RequisicaoAutenticada } from '../auth/auth.guard';
import { opcoesUploadFoto } from './foto-upload';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // troca a foto de quem está logado. O front envia um FormData com o arquivo no campo "foto".
  @Patch('me/foto')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('foto', opcoesUploadFoto))
  atualizarFoto(@Req() requisicao: RequisicaoAutenticada, @UploadedFile() foto: Express.Multer.File | undefined) {
    return this.userService.atualizarFoto(requisicao.usuario.sub, foto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
