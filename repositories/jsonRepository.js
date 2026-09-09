const fs = require("fs/promises");
const path = require("path");

const DEFAULT_DATA_FILE = path.join(__dirname, "..", "data", "data.json");

function idsAreEqual(firstId, secondId){
    return String(firstId) === String(secondId);
}

function getNextId(items){
    if(items.length === 0){
        return 1;
    }

    return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

function getCounterKey(collectionName){
    const singularName = collectionName.endsWith("s")
        ? collectionName.slice(0, -1)
        : collectionName;
    return `last${singularName[0].toUpperCase()}${singularName.slice(1)}Id`;
}

class JsonRepository{
    constructor(collectionName, filePath = DEFAULT_DATA_FILE){
        this.collectionName = collectionName;
        this.filePath = filePath;
    }

    async readData(){
        const fileContent = await fs.readFile(this.filePath, "utf-8");
        return JSON.parse(fileContent);
    }

    async writeData(data){
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    }

    getCollection(data){
        const collection = data[this.collectionName];

        if(!Array.isArray(collection)){
            throw new Error(`Collection "${this.collectionName}" was not found`);
        }

        return collection;
    }

    async getAll(){
        const data = await this.readData();
        return this.getCollection(data);
    }

    async getById(id){
        const data = await this.readData();
        const collection = this.getCollection(data);
        return collection.find((item) => idsAreEqual(item.id, id)) || null;
    }

    async findById(id){
        return this.getById(id);
    }

    async create(item){
        const data = await this.readData();
        const collection = this.getCollection(data);
        const counterKey = getCounterKey(this.collectionName);
        const nextId = item.id ?? Math.max(Number(data[counterKey]) || 0, getNextId(collection));
        const newItem = {
            ...item,
            id: nextId
        };

        collection.push(newItem);
        if(Object.prototype.hasOwnProperty.call(data, counterKey)){
            data[counterKey] = Number(nextId);
        }

        await this.writeData(data);
        return newItem;
    }

    async update(id, updates){
        const data = await this.readData();
        const collection = this.getCollection(data);
        const itemIndex = collection.findIndex((item) => idsAreEqual(item.id, id));

        if(itemIndex === -1){
            return null;
        }

        const updatedItem = {
            ...collection[itemIndex],
            ...updates,
            id: collection[itemIndex].id
        };

        collection[itemIndex] = updatedItem;
        await this.writeData(data);
        return updatedItem;
    }

    async delete(id){
        const data = await this.readData();
        const collection = this.getCollection(data);
        const itemIndex = collection.findIndex((item) => idsAreEqual(item.id, id));

        if(itemIndex === -1){
            return null;
        }

        const deletedItem = collection.splice(itemIndex, 1)[0];
        await this.writeData(data);
        return deletedItem;
    }
}

module.exports = JsonRepository;
module.exports.JsonRepository = JsonRepository;
