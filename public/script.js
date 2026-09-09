window.addEventListener("load", async () => {
    await onConfig();
});

let clients = [];
let tables = [];
let reserves = [];
let selectedReserve = null;

async function onConfig() {
    await loadClientBase();
    await loadTables();
    await loadReserves();
    await getNumberOfClients();
}

async function loadClientBase(){
    const response = await fetch("/api/clients");
    clients = await response.json();
    showClients(clients);
}

function showClients(clients){
    const clientSelector = document.querySelector("#name");
    clientSelector.innerHTML = "<option value='' disabled selected>Client Name</option>";

    for(let i = 0; i < clients.length; i++){
        const newOption = document.createElement("option");
        newOption.value = clients[i].id;
        newOption.textContent = clients[i].firstName;
        clientSelector.appendChild(newOption);
    }
}

async function loadTables(){
    const response = await fetch("/api/tables");
    tables = await response.json();

    const tableSelector = document.querySelector("#tableNumber");
    tableSelector.innerHTML = "<option value='' disabled selected>Table</option>";

    for(let i = 0; i < tables.length; i++){
        if(tables[i].free === true){
            const newOption = document.createElement("option");
            newOption.value = tables[i].id;
            newOption.textContent = tables[i].id;
            tableSelector.appendChild(newOption);
        }
    }
}

async function loadReserves(){
    const response = await fetch("/api/reserves");
    reserves = await response.json();
}

class Reserve{
    constructor(client, table, date, time, people){
        this.client = client;
        this.table = table;
        this.date = date;
        this.time = time;
        this.people = people;
    }
}

document.querySelector("#new-reservation-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await reserveTable();
});

async function reserveTable(){
    const tableSelector = document.querySelector("#tableNumber");
    const clientSelector = document.querySelector("#name");
    const dateInput = document.querySelector("#date");
    const timeInput = document.querySelector("#time");
    const numberInput = document.querySelector("#peopleAmount");
    const message = document.querySelector("#reservationMessage");

    if(!clientSelector.value || !tableSelector.value || !dateInput.value || !timeInput.value || !numberInput.value){
        message.textContent = "Please fill the fields.";
        message.className = "error-message";
        return;
    }

    const newTable = tableSelector.value;
    const newClient = clientSelector.options[clientSelector.selectedIndex].textContent;
    const newDate = dateInput.value;
    const newTime = timeInput.value;
    const newNumber = numberInput.value;

    let newReserve = new Reserve(newClient, newTable, newDate, newTime, newNumber);
    const response = await fetch("/api/reserves", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newReserve)
    });

    const result = await response.json();
    if(!response.ok){
        message.textContent = result.error || "Reservation failed";
        message.className = "error-message";
        return;
    }

    message.textContent = "Reservation created.";
    message.className = "success-message";
    document.querySelector("#new-reservation-form").reset();
    await loadTables();
    await loadReserves();
    await getNumberOfClients();
}

document.querySelector("#search").addEventListener("click", async () => {
    await reservationSearch();
});

async function reservationSearch(){
    await loadReserves();
    const nameForSearch = document.querySelector("#nameSearch").value.trim().toLowerCase();
    const result = reserves.find((reserve) => reserve.client.toLowerCase() === nameForSearch);

    if(result){
        selectedReserve = result;
        let showInfo = `Table: ${result.table}<br>
        Date: ${result.date}<br>
        Time: ${result.time}<br>
        People: ${result.people}`;
        const info = document.querySelector("#searchInfo");
        info.style.display = "block";
        document.querySelector("#outputSearch").innerHTML = showInfo;
        document.querySelector("#removeReservation").disabled = false;
    }
    else{
        selectedReserve = null;
        alert("No results found");
        document.querySelector("#outputSearch").innerHTML = "No Results Found";
        document.querySelector("#removeReservation").disabled = true;
    }
}

document.querySelector("#removeReservation").addEventListener("click", async () => {
    await removeReservation();
});

async function removeReservation(){
    if(!selectedReserve){
        return;
    }

    const userConfirm = confirm("Are you sure?");
    if(!userConfirm){
        return;
    }

    const response = await fetch(`/api/reserves/${selectedReserve.id}`, {
        method: "DELETE"
    });

    if(response.ok){
        selectedReserve = null;
        const info = document.querySelector("#searchInfo");
        info.style.display = "none";
        await loadTables();
        await loadReserves();
        await getNumberOfClients();
    }
}

async function getNumberOfClients(){
    const response = await fetch("/api/revenue");
    const revenue = await response.json();
    document.querySelector("#customersAmount").innerHTML = revenue.people;
}
