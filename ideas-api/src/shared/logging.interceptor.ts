import {Injectable, ExecutionContext, NestInterceptor, Logger} from '@nestjs/common'
import {Observable} from "rxjs";
import { tap } from  'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    // @ts-ignore
    intercept(context: ExecutionContext, {handle}: Observable<any>): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        const now = Date.now();

        return handle().pipe(
            tap(() => {
                Logger.log(
                    `${method} ${url} ${Date.now() - now}ms`,
                    context.getClass().name,
                )
            })
        );
    }
}
