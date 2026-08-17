import { Module } from '@nestjs/common';
import { OptoutController } from './optout.controller';

@Module({
    controllers: [OptoutController],
})
export class OptoutModule {}
