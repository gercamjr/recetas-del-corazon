import { describe, expect, it } from 'vitest';
import {
  isValidRecipeId,
  validateRecipeInput,
  validateRecipePatch,
} from './recipe-validation';

const validRecipe = {
  title: '  Family Soup  ',
  description: '  A comforting soup.  ',
  ingredients: [{ name: ' Carrot ', quantity: ' 2 ', unit: ' cups ' }],
  instructions: [' Chop vegetables ', ' Simmer '],
  imageUrls: ['https://example.com/soup.jpg'],
  tags: [' dinner '],
  prepTime: '',
  cookTime: '30 minutes',
  servings: '4',
  language: 'en',
  notes: '',
};

describe('validateRecipeInput', () => {
  it('accepts and normalizes a valid recipe payload', () => {
    const result = validateRecipeInput(validRecipe);

    expect(result).toEqual({
      success: true,
      data: {
        title: 'Family Soup',
        description: 'A comforting soup.',
        ingredients: [{ name: 'Carrot', quantity: '2', unit: 'cups' }],
        instructions: ['Chop vegetables', 'Simmer'],
        imageUrls: ['https://example.com/soup.jpg'],
        tags: ['dinner'],
        prepTime: '',
        cookTime: '30 minutes',
        servings: 4,
        language: 'en',
        notes: '',
      },
    });
  });

  it.each([
    ['a non-object body', null],
    ['an empty title', { ...validRecipe, title: '   ' }],
    ['an invalid language', { ...validRecipe, language: 'fr' }],
    ['empty ingredients', { ...validRecipe, ingredients: [] }],
    ['an incomplete ingredient', { ...validRecipe, ingredients: [{ name: 'Salt', quantity: '' }] }],
    ['empty instructions', { ...validRecipe, instructions: [] }],
    ['a blank instruction', { ...validRecipe, instructions: [''] }],
    ['invalid image URLs', { ...validRecipe, imageUrls: ['not-a-url'] }],
    ['non-positive servings', { ...validRecipe, servings: 0 }],
  ])('rejects %s', (_label, input) => {
    const result = validateRecipeInput(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTypeOf('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('does not copy server-owned or unknown fields', () => {
    const result = validateRecipeInput({
      ...validRecipe,
      authorId: 'attacker-controlled',
      unexpected: 'value',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('authorId');
      expect(result.data).not.toHaveProperty('unexpected');
    }
  });
});

describe('isValidRecipeId', () => {
  it.each([
    '507f1f77bcf86cd799439011',
    'ABCDEFABCDEFABCDEFABCDEF',
  ])('accepts a 24-character hexadecimal Mongo ObjectId: %s', (id) => {
    expect(isValidRecipeId(id)).toBe(true);
  });

  it.each([
    '',
    '507f1f77bcf86cd79943901',
    '507f1f77bcf86cd7994390110',
    '507f1f77bcf86cd79943901z',
    'not-an-object-id',
  ])('rejects an invalid Mongo ObjectId: %s', (id) => {
    expect(isValidRecipeId(id)).toBe(false);
  });
});

describe('validateRecipePatch', () => {
  it('accepts and normalizes supported partial fields', () => {
    expect(validateRecipePatch({
      title: '  Updated soup  ',
      tags: [' dinner ', ' family '],
      imageUrls: ['https://example.com/updated.jpg'],
    })).toEqual({
      success: true,
      data: {
        title: 'Updated soup',
        tags: ['dinner', 'family'],
        imageUrls: ['https://example.com/updated.jpg'],
      },
    });
  });

  it.each([
    ['a non-object body', null],
    ['an empty object', {}],
    ['unsupported fields', { language: 'es' }],
    ['a blank title', { title: '   ' }],
    ['invalid ingredients', { ingredients: [{ name: 'Salt', quantity: '' }] }],
    ['empty instructions', { instructions: [] }],
    ['invalid image URLs', { imageUrls: ['javascript:alert(1)'] }],
  ])('rejects %s', (_label, input) => {
    const result = validateRecipePatch(input);
    expect(result.success).toBe(false);
  });
});
