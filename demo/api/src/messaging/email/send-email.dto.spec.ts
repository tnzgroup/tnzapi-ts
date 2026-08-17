import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendEmailDto } from './send-email.dto';

describe('SendEmailDto', () => {
    it('requires a non-empty Subject — the SDK rejects a missing EmailSubject with no TemplateID escape hatch', async () => {
        const errors = await validate(plainToInstance(SendEmailDto, { EmailAddress: 'a@example.com' }));
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.property === 'Subject')).toBe(true);
    });

    it('rejects an empty-string Subject the same way as a missing one', async () => {
        const errors = await validate(plainToInstance(SendEmailDto, { EmailAddress: 'a@example.com', Subject: '' }));
        expect(errors.some((error) => error.property === 'Subject')).toBe(true);
    });

    it('passes validation once a non-empty Subject is present', async () => {
        const errors = await validate(plainToInstance(SendEmailDto, { EmailAddress: 'a@example.com', Subject: 'Hi' }));
        expect(errors).toHaveLength(0);
    });
});
