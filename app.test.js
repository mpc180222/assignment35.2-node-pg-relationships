process.env.NODE_ENV = "test";


const request = require("supertest");
const app = require("./app");
const db = require("./db");

let testCompany;
let testInvoice;

beforeEach(async function(){
    let testCompanyQuery = await db.query(`
    INSERT INTO companies (code, name, description)
VALUES ('apple', 'Apple Computer', 'Maker of OSX.') RETURNING code, name, description `)  
    let testInvQuery = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('apple', 100, false, null) RETURNING comp_Code, amt, paid, paid_date`)
    testCompany = testCompanyQuery.rows[0];
    testInvoice = testInvQuery.rows[0];

})

afterEach(async function(){
    await db.query("DELETE FROM companies");   
    await db.query("DELETE FROM invoices");  

})

afterAll(async function(){
    await db.end();
})


//APPEARS TO BE A GLITCH WITH THE JEST RESULT.
describe("get /invoices", () => {
    test("get all invoices", async () => {
        let inv = await db.query(`SELECT comp_Code, id, amt, add_date FROM invoices where comp_Code = 'apple'`);

        let res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({"invoices":[{"id": expect.any(Number), "comp_code": "apple", "amt": 100,
        "paid": false, "add_date": expect.any(String), "paid_date": null}]});
       
    })
})

describe("get /invoices/", () => {
    test("get invoice by id", async () => {
        let inv = await db.query(`SELECT comp_Code, id, amt, add_date FROM invoices where comp_Code = 'apple'`);
        let res = await request(app).get(`/invoices/${inv.rows[0].id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: {"id": expect.any(Number), "amt": 100, "paid": false, "add_date": expect.any(String),
        "paid_date": null, "company": {"code": "apple", "name": "Apple Computer", "description": "Maker of OSX."}}});

        
    })
})

describe("post /invoices", () => {
    test("adds a new invoice", async () => {
        let res = await request(app).post("/invoices").send({amt: "500", comp_code:"apple"});
        expect(res.statusCode).toBe(201);
        // expect(res.body).toEqual({invoice: expect.any(Object)});
        expect(res.body).toEqual({"invoice":{"comp_code": "apple", "amt": 500,
        "paid": false, "add_date": expect.any(String), "paid_date": null}});
    })})

describe("put /invoices", () => {
    test("edits an invoice", async () => {
        let inv = await db.query(`SELECT comp_Code, id, amt, add_date FROM invoices where comp_Code = 'apple'`);
        let res = await request(app).put(`/invoices/${inv.rows[0].id}`).send({amt: "9999"});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({"comp_code": "apple", "amt": 9999,
        "paid": false, "add_date": expect.any(String), "paid_date": null});
        })})

describe("delete /invoices", () => {
    test("delete an invoice", async () => {
        let inv = await db.query(`SELECT comp_Code, id, amt, add_date FROM invoices where comp_Code = 'apple'`);
        let res = await request(app).delete(`/invoices/${inv.rows[0].id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: "deleted"});
        })})

        describe("get /companies", () => {
            test("get all companies", async () => {
               let res = await request(app).get("/companies");
                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual({"companies":[{"code":"apple","name":"Apple Computer","description":"Maker of OSX."}]});
            })
        })
        
        describe("get /companies/code", () => {
            test("get company by code", async () => {
               let res = await request(app).get("/companies/apple");
                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual({"company":{"code":"apple","name":"Apple Computer","description":"Maker of OSX.","invoices":[expect.any(Number)]}});
            })
        })
        
        describe("post /companies", () => {
            test("adds a new company", async () => {
               let res = await request(app).post("/companies").send({code: "ibm", name: "IBM", description: "Big blue"});
                expect(res.statusCode).toBe(201);
                expect(res.body).toEqual({company: {code: "ibm", name: "IBM", description: "Big blue"}});
            })})
        
        describe("put /companies", () => {
            test("edits a company", async () => {
                let res = await request(app).put("/companies/apple").send({name: "apple-edit", description: "new apple"});
                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual({code: "apple", name: "apple-edit", description: "new apple"});
                })})
        
        describe("delete /companies", () => {
            test("delete a company", async () => {
                let res = await request(app).delete("/companies/apple");
                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual({msg: "deleted"});
                })})
