import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (value instanceof Object && ValidationPipe.isEmpty(value)) {
      throw new HttpException(
        'Validation Failed: No Body Submitted',
        HttpStatus.BAD_REQUEST,
      );
    }

    const {metatype} = metadata;

    if (!metatype || !ValidationPipe.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new HttpException(
        `Validation Failed: ${ValidationPipe.formatErrors(errors)}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }

  private static toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private static formatErrors(errors: any[]): string {
    return errors
      .map(err => {
        for (const property in err.constraints) {
          return err.constraints[property];
        }
      })
      .join(', ');
  }

  private static isEmpty(value: any) {
    if (Object.keys(value).length > 0) {
      return false;
    }

    return true;
  }
}
