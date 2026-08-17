import { Module } from '@nestjs/common';
import { RcsController } from './rcs.controller';

@Module({
    controllers: [RcsController],
})
export class RcsModule {}
