import { normalisePhone, phoneInputValue } from '../src/phone';
describe('international phone formatting',()=>{
 test.each(['0821234567','+27 82 123 4567','27821234567','0027821234567'])('normalises %s without duplicating the calling code',input=>expect(normalisePhone(input,'ZA')).toBe('+27821234567'));
 test('switches the country when an international number is pasted',()=>{const value=phoneInputValue('+44 7911 123456','ZA');expect(value?.e164).toBe('+447911123456');expect(value?.national.startsWith('+44')).toBe(false)});
 test('formats US calling code and national numbers',()=>expect(normalisePhone('+1 (415) 555-2671','US')).toBe('+14155552671'));
 test.each(['abc123','+27 000','123','0821234567 ext 42'])('rejects invalid input %s',value=>expect(normalisePhone(value,'ZA')).toBeNull());
});
