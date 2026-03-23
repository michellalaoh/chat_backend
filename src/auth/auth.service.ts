import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================
  async register(email: string, password: string) {
    // ✅ check existing user
    const existing =
      await this.usersService.findByEmail(email);

    if (existing) {
      throw new ConflictException(
        'Email already registered',
      );
    }

    // ✅ hash password
    const hash = await bcrypt.hash(password, 10);

    // ✅ create user via UsersService
    const user = await this.usersService.createUser({
      email,
      username: email.split('@')[0],
      displayName: email.split('@')[0],
      password: hash,
    });

    return this.buildAuthResponse(user);
  }

  // =========================
  // LOGIN
  // =========================
  async login(email: string, password: string) {
    const user =
      await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const valid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    return this.buildAuthResponse(user);
  }

  // =========================
  // TOKEN CREATION
  // =========================
  private buildAuthResponse(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken =
      this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
    };
  }
}