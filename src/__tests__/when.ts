import Joi from 'joi';

import { convertSchema, Settings } from '../index';

describe('test using when()', () => {
  test('condition is a constant value', () => {
    const schema = Joi.object({
      type: Joi.string().valid('a', 'b', 'c', 'other'),
      aField: Joi.string().when('type', {
        is: Joi.string().valid('a', 'other'),
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      bField: Joi.string().when('type', {
        is: 'b',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      cField: Joi.string().when('type', {
        is: 'c',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      nonConditionalField: Joi.string()
    }).label('TestSchema');

    const result = convertSchema(({} as unknown) as Settings, schema);
    expect(result).not.toBeUndefined;
    console.log(`when.ts:18~~~~~~~~~~~~~~~~~~~${JSON.stringify(result, null, 4)}~~~~~~~~~~~~~~~~~~~`);
  });
});

// type Subtract<T, U> = T extends U ? never : T;

type Tmp = { x: 'a'; y: 'a' | 'b' } | { x: any; y: number };
const tmp: Tmp = { x: 'a', y: '4' };
