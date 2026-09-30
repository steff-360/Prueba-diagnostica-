import request from 'supertest';
import app from '../src/app.js';

describe('Application API validation', () => {
  test('rejects an invalid application source', async () => {
    const response = await request(app)
      .post('/applications')
      .send({
        candidateId: 1,
        vacancyId: 1,
        source: 'INVALID',
        coverLetter: 'I have experience.'
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_SOURCE');
  });

  test('rejects an invalid status filter', async () => {
    const response = await request(app)
      .get('/applications')
      .query({ status: 'INVALID' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_STATUS');
  });

  test('returns 404 for an unknown route', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
