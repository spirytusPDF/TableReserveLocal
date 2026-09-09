const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "..", "data", "data.json");
const CLIENTS_API = "https://dummyjson.com/users";

function readData(){
    return fs.readFile(DATA_FILE, "utf-8").then(JSON.parse);
}

function writeData(data){
    return fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function getClients(){
    const response = await fetch(CLIENTS_API);
    if(!response.ok){
        throw new Error("Cannot load clients");
    }

    const clients = await response.json();
    return clients.users;
}

function getRevenue(reserves){
    let people = 0;
    for(let i = 0; i < reserves.length; i++){
        people += Number(reserves[i].people) || 0;
    }
    return people;
}

function findFreeTable(data, tableId){
    return data.tables.find((table) => table.id === Number(tableId) && table.free === true);
}

router.get("/api/tables", async (req, res, next) => {
    try{
        const data = await readData();
        res.json(data.tables);
    }
    catch(err){
        next(err);
    }
});

router.get("/api/reserves", async (req, res, next) => {
    try{
        const data = await readData();
        res.json(data.reserves);
    }
    catch(err){
        next(err);
    }
});

router.post("/api/reserves", async (req, res, next) => {
    try{
        const data = await readData();
        const table = findFreeTable(data, req.body.table);

        if(!table){
            res.status(400).json({error: "room is blocked"});
            return;
        }

        data.lastReserveId++;
        const newReserve = {
            id: data.lastReserveId,
            client: req.body.client,
            table: Number(req.body.table),
            date: req.body.date,
            time: req.body.time,
            people: Number(req.body.people)
        };

        data.reserves.push(newReserve);
        table.free = false;
        await writeData(data);
        res.status(201).json(newReserve);
    }
    catch(err){
        next(err);
    }
});

router.delete("/api/reserves/:id", async (req, res, next) => {
    try{
        const data = await readData();
        const reserveId = Number(req.params.id);
        const reserveIndex = data.reserves.findIndex((reserve) => reserve.id === reserveId);
+p
        if(reserveIndex === -1){
            res.sendStatus(404);
            return;
        }

        const deletedReserve = data.reserves.splice(reserveIndex, 1)[0];
        const table = data.tables.find((table) => table.id === Number(deletedReserve.table));
        if(table){
            table.free = true;
        }

        await writeData(data);
        res.json(deletedReserve);
    }
    catch(err){
        next(err);
    }
});

router.get("/api/revenue", async (req, res, next) => {
    try{
        const data = await readData();
        res.json({people: getRevenue(data.reserves)});
    }
    catch(err){
        next(err);
    }
});

router.get("/api/clients", async (req, res, next) => {
    try{
        const data = await readData();

        try{
            const clients = await getClients();
            res.json(clients);
        }
        catch(err){
            res.json(data.clients);
        }
    }
    catch(err){
        next(err);
    }
});

module.exports = router;
