import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PacingDto, RescheduleDto, ResubmitDto } from './action-dtos';

describe('action-dtos', () => {
    it('RescheduleDto requires a non-empty SendTime', async () => {
        const errors = await validate(plainToInstance(RescheduleDto, {}));
        expect(errors.length).toBeGreaterThan(0);
        expect(await validate(plainToInstance(RescheduleDto, { SendTime: '2026-08-01 09:00' }))).toHaveLength(0);
    });

    it('ResubmitDto requires a non-empty SendTime', async () => {
        const errors = await validate(plainToInstance(ResubmitDto, {}));
        expect(errors.length).toBeGreaterThan(0);
    });

    it('PacingDto requires an integer NumberOfOperators', async () => {
        const errors = await validate(plainToInstance(PacingDto, {}));
        expect(errors.length).toBeGreaterThan(0);
        expect(await validate(plainToInstance(PacingDto, { NumberOfOperators: 5 }))).toHaveLength(0);
    });
});
