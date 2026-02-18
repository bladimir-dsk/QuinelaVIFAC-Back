import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@ApiBasicAuth('jwt')
@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createGroupDto: CreateGroupDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.groupsService.create(createGroupDto, user);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.groupsService.findOne(+id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id') id: number,
    @Body() updateGroupDto: UpdateGroupDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.groupsService.update(+id, updateGroupDto, user);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.groupsService.remove(+id, user);
  }
}
