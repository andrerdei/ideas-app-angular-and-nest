import {Body, Controller, Get, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {UserService} from "./user.service";
import {UserDTO} from "./user.dto";

@Controller()
export class UserController {
  constructor(private userService: UserService) {
  }

  @Get('api/users')
  public showAllUsers() {
    return this.userService.showAll();
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  public login(@Body() data: UserDTO) {
    return this.userService.login(data);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  public register(@Body() data: UserDTO) {
    return this.userService.register(data);
  }
}
