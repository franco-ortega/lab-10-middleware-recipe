const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/Recipe');
const Log = require('../lib/models/Log');

describe('recipe-lab routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  afterAll(() => {
    return pool.end;
  });

  it('creates a recipe', async() => {
    return await request(app)
      .post('/api/v1/recipes')
      .send({
        name: 'cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ],
        ingredients: [
          { amount: 'joy',
            measurement: 'rainbows',
            name: 'whiskey' }
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ],
          ingredients: [
            { amount: 'joy',
              measurement: 'rainbows',
              name: 'whiskey' }
          ]
        });
      });
  });

  it('gets all recipes', async() => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ].map((recipe => Recipe.insert(recipe))));

    return await request(app)
      .get('/api/v1/recipes')
      .then(res => {
        recipes.forEach(recipe => {
          expect(res.body).toContainEqual(recipe);
        });
      });
  });

  it('gets one recipe by id', async() => {
    const recipe = await Recipe.insert(
      { name: 'cookies', directions: [] },
    );

    const logs = await Promise.all([
      {
        dateOfEvent: 'Sept 26, 2020',
        notes: 'Sunny day.',
        rating: 96,
        recipeId: recipe.id
      },
      {
        dateOfEvent: 'March 9, 2020',
        notes: 'Wind and rain.',
        rating: 47,
        recipeId: recipe.id
      },
      {
        dateOfEvent: 'Jan 2, 2020',
        notes: 'Lovely snow.',
        rating: 82,
        recipeId: recipe.id
      }
    ].map(log => Log.insert(log)));

    const response = await request(app)
      .get(`/api/v1/recipes/${recipe.id}`);

    expect(response.body).toEqual({
      ...recipe,
      logs: expect.arrayContaining(logs)
    });
  });

  it('updates a recipe by id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
      ingredients: [
        { amount: 'joy',
          measurement: 'rainbows',
          name: 'whiskey' }
      ]
    });

    return await request(app)
      .put(`/api/v1/recipes/${recipe.id}`)
      .send({
        name: 'good cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ],
        ingredients: [
          { amount: 'joy',
            measurement: 'rainbows',
            name: 'whiskey' }
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'good cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ],
          ingredients: [
            { amount: 'joy',
              measurement: 'rainbows',
              name: 'whiskey' }
          ]
        });
      });
  });

  it('deletes a recipe by id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    const response = await request(app)
      .delete(`/api/v1/recipes/${recipe.id}`);

    expect(response.body).toEqual({
      ...recipe,
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });
  });

});
