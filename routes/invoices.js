const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows})
    }
    catch(e){
        return next(e);
    }})
    
    router.get('/:id', async (req, res, next) => {
        try{
            const id = req.params.id;
            const results = await db.query(`SELECT * FROM invoices 
            LEFT JOIN companies ON invoices.comp_code = companies.code
            WHERE invoices.id = $1`, [id]);
            if(results.rows.length ===0) throw new ExpressError(`can't find invoice with id of ${id}`,404)
            let row = results.rows[0]
            return res.json({invoice: {"id": row.id, "amt": row.amt, "paid": row.paid, "add_date": row.add_date,
        "paid_date": row.paid_date, "company": {"code": row.code, "name": row.name, "description": row.description}}})
        }
        catch(e){
            return next(e);
        }})
     
    router.post('/', async (req, res, next) => {
        try{
            const {comp_code, amt} = req.body;
            
            const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES
            ($1, $2) returning comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
            return res.status(201).json({invoice: results.rows[0]})
        }
        catch(e){
            return next(e);
        }})
    

    router.put('/:id', async (req, res, next) => {
        try{
            const {amt} = req.body;
            const id = req.params.id;
            const results = await db.query(`UPDATE invoices SET amt = $1 
            WHERE id =$2 returning comp_code, amt, paid, add_date, paid_date`, [amt, id]);
            if(results.rows.length ===0) throw new ExpressError(`can't find id with id of ${id}`,404)
            return res.send(results.rows[0])
        }
        catch(e){
            return next(e);
        }})
    
    router.delete('/:id', async (req, res, next) => {
        try{
            const id = req.params.id;
            const search = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
            if(search.rows.length ===0) throw new ExpressError(`can't find id with code of ${id}`,404)
            const results = await db.query(`DELETE from invoices WHERE id =$1`, [id]);
            
            return res.send({msg: 'deleted'})
        }
        catch(e){
            return next(e);
        }})

module.exports = router;