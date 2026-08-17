import { Module } from '@nestjs/common';
import { FaxController } from './fax.controller';

@Module({
    controllers: [FaxController],
})
export class FaxModule {}
