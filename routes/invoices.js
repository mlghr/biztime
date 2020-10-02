
const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();


router.get("/", async function (req, res, next) {
    try {
      const result = await db.query(
            `SELECT id, comp_code, amt, paid
             FROM invoices 
             ORDER BY comp_code`
      );
      return res.json({"invoices": result.rows});
    }
    catch (err) {
      return next(err);
    }
  });

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(`SELECT i.comp_code, 
                                        i.amt, 
                                        i.paid, 
                                        i.add_date, 
                                        i.paid_date
                                    FROM invoices AS i 
                                    WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find user with code of ${id}`, 404)
    }
    invoicesResult = result.rows[0]
    return res.json({ " Requested invoice": invoicesResult})
  } catch (e) {
    return next(e)
  }
})
  
  
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt, paid, add_date } = req.body;
    const results = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date) 
                                    VALUES ($1, $2, $3, $4) 
                                    RETURNING id, comp_code, amt, paid, add_date`, [comp_code, amt, paid, add_date]);                    
    return res.status(201).json({ "inovice": results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    let id = req.params.id;
    let { amt, paid } = req.body;
    const results = await db.query(`UPDATE invoices 
                                    SET amt=$1, paid=$2 
                                    WHERE id=$3 RETURNING id, amt, paid, paid_date`, 
                                    [amt, paid, id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update invoice with id of ${id}`, 404)
    } else {
    return res.json({ "invoice": results.rows[0] })
    }
  } catch (e) {
    return next(e);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const results = await db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})


module.exports = router;