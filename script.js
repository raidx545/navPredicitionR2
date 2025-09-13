document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    if (document.querySelector('.prediction-container')) {

        const funds = {
            'EQ-1001': {
                name: 'Equity Growth Fund',
                startDate: '2018-03-15',
                currentNAV: 156.43,
                returns: '18.6%',
                risk: 'High',
                history: generateMockHistory(156, 60)
            },
            'DEBT-2005': {
                name: 'Debt Advantage Fund',
                startDate: '2020-07-01',
                currentNAV: 124.89,
                returns: '9.2%',
                risk: 'Low',
                history: generateMockHistory(124, 60, 0.15)
            }
        };

        // Chart Initialization
        const ctx = document.getElementById('navChart').getContext('2d');
        let navChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: chartOptions('NAV Value History')
        });


        const fundSelector = document.getElementById('fundSelector');
        Object.entries(funds).forEach(([id, fund]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${fund.name} (${id})`;
            fundSelector.appendChild(option);
        });

        fundSelector.addEventListener('change', updateChartData);
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateChartData();
            });
        });

        function updateChartData() {
            const fundId = fundSelector.value;
            const range = document.querySelector('.time-btn.active').dataset.range;
            if (!fundId) return;

            const fund = funds[fundId];
            const filteredData = filterDataByRange(fund.history, range);
            
            navChart.data.labels = filteredData.map(d => d.date);
            navChart.data.datasets = [{
                label: 'NAV Value',
                data: filteredData.map(d => d.value),
                borderColor: '#2563eb',
                tension: 0.4,
                fill: false
            }];
            
            navChart.update();
            updatePredictionDetails(fund, filteredData);
        }

        function updatePredictionDetails(fund, data) {
            const prediction = linearRegressionPrediction(data);
            
            document.getElementById('outputStart').textContent = new Date(fund.startDate).toLocaleDateString();
            document.getElementById('outputPrice').textContent = `₹${fund.currentNAV.toFixed(2)}`;
            document.getElementById('outputReturn').textContent = fund.returns;
            document.getElementById('outputRisk').textContent = fund.risk;
            document.getElementById('predictedNav').textContent = `₹${prediction.value.toFixed(2)}`;
            document.getElementById('confidenceValue').textContent = `${prediction.confidence}%`;
            document.getElementById('confidenceLevel').style.width = `${prediction.confidence}%`;

            const adviceCard = document.getElementById('outputAdvice');
            adviceCard.className = 'advice-content ' + prediction.recommendation;
            adviceCard.innerHTML = `
                <div class="advice-icon">${prediction.icon}</div>
                <div class="advice-text">${prediction.text}</div>
            `;
            

            animateElements(['#predictedNav', '#confidenceLevel', '#outputAdvice']);
        }


        if (document.getElementById('calculateBtn')) {
            const sipCtx = document.getElementById('sipChart').getContext('2d');
            let sipChart = new Chart(sipCtx, {
                type: 'line',
                data: { labels: [], datasets: [] },
                options: chartOptions('Growth Projection')
            });

            document.getElementById('calculateBtn').addEventListener('click', calculateSIP);

            function calculateSIP() {
                const monthly = parseFloat(document.getElementById('monthlyInvestment').value);
                const years = parseInt(document.getElementById('investmentPeriod').value);
                const annualReturn = parseFloat(document.getElementById('expectedReturn').value);

                const months = years * 12;
                const monthlyRate = annualReturn / 100 / 12;
                const futureValue = calculateFutureValue(monthly, months, monthlyRate);

                document.getElementById('totalInvestment').textContent = `₹${(monthly * months).toLocaleString()}`;
                document.getElementById('estimatedReturns').textContent = `₹${(futureValue - monthly * months).toLocaleString()}`;
                document.getElementById('totalValue').textContent = `₹${futureValue.toLocaleString()}`;

                updateSipChart(sipChart, monthly, months, monthlyRate);
                animateElements(['.calculator-results']);
            }
        }
    }
});

function generateMockHistory(baseValue, months, volatility = 0.3) {
    return Array.from({ length: months }, (_, i) => ({
        date: new Date(Date.now() - (months - i) * 2592000000).toISOString().slice(0, 10),
        value: baseValue * (1 + (Math.random() * volatility - volatility/2))
    }));
}

function filterDataByRange(data, range) {
    const now = new Date();
    const ranges = {
        '1m': 1, '3m': 3, '6m': 6, '1y': 12, 'all': Infinity
    };
    const limit = ranges[range] || Infinity;
    return data.slice(-limit);
}

function linearRegressionPrediction(data) {
    const n = data.length;
    const xSum = data.reduce((sum, _, i) => sum + i, 0);
    const ySum = data.reduce((sum, d) => sum + d.value, 0);
    const xySum = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const xxSum = data.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    const nextValue = slope * n + intercept;
    const confidence = Math.min(95, Math.max(60, Math.abs(slope) * 100));
    
    return {
        value: nextValue,
        confidence: confidence.toFixed(0),
        recommendation: getRecommendation(slope),
        icon: slope > 0.5 ? '🚀' : slope < -0.5 ? '⚠️' : '📊',
        text: slope > 0.5 ? 'Strong Buy Recommendation' : 
              slope < -0.5 ? 'Consider Selling' : 'Hold Position'
    };
}

function getRecommendation(slope) {
    if (slope > 0.5) return 'strong-buy';
    if (slope > 0.2) return 'buy';
    if (slope < -0.5) return 'sell';
    return 'hold';
}

function calculateFutureValue(monthly, months, rate) {
    return monthly * ((Math.pow(1 + rate, months) - 1) / rate); // Removed (1 + rate)
}

function updateSipChart(chart, monthly, months, rate) {
    const labels = Array.from({ length: months }, (_, i) => `Month ${i + 1}`);
    const data = Array.from({ length: months }, (_, i) => {
        return monthly * ((Math.pow(1 + rate, i + 1) - 1) / rate); // Removed (1 + rate)
    });

    chart.data.labels = labels;
    chart.data.datasets = [{
        label: 'Portfolio Value',
        data: data,
        borderColor: '#10b981',
        tension: 0.4,
        fill: true
    }];
    chart.update();
}

function chartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: title, font: { size: 16 } }
        },
        scales: {
            x: { grid: { display: false }},
            y: { grid: { color: '#e2e8f0' }}
        }
    };
}

function animateElements(selectors) {
    selectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('animate__animated', 'animate__fadeIn');
            setTimeout(() => el.classList.remove('animate__animated', 'animate__fadeIn'), 1000);
        }
    });
}