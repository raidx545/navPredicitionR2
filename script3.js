// script.js - Complete JavaScript for Eagle Investment Platform

// ==================== COMMON FUNCTIONS ====================
/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }
}

/**
 * Highlight current page in navigation
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

// ==================== HOME PAGE FUNCTIONS ====================
/**
 * Initialize home page animations and interactions
 */
function initHomePage() {
    if (!document.querySelector('.hero')) return;
    
    // Button hover effects
    const actionButtons = document.querySelectorAll('.action-buttons button');
    actionButtons.forEach(button => {
        button.addEventListener('mouseover', function() {
            this.classList.add('animate__animated', 'animate__pulse');
        });
        button.addEventListener('mouseout', function() {
            this.classList.remove('animate__animated', 'animate__pulse');
        });
    });
}

// ==================== PREDICTION PAGE FUNCTIONS ====================
// Fund data with extended history for better predictions
const funds = {
    "SBI_BLUECHIP": {
        name: "SBI Bluechip Fund - Direct Growth",
        category: "Large Cap",
        risk: "Moderately High",
        history: [
            { date: '2024-01-01', nav: 85.12 },
            { date: '2024-02-01', nav: 88.45 },
            { date: '2024-03-01', nav: 92.10 },
            { date: '2024-04-01', nav: 95.75 },
            { date: '2024-05-01', nav: 98.20 },
            { date: '2024-06-01', nav: 101.50 },
            { date: '2024-07-01', nav: 103.75 },
            { date: '2024-08-01', nav: 107.30 },
            { date: '2024-09-01', nav: 110.45 },
            { date: '2024-10-01', nav: 112.90 },
            { date: '2024-11-01', nav: 115.25 },
            { date: '2024-12-01', nav: 118.75 },
            { date: '2025-01-01', nav: 120.50 },
            { date: '2025-02-01', nav: 122.30 },
            { date: '2025-03-01', nav: 125.10 },
            { date: '2025-04-01', nav: 127.85 },
            { date: '2025-05-01', nav: 130.20 }
        ],
        startDate: '2020-01-01',
        currentPrice: 130.20,
        expenseRatio: 0.65,
        rating: 4.5
    },
    "HDFC_GROWTH": {
        name: "HDFC Growth Fund - Direct Plan",
        category: "Multi Cap",
        risk: "High",
        history: [
            { date: '2024-01-01', nav: 150.00 },
            { date: '2024-02-01', nav: 148.50 },
            { date: '2024-03-01', nav: 152.75 },
            { date: '2024-04-01', nav: 155.20 },
            { date: '2024-05-01', nav: 153.80 },
            { date: '2024-06-01', nav: 157.45 },
            { date: '2024-07-01', nav: 160.10 },
            { date: '2024-08-01', nav: 162.30 },
            { date: '2024-09-01', nav: 165.75 },
            { date: '2024-10-01', nav: 163.20 },
            { date: '2024-11-01', nav: 168.45 },
            { date: '2024-12-01', nav: 170.80 },
            { date: '2025-01-01', nav: 172.50 },
            { date: '2025-02-01', nav: 175.25 },
            { date: '2025-03-01', nav: 177.90 },
            { date: '2025-04-01', nav: 180.40 },
            { date: '2025-05-01', nav: 182.75 }
        ],
        startDate: '2019-05-15',
        currentPrice: 182.75,
        expenseRatio: 0.75,
        rating: 4.2
    },
    "AXIS_LONGTERM": {
        name: "Axis Long Term Equity Fund - Direct",
        category: "ELSS",
        risk: "Moderate",
        history: [
            { date: '2024-01-01', nav: 200.00 },
            { date: '2024-02-01', nav: 195.50 },
            { date: '2024-03-01', nav: 198.75 },
            { date: '2024-04-01', nav: 202.10 },
            { date: '2024-05-01', nav: 199.80 },
            { date: '2024-06-01', nav: 203.45 },
            { date: '2024-07-01', nav: 205.90 },
            { date: '2024-08-01', nav: 208.30 },
            { date: '2024-09-01', nav: 210.75 },
            { date: '2024-10-01', nav: 212.20 },
            { date: '2024-11-01', nav: 215.45 },
            { date: '2024-12-01', nav: 218.80 },
            { date: '2025-01-01', nav: 220.50 },
            { date: '2025-02-01', nav: 222.25 },
            { date: '2025-03-01', nav: 224.90 },
            { date: '2025-04-01', nav: 227.40 },
            { date: '2025-05-01', nav: 230.20 }
        ],
        startDate: '2018-08-10',
        currentPrice: 230.20,
        expenseRatio: 0.60,
        rating: 4.3
    }
};

let navChart = null;
let sipChart = null;

/**
 * Initialize the prediction page functionality
 */
function initPredictionPage() {
    if (!document.getElementById('navChart')) return;
    
    initFundSelector();
    setupTimeRangeButtons();
    setupEventListeners();
    
    // Load first fund by default
    const firstFundKey = Object.keys(funds)[0];
    if (firstFundKey) {
        document.getElementById('fundSelector').value = firstFundKey;
        updateFundDisplay(firstFundKey, 'all');
    }
}

/**
 * Initialize the fund selector dropdown
 */
function initFundSelector() {
    const selector = document.getElementById('fundSelector');
    if (!selector) return;
    
    Object.keys(funds).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = funds[key].name;
        selector.appendChild(option);
    });
}

/**
 * Setup time range buttons
 */
function setupTimeRangeButtons() {
    const buttons = document.querySelectorAll('.time-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const fundKey = document.getElementById('fundSelector').value;
            if (fundKey) {
                updateFundDisplay(fundKey, this.dataset.range);
            }
        });
    });
}

/**
 * Setup event listeners for prediction page
 */
function setupEventListeners() {
    const fundSelector = document.getElementById('fundSelector');
    if (fundSelector) {
        fundSelector.addEventListener('change', function(e) {
            const fundKey = e.target.value;
            if (fundKey) {
                const activeRange = document.querySelector('.time-btn.active')?.dataset.range || 'all';
                updateFundDisplay(fundKey, activeRange);
            }
        });
    }
}

/**
 * Update all fund information displays
 */
async function updateFundDisplay(fundKey, range) {
    const fund = funds[fundKey];
    
    // Update basic info
    document.getElementById('outputStart').textContent = formatDate(fund.startDate);
    document.getElementById('outputPrice').textContent = `₹${fund.currentPrice.toFixed(2)}`;
    document.getElementById('outputRisk').textContent = fund.risk;
    
    // Calculate 1Y return
    const oneYearReturn = calculateAnnualReturn(fund);
    document.getElementById('outputReturn').textContent = `${oneYearReturn > 0 ? '+' : ''}${oneYearReturn.toFixed(2)}%`;
    
    // Generate prediction
    const prediction = await generateAdvancedPrediction(fund);
    
    // Update prediction display
    updatePredictionDisplay(prediction);
    
    // Update chart with filtered data based on range
    const filteredData = filterDataByRange(fund.history, range);
    updateNavChart(filteredData, fund.name);
}

/**
 * Filter historical data by time range
 */
function filterDataByRange(history, range) {
    const now = new Date();
    let cutoffDate = new Date(0); // Default to all time
    
    switch(range) {
        case '1m':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
        case '3m':
            cutoffDate.setMonth(now.getMonth() - 3);
            break;
        case '6m':
            cutoffDate.setMonth(now.getMonth() - 6);
            break;
        case '1y':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        // 'all' case falls through to default
    }
    
    return history.filter(item => {
        const itemDate = new Date(item.date);
        return range === 'all' || itemDate >= cutoffDate;
    });
}

/**
 * Calculate annual return percentage
 */
function calculateAnnualReturn(fund) {
    if (fund.history.length < 12) return 0;
    
    const oldest = fund.history[fund.history.length - 12].nav;
    const newest = fund.history[fund.history.length - 1].nav;
    return ((newest - oldest) / oldest) * 100;
}

/**
 * Generate advanced prediction with multiple factors
 */
async function generateAdvancedPrediction(fund) {
    const history = fund.history;
    const n = history.length;
    
    // Simple moving averages
    const sma3 = (history[n-1].nav + history[n-2].nav + history[n-3].nav) / 3;
    const sma6 = history.slice(-6).reduce((sum, item) => sum + item.nav, 0) / 6;
    
    // Momentum calculation (6-month)
    const momentum = (history[n-1].nav / history[n-6].nav - 1) * 100;
    
    // Volatility calculation (standard deviation of monthly returns)
    const returns = [];
    for (let i = 1; i < n; i++) {
        returns.push((history[i].nav / history[i-1].nav - 1) * 100);
    }
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - (returns.reduce((a,b) => a + b, 0) / returns.length), 2) / returns.length);
    
    // Simple prediction algorithm (replace with actual ML model)
    const predictedValue = history[n-1].nav * (1 + (momentum * 0.7 - volatility * 0.3) / 100);
    
    // Confidence calculation (0-100%)
    const confidence = Math.min(95, 70 + momentum - volatility);
    
    // Generate advice based on projected growth
    let advice, adviceClass;
    const projectedGrowth = (predictedValue / history[n-1].nav - 1) * 100;
    
    if (projectedGrowth > 5) {
        advice = "STRONG BUY";
        adviceClass = "strong-buy";
    } else if (projectedGrowth > 2) {
        advice = "BUY";
        adviceClass = "buy";
    } else if (projectedGrowth > -2) {
        advice = "HOLD";
        adviceClass = "hold";
    } else {
        advice = "SELL";
        adviceClass = "sell";
    }
    
    return {
        predictedValue,
        confidence,
        advice,
        adviceClass,
        factors: [
            `Momentum: ${momentum.toFixed(2)}%`,
            `Volatility: ${volatility.toFixed(2)}%`,
            `3-month average: ₹${sma3.toFixed(2)}`,
            `6-month average: ₹${sma6.toFixed(2)}`,
            `Expense Ratio: ${fund.expenseRatio}%`,
            `Fund Rating: ${fund.rating}/5`
        ]
    };
}

/**
 * Update the prediction display elements
 */
function updatePredictionDisplay(prediction) {
    // Update advice
    const adviceElement = document.getElementById('outputAdvice');
    if (adviceElement) {
        adviceElement.className = `advice-content ${prediction.adviceClass}`;
        adviceElement.innerHTML = `
            <div class="advice-icon">${getAdviceIcon(prediction.advice)}</div>
            <div class="advice-text">${prediction.advice}</div>
        `;
    }
    
    // Update predicted NAV
    const predictedNavElement = document.getElementById('predictedNav');
    if (predictedNavElement) {
        predictedNavElement.textContent = `₹${prediction.predictedValue.toFixed(2)}`;
    }
    
    // Update confidence
    const confidenceValueElement = document.getElementById('confidenceValue');
    const confidenceLevelElement = document.getElementById('confidenceLevel');
    if (confidenceValueElement && confidenceLevelElement) {
        confidenceValueElement.textContent = `${Math.round(prediction.confidence)}%`;
        confidenceLevelElement.style.width = `${prediction.confidence}%`;
    }
    
    // Update factors
    const factorsList = document.getElementById('predictionFactors');
    if (factorsList) {
        factorsList.innerHTML = prediction.factors.map(f => `<li>${f}</li>`).join('');
    }
    
    // Update insight
    const insightElement = document.getElementById('predictionInsight');
    if (insightElement) {
        insightElement.textContent = getInsightText(prediction);
    }
}

/**
 * Get appropriate icon for advice type
 */
function getAdviceIcon(advice) {
    switch(advice) {
        case "STRONG BUY": return "🚀";
        case "BUY": return "👍";
        case "HOLD": return "⏳";
        case "SELL": return "⚠️";
        default: return "💡";
    }
}

/**
 * Get insight text based on prediction
 */
function getInsightText(prediction) {
    if (prediction.advice === "STRONG BUY") {
        return "This fund shows strong positive momentum with acceptable volatility.";
    } else if (prediction.advice === "BUY") {
        return "This fund is trending upward and appears to be a good investment.";
    } else if (prediction.advice === "HOLD") {
        return "This fund is performing steadily. Consider holding your position.";
    } else {
        return "This fund is showing negative trends. Consider reducing exposure.";
    }
}

/**
 * Update or create the NAV chart
 */
function updateNavChart(data, fundName) {
    const ctx = document.getElementById('navChart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy previous chart if exists
    if (navChart) {
        navChart.destroy();
    }
    
    // Create new chart
    navChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.date),
            datasets: [{
                label: `NAV History - ${fundName}`,
                data: data.map(item => item.nav),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true,
                pointBackgroundColor: '#4CAF50',
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `NAV: ₹${context.parsed.y.toFixed(2)}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        tooltipFormat: 'dd MMM yyyy',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'NAV Value (₹)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// ==================== SIP CALCULATOR FUNCTIONS ====================
/**
 * Initialize the SIP calculator page
 */
function initSipCalculator() {
    if (!document.getElementById('sipChart')) return;
    
    setupSipCalculator();
}

/**
 * Setup SIP calculator event listeners
 */
function setupSipCalculator() {
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateSip);
    }
    
    // Calculate on page load with default values
    calculateSip();
}

/**
 * Calculate SIP returns and update display
 */
function calculateSip() {
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value) || 5000;
    const investmentPeriod = parseInt(document.getElementById('investmentPeriod').value) || 10;
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) || 12;
    
    const months = investmentPeriod * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    
    // Calculate future value of SIP
    const futureValue = monthlyInvestment * 
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
        (1 + monthlyRate);
    
    const totalInvestment = monthlyInvestment * months;
    const estimatedReturns = futureValue - totalInvestment;
    
    // Update results
    document.getElementById('totalInvestment').textContent = `₹${totalInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
    document.getElementById('estimatedReturns').textContent = `₹${estimatedReturns.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
    document.getElementById('totalValue').textContent = `₹${futureValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
    
    // Update chart
    updateSipChart(totalInvestment, estimatedReturns);
}

/**
 * Update or create the SIP chart
 */
function updateSipChart(totalInvestment, estimatedReturns) {
    const ctx = document.getElementById('sipChart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy previous chart if exists
    if (sipChart) {
        sipChart.destroy();
    }
    
    // Create new chart
    sipChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Investment', 'Estimated Returns'],
            datasets: [{
                data: [totalInvestment, estimatedReturns],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ₹${context.raw.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// ==================== UTILITY FUNCTIONS ====================
/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ==================== DOCUMENT READY ====================
/**
 * Initialize the appropriate page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    setActiveNavLink();
    
    // Initialize the appropriate page based on content
    if (document.querySelector('.hero')) {
        initHomePage();
    } else if (document.getElementById('navChart')) {
        initPredictionPage();
    } else if (document.getElementById('sipChart')) {
        initSipCalculator();
    }
});