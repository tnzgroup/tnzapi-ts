import { TNZAPI, WebhookCallbackFormat, ErrorResponseDTO } from '../../src';
import { RCSFallbackMode } from '../../src/Common/enums/MessagingEnums';

const client = new TNZAPI({ AuthToken: process.env.TNZ_AUTH_TOKEN });

// ─── Single-destination shorthand ────────────────────────────────────────────

async function sendRCSShorthand() {
    const shorthand = await client.Messaging.RCS.SendMessage({
        Message: 'Hello, this is a shorthand test.',
        ToNumber: '+6421000001,+6421000002',
    });
    if (!(shorthand instanceof ErrorResponseDTO)) console.log(shorthand.MessageID);
}

(async () => {
    // Basic send
    const result = await client.Messaging.RCS.SendMessage({
        Message: 'Hello [[FirstName]], your appointment is confirmed.',
        Destinations: [{ ToNumber: '+6421000001', FirstName: 'Alice' }],
        FallbackMode: [RCSFallbackMode.SMS, RCSFallbackMode.Voice], // tried in order if RCS delivery fails
    });
    if (!(result instanceof ErrorResponseDTO)) console.log(result.MessageID);

    // Bulk send with webhook
    const bulk = await client.Messaging.RCS.SendMessage({
        Message: 'Hi [[FirstName]], your renewal is due on [[Custom1]].',
        Destinations: [
            { ToNumber: '+6421000001', FirstName: 'Alice', Custom1: '2027-03-31' },
            { ContactID: '8000000a-f002-4007-b00a-d00000000002' },
            { GroupID: '4000000b-f002-4007-b00a-c00000000002' },
        ],
        WebhookCallbackURL: 'https://yourapp.example.com/webhooks/rcs',
        WebhookCallbackFormat: WebhookCallbackFormat.JSON,
    });
    if (!(bulk instanceof ErrorResponseDTO)) console.log(bulk.MessageID);

    // Scheduled send
    const scheduled = await client.Messaging.RCS.SendMessage({
        Message: 'Staff meeting at 9am today.',
        Destinations: [{ GroupID: '4000000b-f002-4007-b00a-c00000000003' }],
        SendTime: '2027-01-01 09:00',
        Timezone: 'New Zealand',
    });
    if (!(scheduled instanceof ErrorResponseDTO)) console.log(scheduled.MessageID);

    // Builder pattern
    const msg = client.Messaging.RCS;
    msg.AddRecipient('+6421000001');
    msg.AddRecipient({ ToNumber: '+6421000002', FirstName: 'Bob' });

    const built = await msg.SendMessage({
        Message: 'Hello [[FirstName]], this is a test.',
        Reference: 'my-rcs-batch',
    });
    if (!(built instanceof ErrorResponseDTO)) console.log(built.MessageID);

    await sendRCSShorthand();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});