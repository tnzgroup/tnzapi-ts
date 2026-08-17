import { HealthController } from './health.controller';

describe('HealthController', () => {
    it('returns Status: ok', () => {
        const controller = new HealthController();
        expect(controller.health()).toEqual({ Status: 'ok' });
    });
});
