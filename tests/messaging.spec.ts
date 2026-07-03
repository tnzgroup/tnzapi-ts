// Full integration suite — imports all integration test modules.
// Run individual files directly for targeted testing, e.g.:
//   npx jest tests/integration/messaging/sms.spec.ts

import './integration/messaging/sms.spec';
import './integration/messaging/email.spec';
import './integration/messaging/fax.spec';
import './integration/messaging/tts.spec';
import './integration/messaging/voice.spec';
import './integration/messaging/workflow.spec';
import './integration/messaging/whatsapp.spec';
import './integration/actions/actions.spec';
import './integration/reports/reports.spec';