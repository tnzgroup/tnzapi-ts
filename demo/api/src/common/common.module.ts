import { Global, Module } from '@nestjs/common';
import { SessionTokenService } from './session-token.service';
import { TnzClientService } from './tnz-client.service';

// @Global(): every controller in this app needs TnzClientService (and AuthController needs
// SessionTokenService directly) — this is exactly the "truly cross-cutting concern" carve-out
// the module-sharing convention allows @Global() for (alongside config/logging), not a default
// to reach for casually.
@Global()
@Module({
    providers: [SessionTokenService, TnzClientService],
    exports: [SessionTokenService, TnzClientService],
})
export class CommonModule {}
