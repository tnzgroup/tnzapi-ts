import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/all-exceptions.filter';

describe('AppModule (e2e)', () => {
    let app: INestApplication;
    let originalAuthToken: string | undefined;

    beforeAll(async () => {
        originalAuthToken = process.env.TNZ_AUTH_TOKEN;
        delete process.env.TNZ_AUTH_TOKEN;

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
        app.useGlobalFilters(new AllExceptionsFilter());
        await app.init();
    });

    afterAll(async () => {
        if (originalAuthToken === undefined) {
            delete process.env.TNZ_AUTH_TOKEN;
        } else {
            process.env.TNZ_AUTH_TOKEN = originalAuthToken;
        }
        await app.close();
    });

    it('GET /api/Health returns 200 with Status: ok', async () => {
        const res = await request(app.getHttpServer()).get('/api/Health');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ Status: 'ok' });
    });

    it('GET /api/optout returns 400 with the Result/ErrorMessage envelope when no AuthToken is resolvable', async () => {
        const res = await request(app.getHttpServer()).get('/api/optout');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            Result: 'Failed',
            ErrorMessage: expect.arrayContaining([expect.stringContaining('AuthToken is required')]),
        });
    });

    it('POST /api/sms/send returns 400 for an unrecognised body field (ValidationPipe forbidNonWhitelisted)', async () => {
        const res = await request(app.getHttpServer()).post('/api/sms/send').send({ Bogus: 'not a real field' });

        expect(res.status).toBe(400);
    });
});
