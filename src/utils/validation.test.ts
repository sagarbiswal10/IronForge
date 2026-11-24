import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePhone,
  validateTourBooking,
  validateNewsletterEmail,
} from './validation';

test('validateEmail accepts standard email formats and rejects malformed values', () => {
  assert.equal(validateEmail('john@ironforge.fit'), true);
  assert.equal(validateEmail('  athlete.pro+1@club.co.uk  '), true);
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('name@domain'), false);
});

test('validatePhone rejects empty or malformed values and accepts valid phone numbers', () => {
  assert.equal(validatePhone(''), false);
  assert.equal(validatePhone('+1 (718) 555-0142'), true);
  assert.equal(validatePhone('+91 98765 43210'), true);
  assert.equal(validatePhone('7185550142'), true);
  assert.equal(validatePhone('12345'), false);
});

test('validateTourBooking flags missing Name, Phone, Email, and Message and accepts valid payloads', () => {
  const emptyResult = validateTourBooking({
    fullName: '',
    email: '',
    phone: '',
    primaryGoal: '',
    message: '',
  });
  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.fullName);
  assert.ok(emptyResult.errors.email);
  assert.ok(emptyResult.errors.phone);
  assert.ok(emptyResult.errors.message);

  const badPhoneResult = validateTourBooking({
    fullName: 'John Carter',
    email: 'john@email.com',
    phone: '123',
    primaryGoal: 'Build muscle',
    message: 'Interested in a morning tour.',
  });
  assert.equal(badPhoneResult.isValid, false);
  assert.ok(badPhoneResult.errors.phone);

  const validResult = validateTourBooking({
    fullName: 'John Carter',
    email: 'john@email.com',
    phone: '+1 (718) 555-0142',
    primaryGoal: '',
    message: 'Looking to tour the main floor this Friday.',
  });
  assert.equal(validResult.isValid, true);
  assert.deepEqual(validResult.errors, {});
});

test('validateNewsletterEmail validates empty, invalid, and valid email strings', () => {
  assert.equal(validateNewsletterEmail('').isValid, false);
  assert.equal(validateNewsletterEmail('not-an-email').isValid, false);
  assert.equal(validateNewsletterEmail('lifter@ironforge.fit').isValid, true);
});
