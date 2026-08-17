export enum WebhookCallbackFormat {
    JSON = 'JSON',
    XML = 'XML',
    POST = 'POST',
    GET = 'GET',
}

export enum NotificationType {
    None = 'None',
    Webhook = 'Webhook',
    Email = 'Email',
}

export enum AnswerPhoneMode {
    NDAS = 'NDAS',
    NDAF = 'NDAF',
    DAS = 'DAS',
    DAF = 'DAF',
}

export enum TTSVoice {
    Female1 = 'Female1',
    Male1 = 'Male1',
    Nicole = 'Nicole',
    Russell = 'Russell',
    Amy = 'Amy',
    Brian = 'Brian',
    Emma = 'Emma',
}

export enum FaxResolution {
    Low = 'Low',
    High = 'High',
}

export enum SMSFallbackMode {
    None = 'None',
    RCS = 'RCS',
    WAPP = 'WAPP',
    Voice = 'Voice',
}

export enum WhatsAppFallbackMode {
    None = 'None',
    RCS = 'RCS',
    SMS = 'SMS',
    Voice = 'Voice',
}

export enum RCSFallbackMode {
    None = 'None',
    SMS = 'SMS',
    Voice = 'Voice',
    WAPP = 'WAPP',
}