let db;
// create a new db request for a "transactionsDB" database.
const request = indexedDB.open("transactionsDB", 1);

request.onupgradeneeded = function (event) {
    // create object store called "pending" for 'pending transaction'
    // and set autoIncrement to true
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    // thiiis thing here checks if the app is online
    // before proceeding to read from the db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Woah, okay, there was an error! " + event.target.errorCode);
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");

    // accesses pending object store
    const store = transaction.objectStore("pending");

    // adds record to store with add method.
    store.add(record);
}



function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    const store = transaction.objectStore("pending");




    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // if response was successful, open a transaction on the pending db
                    const transaction = db.transaction(["pending"], "readwrite");

                    // then access the pending object store
                    const store = transaction.objectStore("pending");

                    // and clear all the items in the store
                    store.clear();
                });
        }
    };
}

// window event listener for webpage to come back online so it can perform the get and post requests
window.addEventListener("online", checkDatabase);
