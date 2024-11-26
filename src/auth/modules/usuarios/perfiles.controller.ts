import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
// import {} from '@nestjs/'
import {  FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, ParseIntPipe} from "@nestjs/common/pipes";

import { PerfilesService } from './perfiles.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ItemMenuProtected, MenusProtected, RoleProtected } from 'src/auth/decorators/valid-protected.decorator';
import {Authentication,Authorization,AuthorizationResource} from '../../decorators'

import {  ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';

import { CreateAfiliadoDto, CreatePerfilDto, CreateUsuarioDto, UpdateAfiliadoDto, UpdatePerfilDto, UpdateUsuarioDto } from './dto';
import { SearchPerfil } from './querys/search-perfil';
import { FileInterceptor } from '@nestjs/platform-express';

import { fileFilter } from 'src/common/utilities/FileFilters';
import { UploadProfileImage } from './dto/uploadPerfilImage.dto';
import { QueryExportPerfil } from './querys/query-export-perfil';
import { RegistrarPagoAfiliacionDepositoDto, RegistrarPagoAfiliacionPresencialDto } from './dto/registrar-pago-afiliacion.dto';
import { UpdatePagoAfiliacionDto } from './dto/update-pago-afiliacion.dto';


@Controller('perfiles')
// @Authorization()
// @AuthorizationResource()
@Authentication()
export class PerfilController {
  constructor(private readonly perfilService: PerfilesService) {}

  @Post()
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  create(@Body() createPerfilDto: CreatePerfilDto) {
    return this.perfilService.create(createPerfilDto);
  }
  @Post('upload-image-user')
  @UseInterceptors(FileInterceptor('file',{
  }),)
  
  uploadImageProfile(@UploadedFile(
    new ParseFilePipe({
      validators:[
        new FileTypeValidator({
          fileType:/image\/(jpeg|jpg|png)/,
        }),
        new MaxFileSizeValidator({
          maxSize:1000*1000*10,
          message:'Max size: 10MB',
        }),
      ],
      fileIsRequired:true,
    })
  ) file: Express.Multer.File, @Body() body:UploadProfileImage){
    
    return this.perfilService.uploadUserImage(file,parseInt(body.id));
  }
  @Post('afiliado/:id')
  createAfiliado(@Param('id',ParseIntPipe) id: number, @Body() createAfiliadoDto: CreateAfiliadoDto){
    return this.perfilService.createAfiliado(id,createAfiliadoDto);
  }

  @Post('usuario/:id')
  createUsuario(@Param('id',ParseIntPipe) id: number, @Body() createUsuarioDto: CreateUsuarioDto){
    return this.perfilService.createUsuario(id,createUsuarioDto);
  }

  @Post('afiliado/pagar/presencial')
  registrarPagoAfiliacionPresencial(@Body() registrarPago:RegistrarPagoAfiliacionPresencialDto){
    return this.perfilService.registrarPagoAfiliacionPresencial(registrarPago);
  }
  @Post('afiliado/pagar/deposito')
  registrarPagoAfiliacionDeposito(@Body() registrarPago:RegistrarPagoAfiliacionDepositoDto){
    return this.perfilService.registrarPagoAfiliacionDeposito(registrarPago);
  }
  @Get()
  @RoleProtected(ValidRole.admin,ValidRole.administrativo)
  @MenusProtected(ValidMenu.perfiles)
  // @ItemMenuProtected(ValidItemMenu.usuarioList)
  findAll(@Query() paginationDto:SearchPerfil) {
    return this.perfilService.findAll(paginationDto);
  }
  @Get('usuario/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOnePerfilUser(@Param('id',ParseIntPipe) id: number) {
    return this.perfilService.findOnePerfilUsuario(id);
  }
  @Get('afiliado/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOnePerfilAfiliado(@Param('id',ParseIntPipe) id: number) {
    return this.perfilService.findOnePerfilAfiliado(id);
  }

  @Get('afiliado/pago/:id')
  findPagoAfiliacionPerfil(@Param('id',ParseIntPipe) id: number){
    return this.perfilService.findPagoAfiliacion(id);
  }


  @Get('usuario/email/:term')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  findOneUserByEmail(@Param('term') term: string) {
    return this.perfilService.findUserByEmail(term);
  }
  
  @Get('export')
  // @MenusProtected(ValidMenu.perfilservice)
  findPerfilesFiltersExport(@Query() query:QueryExportPerfil) {
    console.log('query controller',query);
    return this.perfilService.exportPerfiles(query);
  }
  @Get(':id')
  // @MenusProtected(ValidMenu.perfilservice)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.perfilService.findOne(id);
  }
  
  
  @Patch('usuario/roles/:id') 
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdate)
  asignarRoles(@Param('id',ParseIntPipe) id: number, @Body() updateUsuario: UpdateUsuarioDto) {
    return this.perfilService.updateRolesUser(id, updateUsuario);
  }

  @Patch('afiliado/:id')
  updateAfiliado(@Param('id',ParseIntPipe) id: number, @Body() updateAfiliadoDto: UpdateAfiliadoDto){
    return this.perfilService.updateAfiliado(id,updateAfiliadoDto);
  }
  @Patch('afiliado/pago/:id')
  updatePagarAfiliado(@Param('id',ParseIntPipe) id: number, @Body() updateAfiliadoPagarDto: UpdatePagoAfiliacionDto){
    return this.perfilService.updatePagarAfiliado(id,updateAfiliadoPagarDto);
  }

  @Patch('usuario/:id')
  updateUsuario(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto){
    return this.perfilService.updateUsuario(id,updateUsuarioDto);
  }
  @Patch('status/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.perfilServicetatus)
  updatePerfilStatus(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.perfilService.updateStatus(id, updatePerfilDto);
  }
  @Patch('usuario/status/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.perfilServicetatus)
  updatePerfilServicetatus(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.perfilService.updateUsuarioStatus(id, updateUsuarioDto);
  }
  @Patch('afiliado/status/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.perfilServicetatus)
  updateAfiliadoStatus(@Param('id',ParseIntPipe) id: number, @Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.perfilService.updateAfiliadoStatus(id, updateAfiliadoDto);
  }
  @Patch(':id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdateProfile)
  updateProfile(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.perfilService.updateProfile(id, updatePerfilDto);
  }
  // @Get('menus/:id')
  // findMenusWidthUsuarioByRoles(@Param('id',ParseIntPipe) id:number){
  //   return this.perfilService.findMenusWidthUsuarioByRoles(id);
  // }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.perfilService.remove(+id);
  // }
}
