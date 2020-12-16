const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');

describe('recipe-lab routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  afterAll(() => {
    return pool.end;
  });

  it('creates a log', async() => {
    const recipe = await Recipe.insert(
      {
        name: 'cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ]
      }
    );
    return await request(app)
      .post('/api/v1/logs')
      .send({
        dateOfEvent: 'Sept 26, 2020',
        notes: 'Sunny day.',
        rating: 96,
        recipeId: recipe.id
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          dateOfEvent: 'Sept 26, 2020',
          notes: 'Sunny day.',
          rating: '96',
          recipeId: recipe.id
        });
      });
  });

});
