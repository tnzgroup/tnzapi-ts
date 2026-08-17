import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { SmsModule } from './messaging/sms/sms.module';
import { EmailModule } from './messaging/email/email.module';
import { FaxModule } from './messaging/fax/fax.module';
import { TtsModule } from './messaging/tts/tts.module';
import { VoiceModule } from './messaging/voice/voice.module';
import { WhatsappModule } from './messaging/whatsapp/whatsapp.module';
import { RcsModule } from './messaging/rcs/rcs.module';
import { WorkflowModule } from './messaging/workflow/workflow.module';
import { ContactsModule } from './addressbook/contacts.module';
import { GroupsModule } from './addressbook/groups.module';
import { ContactGroupsModule } from './addressbook/contact-groups.module';
import { GroupContactsModule } from './addressbook/group-contacts.module';
import { OptoutModule } from './optout/optout.module';

@Module({
    imports: [
        CommonModule,
        HealthModule,
        AuthModule,
        SettingsModule,
        SmsModule,
        EmailModule,
        FaxModule,
        TtsModule,
        VoiceModule,
        WhatsappModule,
        RcsModule,
        WorkflowModule,
        ContactsModule,
        GroupsModule,
        ContactGroupsModule,
        GroupContactsModule,
        OptoutModule,
    ],
})
export class AppModule {}
