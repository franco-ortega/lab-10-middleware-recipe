const pool = require('../utils/pool');

module.exports = class Log {
    id;
    dateOfEvent;
    notes;
    rating;
    recipeId;

    constructor(row) {
      this.id = row.id,
      this.dateOfEvent = row.date_of_event;
      this.notes = row.notes;
      this.rating = row.rating;
      this.recipeId = row.recipe_id;
    }

    //Create
    static async insert(log) {
      const { rows } = await pool.query(
        'INSERT INTO recipes (date_of_event, notes, rating, recipe_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [log.date_of_event, log.notes, log.rating, log.recipeId]
      );

      return new Log(rows[0]);
    }
};
