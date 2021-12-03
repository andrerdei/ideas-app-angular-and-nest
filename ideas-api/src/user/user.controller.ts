import {Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {UserService} from "./user.service";
import {UserDTO, UserRO} from "./user.dto";
import {AuthGuard} from "../shared/auth.guard";

@Controller()
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get('api/users')
  @UseGuards(new AuthGuard())
  public showAllUsers(): Promise<UserRO[]> {
    return this.userService.showAll();
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  public login(@Body() data: UserDTO): Promise<UserRO> {
    return this.userService.login(data);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  public register(@Body() data: UserDTO): Promise<UserRO> {
    return this.userService.register(data);
  }
}
