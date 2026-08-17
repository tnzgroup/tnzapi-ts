import { Module } from '@nestjs/common';
import { GroupContactsController } from './group-contacts.controller';

@Module({
    controllers: [GroupContactsController],
})
export class GroupContactsModule {}
