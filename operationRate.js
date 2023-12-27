import { loadData } from './dataManager.js';

const operationRateManager = {
    charts: {},

    loadOperationRateData: function(timeUnit) {
        loadData(`e_${timeUnit}_operation`)
            .then(operationData => {
                loadData(`e_${timeUnit}_capacity`)
                    .then(capacityData => {
                        const operation = parseFloat(operationData[`e_production_stacked`]);
                        const capacity = parseFloat(capacityData[`e_production_capacity`]);
                        const percentage = ((operation / capacity) * 100).toFixed(0);

                        this.updateDOMElements(operation, percentage, timeUnit);
                        this.updateChart(operation, capacity, timeUnit);
                    });
            })
            .catch(error => console.error('Error loading operation data:', error));
    },

    updateDOMElements: function(operation, percentage, timeUnit) {
        document.querySelector('.operation-result').textContent = operation + ' kW';
        document.querySelector('.operation-rate').textContent = percentage + '%';
    },

    updateChart: function(operation, capacity, timeUnit) {
        const canvasId = `eProductionChart${timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}`;
        const chartData = this.createChartData(operation, capacity);

        if (this.charts[canvasId]) {
            this.charts[canvasId].data.datasets[0].data = chartData;
            this.charts[canvasId].update();
        } else {
            this.createChart(canvasId, chartData);
        }
    },

    createChartData: function(operation, capacity) {
        return [operation, capacity - operation];
    },

    createChart: function(canvasId, chartData) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Operation', 'Remaining'],
                datasets: [{
                    label: 'Production',
                    data: chartData,
                    backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(211, 211, 211, 0.5)']
                }]
            },
            // options 설정에 따라 추가
        });
    }
};

export { operationRateManager };
