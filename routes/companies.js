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
    const code = req.params.code;
    const results = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find user with code of ${code}`, 404)
    }
    companyResult = results.rows[0]
    return res.json({ "company": companyResult })
  } catch (e) {
    return next(e)
  }
})
  
  
router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(`INSERT INTO companies (code, name, description) 
                                    VALUES ($1, $2, $3) 
                                    RETURNING code, name, description`, [code, name, description]);                    
    return res.status(201).json({ "company": results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.patch('/:code', async (req, res, next) => {
  try {
    let code = req.params.code;
    let { name, description } = req.body;
    const results = await db.query(`UPDATE companies 
                                    SET name=$1, description=$2 
                                    WHERE code=$3 RETURNING code, name, description`, 
                                    [name, description, code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404)
    } else {
    return res.json({ "company": results.rows[0] })
    }
  } catch (e) {
    return next(e);
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    const results = await db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})


module.exports = router;