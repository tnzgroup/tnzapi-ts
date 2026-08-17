import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class HealthController {
    @Get('Health')
    health(): { Status: string } {
        return { Status: 'ok' };
    }
}
