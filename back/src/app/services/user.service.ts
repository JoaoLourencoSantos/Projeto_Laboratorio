import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import User from '../models/user';
import { ResponseDTO } from './../dto/response.dto';
import { UserDTO } from './../dto/user.dto';
import { UserPutDTO } from './../dto/user.put.dto';
import { UserRepository } from './../repositories/user.repository';

@Injectable()
class UserService {
  public constructor(
    @InjectRepository(User) public readonly userReporitory: UserRepository
  ) {}

  async findAll(): Promise<ResponseDTO> {
    try {
      return new ResponseDTO(
        "Found users",
        await this.userReporitory.find(),
        200,
        true
      );
    } catch (exception) {
      throw new InternalServerErrorException(
        "Erro in find users: " + exception.message
      );
    }
  }

  async find({ id }): Promise<ResponseDTO> {
    if (!id) {
      throw new BadRequestException("Parameter 'id' is necessary!");
    }
    let result: User = null;

    try {
      result = await this.userReporitory.findOne(id);
    } catch (exception) {
      throw new InternalServerErrorException(
        "Erro in find users: " + exception.message
      );
    }

    if (!result) {
      throw new NotFoundException("user not found");
    }

    return new ResponseDTO("Found users", result, 200, true);
  }

  async create(userDTO: UserDTO): Promise<ResponseDTO> {
    const validEmail: User = await this.userReporitory.findOne({
      email: userDTO.email,
    });

    if (validEmail) {
      throw new ConflictException(
        "Erro in create user: this user already exists"
      );
    }

    try {
      const user: User = await this.userReporitory.createUser(userDTO);

      return new ResponseDTO("Created", user, 201, true);
    } catch (exception) {
      throw new InternalServerErrorException(
        "Erro in create user: " + exception.message
      );
    }
  }

  async update(userPutDTO: UserPutDTO): Promise<ResponseDTO> {
    const validEmail: User = await this.userReporitory.findOne({
      email: userPutDTO.email,
    });

    if (validEmail) {
      throw new ConflictException(
        "Erro in update user: this user already exists"
      );
    }

    try {
      const user: User = await this.userReporitory.updateUser(userPutDTO);

      return new ResponseDTO("Updated", await this.userReporitory.findOne(user.id), 201, true);
    } catch (exception) {
      throw new InternalServerErrorException(
        "Erro in update user: " + exception.message
      );
    }
  }

  async auth(email: string, virtualPass: string): Promise<any> {
    const user = await this.userReporitory.findOne({ email });

    console.log(user);

    if (user && (await this.comparePassword(user.password, virtualPass))) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  async delete({ id }): Promise<ResponseDTO> {
    if (!id) {
      throw new BadRequestException("Parameter 'id' is necessary!");
    }

    try {
      return new ResponseDTO(
        "User deleted",
        await this.userReporitory.delete(id),
        200,
        true
      );
    } catch (exception) {
      throw new InternalServerErrorException(
        "Erro in delete user: " + exception.message
      );
    }
  }

  private async comparePassword(
    password: string,
    virtualPass: string
  ): Promise<boolean> {
    return await bcrypt.compare(virtualPass, password);
  }
}

export default UserService;
