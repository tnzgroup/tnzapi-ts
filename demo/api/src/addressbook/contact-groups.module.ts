import { Module } from '@nestjs/common';
import { ContactGroupsController } from './contact-groups.controller';

@Module({
    controllers: [ContactGroupsController],
})
export class ContactGroupsModule {}
