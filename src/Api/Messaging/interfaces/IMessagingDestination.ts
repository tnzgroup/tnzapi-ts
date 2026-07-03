import { ISMSDestination } from './ISMSArgs';
import { IEmailDestination } from './IEmailArgs';
import { IFaxDestination } from './IFaxArgs';
import { ITTSDestination } from './ITTSArgs';
import { IVoiceDestination } from './IVoiceArgs';
import { IWhatsAppDestination } from './IWhatsAppArgs';
import { IRCSDestination } from './IRCSArgs';
import { IWorkflowDestination } from './IWorkflowArgs';

export type IMessagingDestination =
    | ISMSDestination
    | IEmailDestination
    | IFaxDestination
    | ITTSDestination
    | IVoiceDestination
    | IWhatsAppDestination
    | IRCSDestination
    | IWorkflowDestination;