const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
try{
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({companies: results.rows})
}
catch(e){
    return next(e);
}})

router.get('/:code', async (req, res, next) => {
    try{
        const code = req.params.code;
        // const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        const results = await db.query(`SELECT companies.code, companies.name, companies.description, invoices.id
        FROM companies 
        INNER JOIN invoices 
        ON companies.code = invoices.comp_code
        WHERE code = $1`, [code]);
        if(results.rows.length ===0) throw new ExpressError(`can't find company with code of ${code}`,404)
        async function createInvoicesArr(rowsArr){
            let invoicesArr = [];
        for(let i = 0; i < rowsArr.length; i++){
           
            invoicesArr.push(rowsArr[i].id)
        }
        return invoicesArr;
        }

        let arr = await createInvoicesArr(results.rows);

        return res.json(
            {company: {
                code: results.rows[0].code,
                name: results.rows[0].name,
                description: results.rows[0].description,
                invoices: arr
            }}
            )
    }
    catch(e){
        return next(e);
    }})

router.post('/', async (req, res, next) => {
    try{
        const {code, name, description} = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES
        ($1, $2, $3) returning code, name, description`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]})
    }
    catch(e){
        return next(e);
    }})

router.put('/:code', async (req, res, next) => {
    try{
        const {name, description} = req.body;
        const code = req.params.code;
        const results = await db.query(`UPDATE companies SET name = $1, description = $2 
        WHERE code =$3 returning code, name, description`, [name, description, code]);
        if(results.rows.length ===0) throw new ExpressError(`can't find company with code of ${code}`,404)
        return res.send(results.rows[0])
    }
    catch(e){
        return next(e);
    }})

router.delete('/:code', async (req, res, next) => {
    try{
        const code = req.params.code;
        const search = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
        if(search.rows.length ===0) throw new ExpressError(`can't find company with code of ${code}`,404)
        const results = await db.query(`DELETE from companies WHERE code =$1`, [code]);
        
        return res.send({msg: 'deleted'})
    }
    catch(e){
        return next(e);
    }})

module.exports = router;