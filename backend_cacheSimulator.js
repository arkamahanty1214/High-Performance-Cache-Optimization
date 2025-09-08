class CacheSimulator {
    constructor(size, associativity, blockSize, prefetchStrategy = 'none') {
        this.cacheSize = size;
        this.associativity = associativity;
        this.blockSize = blockSize;
        this.prefetchStrategy = prefetchStrategy;
        
        this.cache = new Array(size).fill(null).map(() => ({
            valid: false,
            tag: null,
            data: null,
            lruCounter: 0
        }));
        
        this.hits = 0;
        this.misses = 0;
        this.prefetchHits = 0;
        this.currentLruCounter = 0;
    }

    accessMemory(address) {
        const blockOffset = address % this.blockSize;
        const index = Math.floor((address / this.blockSize)) % this.cacheSize;
        const tag = Math.floor(address / (this.blockSize * this.cacheSize));

        const cacheLine = this.cache[index];

        // Check for hit
        if (cacheLine.valid && cacheLine.tag === tag) {
            this.hits++;
            cacheLine.lruCounter = ++this.currentLruCounter;
            return { address, status: 'Hit', type: 'normal' };
        }

        // Handle miss
        this.misses++;
        cacheLine.valid = true;
        cacheLine.tag = tag;
        cacheLine.lruCounter = ++this.currentLruCounter;
        cacheLine.data = `Data for address ${address}`;

        // Apply prefetching strategy
        let prefetchResult = null;
        if (this.prefetchStrategy !== 'none') {
            prefetchResult = this.applyPrefetchStrategy(address);
        }

        return {
            address,
            status: 'Miss',
            type: 'normal',
            prefetch: prefetchResult
        };
    }

    applyPrefetchStrategy(address) {
        let prefetchedAddresses = [];
        
        switch(this.prefetchStrategy) {
            case 'next-line':
                prefetchedAddresses = [address + 1];
                break;
            case 'stride':
                prefetchedAddresses = [address + 4, address + 8];
                break;
            case 'aggressive':
                prefetchedAddresses = [address + 1, address + 2, address + 4];
                break;
        }

        // Simulate prefetching
        const results = [];
        for (const prefetchAddr of prefetchedAddresses) {
            const prefetchIndex = Math.floor((prefetchAddr / this.blockSize)) % this.cacheSize;
            const prefetchTag = Math.floor(prefetchAddr / (this.blockSize * this.cacheSize));
            
            if (!this.cache[prefetchIndex].valid || this.cache[prefetchIndex].tag !== prefetchTag) {
                this.cache[prefetchIndex] = {
                    valid: true,
                    tag: prefetchTag,
                    data: `Prefetched data for ${prefetchAddr}`,
                    lruCounter: ++this.currentLruCounter
                };
                results.push({ address: prefetchAddr, status: 'Prefetched' });
            }
        }

        return results;
    }

    getHitRatio() {
        const total = this.hits + this.misses;
        return total > 0 ? (this.hits / total) * 100 : 0;
    }

    getPrefetchStats() {
        return {
            prefetchStrategy: this.prefetchStrategy,
            totalAccesses: this.hits + this.misses,
            hits: this.hits,
            misses: this.misses,
            hitRatio: this.getHitRatio()
        };
    }
}

module.exports = CacheSimulator;
