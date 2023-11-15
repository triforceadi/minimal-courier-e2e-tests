import { test, expect } from '@playwright/test';

test('(POST)Returns 201 on creating a courier with complete information', async ({ request }) => {
  const response = await request.post('/couriers', {
    data: {
      firstName: 'adrian',
      lastName: 'Cosmin',
      age: 28,
      licenses: [
        "Driver's License"
      ]
    }
  });
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(201);
  const responseBody = await response.json();
  expect(responseBody.id).not.toBeNull;
  expect(responseBody.firstName).toEqual('adrian');
  expect(responseBody.lastName).toEqual('Cosmin');
  expect(responseBody.age).toEqual(28);
  expect(responseBody.licenses[0]).toContain("Driver's License")
});

test('(POST)Returns 400 on trying to create a courier with missing information', async ({ request }) => {
  const response = await request.post('/couriers', {
    data: {
      licenses: [
        "Driver's License"
      ]
    }
  });
  expect(response.status()).toBe(400);
  const responseBody = await response.json();
  expect(responseBody.code).toBe(400);
  expect(responseBody.message).toContain("Incomplete courier information")
});

test('(POST-GET)Returns 200 and courier info on previously created courier', async ({ request }) => {
  const response = await request.post('/couriers', {
    data: {
      firstName: 'adrian',
      lastName: 'Cosmin',
      age: 28,
      licenses: [
        "Driver's License"
      ]
    }
  });

  const postResponseBody = await response.json();
  const getCourierById = await request.get('/couriers/' + postResponseBody.id);
  const getResponseBody = await getCourierById.json();

  expect(getCourierById.ok()).toBeTruthy();
  expect(getCourierById.status()).toBe(200);
  expect(getResponseBody.id).toEqual(postResponseBody.id);
  expect(getResponseBody.firstName).toEqual(postResponseBody.firstName);
  expect(getResponseBody.lastName).toEqual(postResponseBody.lastName);
  expect(getResponseBody.age).toEqual(postResponseBody.age);
  expect(getResponseBody.licenses[0]).toContain(postResponseBody.licenses[0])
});

test('(GET)Returns 404 if the courier could not be found', async ({ request }) => {
  const response = await request.get('/couriers/99999999');
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({
    code: 404,
    message: "Courier could not be found"
  });
});

test('(GET-ALL)Returns 200 and all couriers', async ({ request }) => {
  const response = await request.get('/couriers');
  const responseBody = await response.json();

  expect(response.status()).toBe(200);
  expect(responseBody).not.toBeNull;
  expect(responseBody).not.toBeEmpty;
});

test('(PUT)Returns 404 if the courier id could not be found', async ({ request }) => {
  const response = await request.put('/couriers/99999999',{
    data: {
      "firstName": "adrian",
      "lastName": "Cosmin",
      "age": 28,
      "licenses": [
        "Drivers License"
      ]
    }
  });
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({
    code: 404,
    message: "Courier could not be found using provided Id"
  });
});


test('(POST-PUT)Returns 200 and updated courier info on previously created courier', async ({ request }) => {
  const responseCreate = await request.post('/couriers', {
    data: {
      firstName: 'adrian',
      lastName: 'Cosmin',
      age: 28,
      licenses: [
        "Driver's License"
      ]
    }
  });
  const postResponseBody = await responseCreate.json();

  const responseUpdate = await request.put('/couriers/'+postResponseBody.id, {
    data: {
      firstName: 'mihai',
      lastName: 'marcel',
      age: 35,
      licenses: [
        "Driver's License",
        "Dangerous Goods Certification"
      ]
    }
  });

  const putResponseBody = await responseUpdate.json();

  const getCourierById = await request.get('/couriers/' + postResponseBody.id);

  const getResponseBody = await getCourierById.json();
  expect(getCourierById.ok()).toBeTruthy();
  expect(getCourierById.status()).toBe(200);
  expect(getResponseBody.id).toEqual(putResponseBody.id);
  expect(getResponseBody.firstName).toEqual(putResponseBody.firstName);
  expect(getResponseBody.lastName).toEqual(putResponseBody.lastName);
  expect(getResponseBody.age).toEqual(putResponseBody.age);
  expect(getResponseBody.licenses[0]).toContain(putResponseBody.licenses[0])
});

test('(POST-PUT)Returns 400 if trying to update courier with missing information', async ({ request }) => {
  const responseCreate = await request.post('/couriers', {
    data: {
      firstName: 'adrian',
      lastName: 'Cosmin',
      age: 28,
      licenses: [
        "Driver's License"
      ]
    }
  });
  const postResponseBody = await responseCreate.json();

  const responseUpdate = await request.put('/couriers/'+postResponseBody.id, {
    data: {
      licenses: [
        "Driver's License",
        "Dangerous Goods Certification"
      ]
    }
  });
  const putResponseBody = await responseUpdate.json();
  expect(responseUpdate.status()).toBe(400);
  expect(putResponseBody.code).toBe(400);
  expect(putResponseBody.message).toEqual("Incomplete courier information");
});