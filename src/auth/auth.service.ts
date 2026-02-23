import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  //en el register resivimos el registerDto que se comporta como RegisterDto
  async register(registerDto: RegisterDto) {
    const { name, email, password, code, phone, firstName, middleName } =
      registerDto;

    // Verificar si el usuario ya existe
    const userExists = await this.usersService.findOneByEmail(email);
    if (userExists) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Crear el usuario sin empresa (por ahora)
    const userData = {
      name,
      email,
      password: hashedPassword,
      code,
      phone,
      firstName,
      middleName,
      empresa: null, // La empresa se asignará después de crear el pago
    };

    const newUser = await this.usersService.create(userData);

    return {
      message: 'Registro exitoso',
      user: newUser,
    };
  }
  async login({ email, password }: LoginDto) {
    const user = await this.usersService.finByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException(
        'El correo no existe en la base de datos',
      );
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña no es correcta');
    }

    const payload = {
      email: user.email,
      role: user.role,
      name: user.name,
      id_empresa: user.empresa ? user.empresa.id_empresa : null, // Asegúrate de que aquí no sea undefined
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      email,
      id_empresa: user.empresa ? user.empresa.id_empresa : null,
      role: user.role,
      id: user.id,
      name: user.name,
    };
  }

  async usuarios(user: UserActiveInterface) {
    const users = await this.usersService.findAll();
    return users;
  }

  async profile({ email }: { email: string }) {
    return await this.usersService.findOneByEmail(email);
  }

  // Método para actualizar el perfil del usuario autenticado
  async updateProfile(user: UserActiveInterface, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.updateProfile(
        user,
        updateUserDto,
      );

      return {
        message: 'Perfil actualizado exitosamente',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          empresa: updatedUser.empresa,
          code: updatedUser.code,
          phone: updatedUser.phone,
          firstName: updatedUser.firstName,
          middleName: updatedUser.middleName,
          personEmail: updatedUser.personEmail,
          direction: updatedUser.direction,
        },
      };
    } catch (error) {
      console.error('Error en updateProfile:', error); // Debug log
      if (
        error instanceof BadRequestException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        'Error al actualizar el perfil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para que un admin pueda actualizar cualquier usuario
  async updateUser(
    adminUser: UserActiveInterface,
    userId: number,
    updateUserDto: UpdateUserDto,
  ) {
    console.log(
      'AuthService - updateUser llamado por admin:',
      adminUser.email,
      'para usuario:',
      userId,
    ); // Debug log

    // Verificar que el usuario que hace la petición sea admin
    if (adminUser.role !== 'admin') {
      throw new UnauthorizedException(
        'No tienes permisos para realizar esta acción',
      );
    }

    try {
      const updatedUser = await this.usersService.update(userId, updateUserDto);

      console.log(
        'Usuario actualizado exitosamente por admin:',
        updatedUser.email,
      ); // Debug log

      return {
        message: 'Usuario actualizado exitosamente',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          empresa: updatedUser.empresa,
          code: updatedUser.code,
          phone: updatedUser.phone,
          firstName: updatedUser.firstName,
          middleName: updatedUser.middleName,
          personEmail: updatedUser.personEmail,
          direction: updatedUser.direction,
        },
      };
    } catch (error) {
      console.error('Error en updateUser:', error); // Debug log
      if (
        error instanceof BadRequestException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        'Error al actualizar el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkRegister(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: { email: string; password: string }[] =
      XLSX.utils.sheet_to_json(sheet);

    const results = {
      success: [] as string[],
      errors: [] as { email: string; error: string }[],
    };

    // Buscar la empresa con id 1
    const empresa = await this.usersService.findEmpresaById(1);
    if (!empresa) {
      throw new BadRequestException('La empresa con id 1 no existe');
    }

    for (const row of rows) {
      const { email, password } = row;

      if (!email || !password) {
        results.errors.push({
          email: email ?? 'desconocido',
          error: 'Faltan campos requeridos',
        });
        continue;
      }

      try {
        const userExists = await this.usersService.findOneByEmail(email.trim());
        if (userExists) {
          results.errors.push({ email, error: 'El email ya está registrado' });
          continue;
        }

        const hashedPassword = await bcryptjs.hash(password.toString(), 10);

        await this.usersService.create({
          email: email.trim(),
          password: hashedPassword,
          empresa, // objeto Empresa
          name: null, // nombre por defecto, ajusta si tienes columna name
          code: null,
          phone: null,
          firstName: null,
          middleName: null,
        } as any);

        results.success.push(email);
      } catch (error) {
        results.errors.push({ email, error: error.message });
      }
    }

    return {
      message: `Carga masiva completada: ${results.success.length} registrados, ${results.errors.length} errores`,
      ...results,
    };
  }
}
