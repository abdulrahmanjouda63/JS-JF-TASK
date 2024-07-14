class App {
    constructor() {
        this.customers = [];
        this.transactions = [];
        this.filteredTransactions = [];
        this.chart = null;
        this.init();
    }

    async fetchData() {
        try {
            const response = await fetch('./data/data.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            this.customers = data.customers;
            this.transactions = data.transactions;
            this.filteredTransactions = data.transactions;
            this.renderTable();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    filterTransactions(nameFilter, amountFilter) {
        this.filteredTransactions = this.transactions.filter(transaction => {
            const customer = this.customers.find(c => c.id === transaction.customer_id);
            if (!customer) return false;
            const matchesName = customer.name.toLowerCase().includes(nameFilter.toLowerCase());
            const amountFilterValue = parseFloat(amountFilter);
            const matchesAmount = isNaN(amountFilterValue) || transaction.amount === amountFilterValue;
            return matchesName && matchesAmount;
        });
        this.renderTable();
    }

    renderTable() {
        const tbody = document.querySelector('#customerTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        this.filteredTransactions.forEach(transaction => {
            const customer = this.customers.find(c => c.id === transaction.customer_id);
            if (!customer) return;
            const row = document.createElement('tr');
            row.classList.add('animate__animated', 'animate__fadeIn');
            row.innerHTML = `
                <td class="customer-name" data-customer-id="${customer.id}">${customer.name}</td>
                <td>${transaction.date}</td>
                <td>${transaction.amount}</td>
            `;
            const customerNameElement = row.querySelector('.customer-name');
            if (customerNameElement) {
                customerNameElement.addEventListener('click', () => this.showCustomerTransactions(customer.id));
            }
            tbody.appendChild(row);
        });

        const messageElement = document.getElementById('funMessage');
        if (messageElement) {
            if (this.filteredTransactions.length > 5) {
                messageElement.textContent = 'Wow! So many transactions!';
            } else if (this.filteredTransactions.length > 0) {
                messageElement.textContent = 'Keep going! You\'re doing great!';
            } else {
                messageElement.textContent = 'No transactions found.';
            }
        }
    }

    showCustomerTransactions(customerId) {
        const customerTransactions = this.transactions.filter(transaction => transaction.customer_id === customerId);
        const transactionsByDate = customerTransactions.reduce((acc, transaction) => {
            const date = transaction.date;
            if (!acc[date]) acc[date] = 0;
            acc[date] += transaction.amount;
            return acc;
        }, {});

        const labels = Object.keys(transactionsByDate);
        const data = Object.values(transactionsByDate);

        if (this.chart) this.chart.destroy();

        const ctxElement = document.getElementById('transactionChart');
        if (!ctxElement) return;
        const ctx = ctxElement.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Transaction Amount',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { enabled: true }
                }
            }
        });

        const totalAmount = customerTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        const totalTransactions = customerTransactions.length;

        const totalAmountElement = document.getElementById('totalAmount');
        if (totalAmountElement) {
            totalAmountElement.textContent = `Total Amount: ${totalAmount}`;
        }

        const totalTransactionsElement = document.getElementById('totalTransactions');
        if (totalTransactionsElement) {
            totalTransactionsElement.textContent = `Total Transactions: ${totalTransactions}`;
        }

        const modalElement = document.getElementById('transactionModal');
        if (modalElement) {
            modalElement.style.display = 'block';
        }

        const closeElement = document.querySelector('.close');
        if (closeElement) {
            closeElement.onclick = () => {
                if (modalElement) {
                    modalElement.style.display = 'none';
                }
            };
        }

        window.onclick = (event) => {
            if (event.target === modalElement) {
                if (modalElement) {
                    modalElement.style.display = 'none';
                }
            }
        };
    }

   init() {
        document.getElementById('searchName').addEventListener('input', (e) => {
            this.filterTransactions(e.target.value, document.getElementById('searchAmount').value);
        });
        document.getElementById('searchAmount').addEventListener('input', (e) => {
            this.filterTransactions(document.getElementById('searchName').value, e.target.value);
        });
        this.fetchData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
