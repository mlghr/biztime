const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");

let router = new express.Router();

  
router.get("/", async function (req, res, next) {
    try {
      const result = await db.query(
            `SELECT code, name 
             FROM companies 
             ORDER BY name`
      );
      return res.json({"companies": result.rows});
    }
    catch (err) {
      return next(err);
    }
  });

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query('SELECT * FROM users WHERE code = $1', [code])
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find user with code of ${code}`, 404)
    }
    return res.send({ company: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})
  
  router.get('/search', async (req, res, next) => {
    try {
      const { type } = req.query;
      const results = await db.query(`SELECT * FROM users WHERE type=$1`, [type])
      return res.json(results.rows)
    } catch (e) {
      return next(e)
    }
  })
  
  router.post('/', async (req, res, next) => {
    try {
      const { name, type } = req.body;
      const results = await db.query('INSERT INTO companies (name, type) VALUES ($1, $2) RETURNING id, name, type', [name, type]);
      return res.status(201).json({ user: results.rows[0] })
    } catch (e) {
      return next(e)
    }
  })
  
  router.patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, type } = req.body;
      const results = await db.query('UPDATE users SET name=$1, type=$2 WHERE id=$3 RETURNING id, name, type', [name, type, id])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't update user with id of ${id}`, 404)
      }
      return res.send({ user: results.rows[0] })
    } catch (e) {
      return next(e)
    }
  })
  
  router.delete('/:id', async (req, res, next) => {
    try {
      const results = db.query('DELETE FROM users WHERE id = $1', [req.params.id])
      return res.send({ msg: "DELETED!" })
    } catch (e) {
      return next(e)
    }
  })
  
  
  module.exports = router;