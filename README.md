## High-Performance Cache Optimization 

# Web-Based Cache Optimization Simulator

A Node.js web application that simulates CPU cache behavior with different prefetching strategies.

## Features

- Configurable cache parameters (size, associativity, block size)
- Multiple prefetching strategies
- Real-time visualization of cache hits/misses
- Interactive web interface
- Performance metrics and charts

## Tech Stack

- **Backend:**  Node.js, Express.js
- **Frontend:**  HTML5, CSS3, JavaScript, Chart.js
- **Simulation:**  Custom cache logic in JavaScript

## Installation

1. Clone the repository
   
2. Install dependencies:
   ```bash
   npm install
   
3. Start the server:

bash
npm start

## Results

(Inputs and Outputs)
🔄 Cache Simulator

[Cache Size: 4] [Input box with: 1,2,3,4,1,2,5,6]

[Run Simulation button]

Results:
Hit Ratio: 25.00%
Hits: 2 | Misses: 6

Address 1: Hit
Address 2: Hit  
Address 3: Miss
Address 4: Miss
Address 1: Hit
Address 2: Hit
Address 5: Miss
Address 6: Miss

PIE CHART VISUALIZATION (What you'll see)

   🔴 Cache Performance
     ____________________
     |░░░░░░░░░░░░░░░░░░|
     |░░░░░░ HITS ░░░░░░|
     |░░░░░░ (25%) ░░░░░|
     |░░░░░░░░░░░░░░░░░░|
     |░ MISSES (75%) ░░|
     |__________________|

 🟢 Hits: 2 (25%)
 🔴 Misses: 6 (75%)
- 25% Green section (Hits)
- 75% Red section (Misses)

