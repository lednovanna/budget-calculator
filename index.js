class Entry {
    constructor(amount, category, date, type) {
        this.amount = amount;
        this.category = category;
        this.date = date;
        this.type = type; // "income" або "expense"
    }

    updateAmount(newAmount) {
        this.amount = newAmount;
    }

    updateCategory(newCategory) {
        this.category = newCategory;
    }
}

class FinanceManager {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem("financeEntries")) || [];; // Масив для збереження записів
    }

    addEntry(entry) {
        this.entries.push(entry);
        this.saveToLocalStorage();
    }

    calculateBalance() {
        let income = this.entries
            .filter(entry => entry.type === "income")
            .reduce((sum, entry) => sum + entry.amount, 0);

        let expenses = this.entries
            .filter(entry => entry.type === "expense")
            .reduce((sum, entry) => sum + entry.amount, 0);

        return income - expenses;
    }

    getEntriesByType(type) {
        return this.entries.filter(entry => entry.type === type);
    }

    getEntriesByCategory(category) {
        return this.entries.filter(entry => entry.category === category);
    }

     saveToLocalStorage() {
        localStorage.setItem("financeEntries", JSON.stringify(this.entries));
    }
}

let financeManager = new FinanceManager();

function addNewEntry() {
    let amount = parseFloat(document.getElementById("amountInput").value);
    let category = document.getElementById("categoryInput").value;
    let date = document.getElementById("dateInput").value;
    let type = document.getElementById("typeInput").value;

    // Проверка на корректность введенных данных
    if (isNaN(amount) || amount <= 0) {
        alert("Please, enter the correct amount!");
        return;
    }

    if (!category || !date) {
        alert("Please, fill all the fields");
        return;
    }

    if (type !== "income" && type !== "expense") {
        alert("Please, choose the right type!");
        return;
    }

    let entry = new Entry(amount, category, date, type);
    financeManager.addEntry(entry);
    clearInputFields(); // Очищаем поля после добавления
    updateUI();
}

function clearInputFields() {
    document.getElementById("amountInput").value = "";
    document.getElementById("dateInput").value = "";
    document.getElementById("categoryInput").selectedIndex = 0;
    document.getElementById("typeInput").selectedIndex = 0;
}

function updateUI() {
    // Обновляем баланс
    document.getElementById("balance").innerText = financeManager.calculateBalance();

    // Обновляем список записей
    let entriesList = document.getElementById("entriesList");
    entriesList.innerHTML = "";

    financeManager.entries.forEach((entry) => {
        let listItem = document.createElement("li");
        listItem.innerText = `${entry.date}: ${entry.category} - ${entry.amount} USD (${entry.type === "income" ? "Income" : "Expense"})`;
        entriesList.appendChild(listItem);
    });

    // Обновляем отчет
    updateReport();
}

function updateReport() {
    let reportContainer = document.getElementById("reportContainer");
    reportContainer.innerHTML = "";

    let expenseEntries = financeManager.entries.filter(entry => entry.type === "expense");

    if (expenseEntries.length === 0) {
        reportContainer.innerHTML = "<p>No expenses yet</p>";
        return;
    }

    // Считаем сумму затрат по категориям
    let categoryTotals = {};
    let totalExpenses = 0;

    expenseEntries.forEach(entry => {
        totalExpenses += entry.amount;
        categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
    });

    // Создаем график в виде полос
    for (let category in categoryTotals) {
        let percentage = ((categoryTotals[category] / totalExpenses) * 100).toFixed(1);

        let container = document.createElement("div");
        container.classList.add("report-bar-container");

        let label = document.createElement("div");
        label.classList.add("report-label");
        label.innerText = `${category}: ${categoryTotals[category]} USD (${percentage}%)`;

        let bar = document.createElement("div");
        bar.classList.add("report-bar");
        bar.style.width = percentage + "%";

        container.appendChild(label); // Название категории сверху
        container.appendChild(bar); // Полоска под названием

        reportContainer.appendChild(container);
    }
}

document.addEventListener("DOMContentLoaded", updateUI);