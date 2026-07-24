import { describe, expect, it } from 'vitest';
import { validateRecipeInput } from './recipe-validation';

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
