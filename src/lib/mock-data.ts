import type { Recipe } from "@/types/recipe";

// Mock Recipe Data
export const mockRecipes: Recipe[] = [
  {
    _id: '1',
    title: 'Spaghetti Carbonara',
    description: 'A classic Italian pasta dish, perfect for a quick and satisfying meal. Features crispy guanciale, creamy egg and cheese sauce, and a generous amount of black pepper.',
    ingredients: [
      { name: 'Spaghetti', quantity: '200', unit: 'g' },
      { name: 'Guanciale or Pancetta', quantity: '100', unit: 'g', },
      { name: 'Large Eggs', quantity: '2' },
      { name: 'Pecorino Romano Cheese', quantity: '50', unit: 'g', },
      { name: 'Freshly Ground Black Pepper', quantity: 'to taste' },
      { name: 'Salt', quantity: 'to taste (for pasta water)'}
    ],
    instructions: [
      'Bring a large pot of salted water to a boil. Cook spaghetti according to package directions until al dente.',
      'While the pasta cooks, cut the guanciale into small cubes or strips. Fry in a dry pan over medium heat until golden brown and crispy. Remove guanciale from the pan and set aside, leaving the rendered fat in the pan.',
      'In a bowl, whisk the eggs with finely grated Pecorino Romano cheese and a generous amount of freshly ground black pepper.',
      'Once the pasta is cooked, drain it, reserving about a cup of the starchy pasta water.',
      'Add the drained spaghetti to the pan with the guanciale fat. Toss to coat.',
      'Remove the pan from the heat. Quickly pour in the egg and cheese mixture, stirring vigorously to combine. The heat of the pasta will cook the eggs gently, creating a creamy sauce. If the sauce is too thick, add a tablespoon or two of the reserved pasta water until it reaches the desired consistency.',
      'Stir in the crispy guanciale.',
      'Serve immediately, garnished with more grated Pecorino Romano and black pepper.'
    ],
    imageUrls: ['https://picsum.photos/seed/picsum/200/300', 'https://picsum.photos/seed/picsum/200/300', 'https://picsum.photos/seed/picsum/200/300'],
    tags: ['pasta', 'italian', 'classic', 'quick meal', 'comfort food'],
    prepTime: '10 minutes',
    cookTime: '15 minutes',
    servings: 2,
    authorId: 'family-member-1', // Placeholder
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-16T12:30:00Z'),
    language: 'en',
    notes: 'For a richer sauce, you can use one whole egg and one egg yolk. Ensure the pan is off the heat when adding the egg mixture to prevent scrambling.'
  },
  {
    _id: '2',
    title: 'Chicken Tikka Masala',
    description: 'A popular and beloved Indian curry dish with tender chicken pieces in a creamy, mildly spiced tomato-based sauce. Perfect with naan or basmati rice.',
    ingredients: [
      { name: 'Boneless, Skinless Chicken Breasts or Thighs', quantity: '500', unit: 'g' },
      { name: 'Plain Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Lemon Juice', quantity: '2', unit: 'tbsp' },
      { name: 'Garam Masala', quantity: '2', unit: 'tsp' },
      { name: 'Turmeric Powder', quantity: '1', unit: 'tsp' },
      { name: 'Cumin Powder', quantity: '1', unit: 'tsp' },
      { name: 'Cayenne Pepper or Chili Powder', quantity: '1/2', unit: 'tsp' },
      { name: 'Ginger-Garlic Paste', quantity: '1', unit: 'tbsp' },
      { name: 'Vegetable Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Large Onion', quantity: '1' },
      { name: 'Canned Tomato Puree or Crushed Tomatoes', quantity: '400', unit: 'g' },
      { name: 'Heavy Cream or Coconut Cream', quantity: '1/2', unit: 'cup' },
      { name: 'Fresh Cilantro', quantity: 'for garnish' },
      { name: 'Salt', quantity: 'to taste' }
    ],
    instructions: [
      'Cut the chicken into 1-inch pieces. In a bowl, combine chicken with yogurt, lemon juice, garam masala, turmeric, cumin, cayenne pepper, and ginger-garlic paste. Mix well, cover, and marinate in the refrigerator for at least 1 hour, or preferably overnight.',
      'Heat vegetable oil in a large pan or Dutch oven over medium heat. Add the chopped onion and cook until softened and translucent, about 5-7 minutes.',
      'Add the marinated chicken to the pan (shaking off excess marinade). Cook until browned on all sides.',
      'Stir in the tomato puree and salt. Bring to a simmer, then reduce heat, cover, and cook for 15-20 minutes, or until the chicken is cooked through and tender, stirring occasionally.',
      'Stir in the heavy cream (or coconut cream for a dairy-free option). Simmer gently for another 5 minutes, allowing the sauce to thicken slightly. Do not boil rapidly after adding cream.',
      'Taste and adjust seasoning if necessary (salt, spices).',
      'Garnish with freshly chopped cilantro. Serve hot with basmati rice, naan bread, or roti.'
    ],
    imageUrls: ['https://picsum.photos/seed/picsum/200/400', 'https://picsum.photos/seed/picsum/200/400'],
    tags: ['indian', 'curry', 'chicken', 'creamy', 'main course'],
    prepTime: '20 minutes (plus marination time)',
    cookTime: '30-40 minutes',
    servings: 4,
    authorId: 'family-member-2', // Placeholder
    createdAt: new Date('2024-02-10T14:00:00Z'),
    updatedAt: new Date('2024-02-10T14:00:00Z'),
    language: 'en',
    notes: 'Adjust the amount of cayenne pepper to control the spiciness. For a smoother sauce, you can blend the tomato mixture before adding the chicken back in.'
  },
  // Add more mock recipes here if desired
];
