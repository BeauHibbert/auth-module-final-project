'use strict';

const supertest = require('supertest');
const { app } = require('../src/server.js');
const request = supertest(app);

const base64 = require('base-64');

const username = 'test user';
const password = 'great password';

describe('Signin/signup testing', () => {

  test('Able to sign up', async () => {
    const response = await request.post('/signup').send({ username, password });
    expect(response.status).toBe(201);
    expect(response.body.user.username).toBe(username);
  });

  test('Response is 403 on bad login', async () => {
    const response = await request.post('/signin').set('authorization', 'bad auth string');

    expect(response.status).toBe(403);
  });

  test('Able to log in', async () => {
    let authString = base64.encode(`${username}:${password}`);

    const response = await request.post('/signin').set('authorization', `Basic ${authString}`);

    expect(response.status).toBe(200);
    expect(response.body.user.token).toBeTruthy();
  });
});

describe('', () => {
  
  test('Unable to GET with non-admin user', async () => {
    let authString = base64.encode(`${username}:${password}`);

    let response = await request.post('/signin').set('authorization', `Basic ${authString}`);

    let token = response.body.user.token;

    response = await request.get('/users').set('authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test('Can GET with an admin account', async () => {
    let response = await request.post('/signup').send({ username: 'admin', password: 'admin', role:'admin' });

    let token = response.body.user.token;

    response = await request.get('/users').set('authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body[0]).toBeTruthy();
  });
});