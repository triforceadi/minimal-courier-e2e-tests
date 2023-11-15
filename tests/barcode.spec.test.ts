import { test, expect } from '@playwright/test';

test('(GET-ALL)Returns 200 and all available barcodes', async ({ request }) => {
    const response = await request.get('/barcodes');
    const responseBody = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(responseBody).toEqual(expect.any(Array));
  });

test('(PUT)Returns 400 if the delivered barcode is not provided', async ({ request }) => {
    const response = await request.put('/barcodes/deliver/',{data:{barcode:""}});
    const responseBody = await response.json();
    expect(response.status()).toBe(400);
    expect(responseBody.code).toBe(400);
    expect(responseBody.message).toContain("Barcode is required")
  });

test('(PUT)Returns 400 if the delivered barcode does not exist', async ({ request }) => {
    const response = await request.put('/barcodes/deliver/',{data:{barcode:"9999999"}});
    const responseBody = await response.json();
    expect(response.status()).toBe(404);
    expect(responseBody.code).toBe(404);
    expect(responseBody.message).toContain("Barcode could not be found")
  });

  test('(POST-PUT)Returns 200 when delivering a newly created barcode', async ({ request }) => {
    const response = await request.post('/barcodes/new',{data:{barcode:"AWB55500098"}});
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({
      value: "AWB55500098",
      isValid: true,
      isDelivered: false
    });

    const putResponse =  await request.put('/barcodes/deliver',{data:{barcode:"AWB55500098"}});
    expect(putResponse.status()).toBe(200);
    expect(await putResponse.json()).toEqual({
      barcode:{
      value: "AWB55500098",
      isValid: true,
      isDelivered: true
    }
    });
  });

  test('(POST)Returns 201 when creating a new barcode', async ({ request }) => {
    const response = await request.post('/barcodes/new',{data:{barcode:"AWB55500099"}});
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({
      value: "AWB55500099",
      isValid: true,
      isDelivered: false
    });
  });

  test('(POST)Returns 400 when trying to validate barcode without providing one', async ({ request }) => {
    const response = await request.post('/barcodes/validate',{data:{barcode:""}});
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(response.status()).toBe(400);
    expect(responseBody.code).toBe(400);
    expect(responseBody.message).toContain("Barcode is required")
  });