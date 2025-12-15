// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Prediction Page Functionality
    if (document.querySelector('.prediction-container')) {
        // Mock Fund Data
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

        // Populate Fund Selector
        const fundSelector = document.getElementById('fundSelector');
        Object.entries(funds).forEach(([id, fund]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${fund.name} (${id})`;
            fundSelector.appendChild(option);
        });

        // Event Listeners
        fundSelector.addEventListener('change', updateChartData);
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateChartData();
            });
        });

        // Update Chart Data
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

        // Update Prediction Details
        function updatePredictionDetails(fund, data) {
            // Advanced Prediction Algorithm (Hybrid Model)
            const prediction = advancedPrediction(data);
            
            // Update UI Elements
            document.getElementById('outputStart').textContent = new Date(fund.startDate).toLocaleDateString();
            document.getElementById('outputPrice').textContent = `₹${fund.currentNAV.toFixed(2)}`;
            document.getElementById('outputReturn').textContent = fund.returns;
            document.getElementById('outputRisk').textContent = fund.risk;
            document.getElementById('confidenceValue').textContent = `${prediction.confidence}%`;
            document.getElementById('confidenceLevel').style.width = `${prediction.confidence}%`;

            // Update Recommendation
            const adviceCard = document.getElementById('outputAdvice');
            adviceCard.className = 'advice-content ' + prediction.recommendation;
            adviceCard.innerHTML = `
                <div class="advice-icon">${prediction.icon}</div>
                <div class="advice-text">${prediction.text}</div>
            `;
            
            // Animate Elements
            animateElements(['#predictedNav', '#confidenceLevel', '#outputAdvice']);
        }

    }

    // SIP Calculator Functionality - MOVED OUTSIDE prediction-container check
    if (document.getElementById('calculateBtn')) {
        const sipCtx = document.getElementById('sipChart');
        if (!sipCtx) {
            console.error('sipChart canvas not found');
            return;
        }

        const sipChart = new Chart(sipCtx, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'SIP Growth Projection',
                        font: { size: 16 }
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'Time Period' },
                        grid: { display: false }
                    },
                    y: { 
                        title: { display: true, text: 'Portfolio Value (₹)' },
                        grid: { color: '#e2e8f0' },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });

        document.getElementById('calculateBtn').addEventListener('click', () => {
            calculateSIP(sipChart);
        });

        // Initial calculation on page load
        calculateSIP(sipChart);

        function calculateSIP(chart) {
            const monthly = parseFloat(document.getElementById('monthlyInvestment').value);
            const years = parseInt(document.getElementById('investmentPeriod').value);
            const annualReturn = parseFloat(document.getElementById('expectedReturn').value);

            if (isNaN(monthly) || isNaN(years) || isNaN(annualReturn) || monthly <= 0 || years <= 0 || annualReturn <= 0) {
                alert('Please enter valid positive numbers for all inputs.');
                return;
            }

            const months = years * 12;
            const monthlyRate = annualReturn / 100 / 12;
            const futureValue = calculateFutureValue(monthly, months, monthlyRate);

            // Update Results
            document.getElementById('totalInvestment').textContent = `₹${(monthly * months).toLocaleString('en-IN')}`;
            document.getElementById('estimatedReturns').textContent = `₹${Math.round(futureValue - monthly * months).toLocaleString('en-IN')}`;
            document.getElementById('totalValue').textContent = `₹${Math.round(futureValue).toLocaleString('en-IN')}`;

            // Update Chart
            updateSipChart(chart, monthly, months, monthlyRate);
        }
    }
});

// Helper Functions
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

// Advanced Prediction Model - Hybrid Approach
function advancedPrediction(data) {
    const n = data.length;
    if (n < 10) {
        return basicPrediction(data);
    }

    const values = data.map(d => d.value);
    
    // 1. Calculate multiple technical indicators
    const ema = calculateEMA(values, 12);
    const momentum = calculateMomentum(values, 14);
    const rsi = calculateRSI(values, 14);
    const volatility = calculateVolatility(values);
    
    // 2. Polynomial Regression (degree 2) for non-linear trends
    const polyPrediction = polynomialRegression(values, 2);
    
    // 3. Weighted Moving Average prediction
    const wmaPrediction = calculateWMA(values, 10);
    
    // 4. Linear Regression for baseline
    const linearPrediction = linearRegression(values);
    
    // 5. Combine predictions with weighted average
    const predictedValue = (
        polyPrediction * 0.4 +      // 40% weight to polynomial
        wmaPrediction * 0.3 +        // 30% weight to WMA
        ema * 0.2 +                  // 20% weight to EMA
        linearPrediction * 0.1       // 10% weight to linear
    );
    
    // Calculate confidence based on multiple factors
    const trendStrength = Math.abs(momentum) / values[values.length - 1];
    const volatilityScore = 1 - Math.min(volatility / 50, 1);
    const dataQuality = Math.min(n / 60, 1);
    const confidence = Math.round(
        (trendStrength * 30 + volatilityScore * 40 + dataQuality * 30)
    );
    
    // Calculate percentage change
    const currentValue = values[values.length - 1];
    const percentChange = ((predictedValue - currentValue) / currentValue) * 100;
    
    // Generate recommendation based on multiple signals
    const recommendation = getAdvancedRecommendation(percentChange, rsi, momentum, volatility);
    
    return {
        value: predictedValue,
        confidence: Math.max(65, Math.min(95, confidence)),
        recommendation: recommendation.type,
        icon: recommendation.icon,
        text: recommendation.text,
        percentChange: percentChange.toFixed(2),
        rsi: rsi.toFixed(0),
        momentum: momentum.toFixed(2)
    };
}

// Calculate Exponential Moving Average
function calculateEMA(values, period) {
    const k = 2 / (period + 1);
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
        ema = values[i] * k + ema * (1 - k);
    }
    // Predict next value
    const recentChange = values[values.length - 1] - values[values.length - 2];
    return ema + (recentChange * k);
}

// Calculate Relative Strength Index
function calculateRSI(values, period) {
    if (values.length < period + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = values.length - period; i < values.length; i++) {
        const change = values[i] - values[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// Calculate Momentum
function calculateMomentum(values, period) {
    const n = values.length;
    if (n < period) return 0;
    return values[n - 1] - values[n - period];
}

// Calculate Volatility (Standard Deviation)
function calculateVolatility(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    return Math.sqrt(variance);
}

// Weighted Moving Average
function calculateWMA(values, period) {
    const n = values.length;
    const start = Math.max(0, n - period);
    let weightedSum = 0;
    let weightTotal = 0;
    
    for (let i = start; i < n; i++) {
        const weight = i - start + 1;
        weightedSum += values[i] * weight;
        weightTotal += weight;
    }
    
    const wma = weightedSum / weightTotal;
    // Predict next value based on recent trend
    const recentTrend = (values[n - 1] - values[n - 2]) * 1.5;
    return wma + recentTrend;
}

// Polynomial Regression (degree 2)
function polynomialRegression(values, degree = 2) {
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    
    // Simple quadratic fit for degree 2
    let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumXY = 0, sumX2Y = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumX2 += i * i;
        sumX3 += i * i * i;
        sumX4 += i * i * i * i;
        sumXY += i * values[i];
        sumX2Y += i * i * values[i];
    }
    
    // Solve for a, b, c in y = a + bx + cx^2
    const denominator = (n * sumX2 * sumX4) + (2 * sumX * sumX2 * sumX3) - 
                       (sumX2 * sumX2 * sumX2) - (n * sumX3 * sumX3) - (sumX * sumX * sumX4);
    
    if (Math.abs(denominator) < 1e-10) {
        return linearRegression(values);
    }
    
    const a = ((sumY * sumX2 * sumX4) + (sumX * sumX3 * sumX2Y) + (sumX2 * sumXY * sumX3) - 
               (sumX2 * sumX2 * sumX2Y) - (sumY * sumX3 * sumX3) - (sumX * sumXY * sumX4)) / denominator;
    
    const b = ((n * sumXY * sumX4) + (sumX * sumX2 * sumX2Y) + (sumX2 * sumY * sumX3) - 
               (sumX2 * sumXY * sumX2) - (n * sumX2Y * sumX3) - (sumX * sumY * sumX4)) / denominator;
    
    const c = ((n * sumX2 * sumX2Y) + (sumX * sumXY * sumX3) + (sumX2 * sumY * sumX2) - 
               (sumX2 * sumX2 * sumY) - (n * sumX3 * sumXY) - (sumX * sumX * sumX2Y)) / denominator;
    
    // Predict next value
    const nextX = n;
    return a + b * nextX + c * nextX * nextX;
}

// Simple Linear Regression
function linearRegression(values) {
    const n = values.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = values.reduce((a, b) => a + b, 0);
    const xySum = values.reduce((sum, val, i) => sum + i * val, 0);
    const xxSum = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    return slope * n + intercept;
}

// Basic prediction for small datasets
function basicPrediction(data) {
    const values = data.map(d => d.value);
    const n = values.length;
    const currentValue = values[n - 1];
    const previousValue = values[n - 2] || currentValue;
    const change = currentValue - previousValue;
    
    return {
        value: currentValue + change,
        confidence: 70,
        recommendation: change > 0 ? 'buy' : 'hold',
        icon: change > 0 ? '📈' : '📊',
        text: change > 0 ? 'Positive Momentum' : 'Neutral Position',
        percentChange: ((change / currentValue) * 100).toFixed(2)
    };
}

// Advanced recommendation engine
function getAdvancedRecommendation(percentChange, rsi, momentum, volatility) {
    // Strong Buy conditions
    if (percentChange > 2 && rsi < 70 && momentum > 0) {
        return {
            type: 'strong-buy',
            icon: '🚀',
            text: 'Strong Buy - High growth potential with positive momentum'
        };
    }
    
    // Buy conditions
    if (percentChange > 0.5 && rsi < 65) {
        return {
            type: 'buy',
            icon: '📈',
            text: 'Buy - Upward trend with good entry point'
        };
    }
    
    // Sell conditions
    if (percentChange < -2 || (rsi > 75 && momentum < 0)) {
        return {
            type: 'sell',
            icon: '⚠️',
            text: 'Consider Selling - Downward trend or overbought conditions'
        };
    }
    
    // Hold with caution
    if (volatility > 30 || Math.abs(percentChange) < 0.5) {
        return {
            type: 'hold',
            icon: '📊',
            text: 'Hold Position - Market consolidation or high volatility'
        };
    }
    
    // Default hold
    return {
        type: 'hold',
        icon: '💼',
        text: 'Hold Position - Stable market conditions'
    };
}

function getRecommendation(slope) {
    if (slope > 0.5) return 'strong-buy';
    if (slope > 0.2) return 'buy';
    if (slope < -0.5) return 'sell';
    return 'hold';
}

function calculateFutureValue(monthly, months, rate) {
    if (rate === 0) return monthly * months;
    return monthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
}

function updateSipChart(chart, monthly, months, rate) {
    const labels = [];
    const investmentData = [];
    const valueData = [];
    
    for (let i = 1; i <= months; i++) {
        // Calculate future value at this point
        const fv = rate === 0 ? monthly * i : monthly * ((Math.pow(1 + rate, i) - 1) / rate) * (1 + rate);
        valueData.push(Math.round(fv));
        investmentData.push(monthly * i);
        
        // Label every 12 months (yearly)
        if (i % 12 === 0) {
            labels.push(`Year ${i / 12}`);
        } else if (months <= 24) {
            // For shorter periods, show monthly labels
            labels.push(`M${i}`);
        } else {
            labels.push('');
        }
    }

    chart.data.labels = labels;
    chart.data.datasets = [
        {
            label: 'Investment Amount',
            data: investmentData,
            borderColor: '#94a3b8',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            tension: 0,
            fill: true,
            pointRadius: 0,
            borderWidth: 2
        },
        {
            label: 'Portfolio Value',
            data: valueData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 3
        }
    ];
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