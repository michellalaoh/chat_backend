import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // REGISTER
  async register(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.createUser({
      email,
      username: email,
      displayName: email,
      password: hash,
    });

    return this.generateToken(user.id);
  }

  // LOGIN
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!valid) throw new UnauthorizedException();

    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    return {
      accessToken: this.jwtService.sign({
        sub: userId,
      }),
    };
  }
}