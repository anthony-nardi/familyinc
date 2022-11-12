import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);
    constructor(
        private readonly jwtService: JwtService,
    ) {

    }
}
