let resultsChart = null;

async function runSimulation() {
    const cacheSize = parseInt(document.getElementById('cacheSize').value);
    const associativity = parseInt(document.getElementById('associativity').value);
    const blockSize = parseInt(document.getElementById('blockSize').value);
    const prefetchStrategy = document.getElementById('prefetchStrategy').value;
    const accessSequence = document.getElementById('accessSequence').value.split(',').map(addr => addr.trim());

    try {
        const response = await fetch('/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cacheSize,
                associativity,
                blockSize,
                prefetchStrategy,
                accessSequence
            })
        });

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error running simulation: ' + error.message);
    }
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // Display statistics
    const statsHtml = `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.hits}</div>
                <div>Hits</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.misses}</div>
                <div>Misses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.hitRatio.toFixed(1)}%</div>
                <div>Hit Ratio</div>
            </div>
        </div>
    `;
    resultsDiv.innerHTML = statsHtml;

    // Display individual results
    const detailsHtml = data.results.map(result => {
        let className = result.status.toLowerCase();
        let html = `<div class="result-item ${className}">Address ${result.address}: ${result.status}`;
        
        if (result.prefetch) {
            html += ` (Prefetched: ${result.prefetch.map(p => p.address).join(', ')})`;
        }
        
        html += '</div>';
        return html;
    }).join('');

    resultsDiv.innerHTML += `<h3>Access Details:</h3>${detailsHtml}`;

    // Update chart
    updateChart(data);
}

function updateChart(data) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    if (resultsChart) {
        resultsChart.destroy();
    }

    resultsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hits', 'Misses'],
            datasets: [{
                data: [data.hits, data.misses],
                backgroundColor: ['#28a745', '#dc3545'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Cache Performance Results'
                }
            }
        }
    });
}
