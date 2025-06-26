#include <iostream>
#include <vector>
#include <deque>
#include <algorithm>
#include <iomanip>
#include <stdexcept>

class CacheUnit {
private:
    struct CacheLine {
        int tag;
        bool valid;
        int last_used;
    };

    std::vector<CacheLine> lines;
    int access_clock;
    const int size;
    int misses;
    int hits;

public:
    explicit CacheUnit(int cache_size) : size(cache_size), access_clock(0), misses(0), hits(0) {
        if(size <= 0) throw std::invalid_argument("Cache size must be positive");
        lines.resize(size, {-1, false, 0});
    }

    bool access(int address) {
        if(address < 0) return false;
        
        access_clock++;
        const int tag = address % size;
        
        auto it = std::find_if(lines.begin(), lines.end(), 
            [tag](const CacheLine& line) { 
                return line.valid && line.tag == tag; 
            });

        if (it != lines.end()) {
            it->last_used = access_clock;
            hits++;
            return true;
        }

        auto victim = std::min_element(lines.begin(), lines.end(),
            [](const CacheLine& a, const CacheLine& b) {
                return a.last_used < b.last_used;
            });

        victim->tag = tag;
        victim->valid = true;
        victim->last_used = access_clock;
        misses++;
        return false;
    }

    void print_stats(const std::string& name) const {
        const int total = hits + misses;
        const double miss_rate = (total > 0) ? (misses * 100.0) / total : 0.0;
        
        std::cout << "\n" << name << " Cache:\n"
                  << "\nHits: " << hits
                  << "\nMisses: " << misses
                  << "\nMiss Rate: " << std::fixed << std::setprecision(2) 
                  << miss_rate << "%\n";
    }

    [[nodiscard]] int get_misses() const { return misses; }
};

class AdaptivePrefetcher {
private:
    std::deque<int> access_history;
    int prefetch_distance;
    const int history_size;

    std::pair<bool, int> detect_stride() const {
        if (access_history.size() < 3) return {false, 0};

        const int stride1 = access_history[1] - access_history[0];
        
        for (size_t i = 2; i < access_history.size(); i++) {
            if (access_history[i] - access_history[i-1] != stride1) {
                return {false, 0};
            }
        }
        return {true, stride1};
    }

public:
    explicit AdaptivePrefetcher(int hist_size = 5) 
        : history_size(hist_size > 0 ? hist_size : 5), prefetch_distance(1) {}

    void record_access(int address) {
        access_history.push_back(address);
        if (access_history.size() > history_size) {
            access_history.pop_front();
        }

        auto detection = detect_stride();
        prefetch_distance = detection.first ? std::abs(detection.second) : 1;
    }

    [[nodiscard]] std::vector<int> get_prefetch_addresses(int current_address) const {
        std::vector<int> addresses;
        addresses.reserve(prefetch_distance);
        for (int i = 1; i <= prefetch_distance; i++) {
            addresses.push_back(current_address + i);
        }
        return addresses;
    }
};

void print_miss_rate_graph(int gpu_misses, int cpu_misses, int total_accesses) {
    if(total_accesses <= 0) return;
    std::cout<<"\n";
    std::cout << "Miss Rate Comparison:\n";
    std::cout<<"\n";
    auto draw_bar = [](int value, int max) {
        const int length = std::min(50, (value * 50) / max);
        std::cout << "|" << std::string(length, '#')  
                  << " " << value << "\n";
    };

    std::cout << "GPU Cache:";
    draw_bar(gpu_misses, total_accesses);
    
    std::cout << "CPU Cache:";
    draw_bar(cpu_misses, total_accesses);
}

int main() {
    try {
        constexpr int CACHE_SIZE = 16;
        constexpr int NUM_ACCESSES = 1000;
        constexpr int GPU_WORKLOAD_STRIDE = 3;

        CacheUnit gpu_cache(CACHE_SIZE);
        CacheUnit cpu_cache(CACHE_SIZE);
        AdaptivePrefetcher prefetcher;

        for (int i = 0; i < NUM_ACCESSES; i++) {
            const int address = i * GPU_WORKLOAD_STRIDE;
            
            if (!gpu_cache.access(address)) {
                prefetcher.record_access(address);
                for (int prefetch_addr : prefetcher.get_prefetch_addresses(address)) {
                    cpu_cache.access(prefetch_addr);
                }
            }
        }

        gpu_cache.print_stats("GPU");
        cpu_cache.print_stats("CPU with Prefetching");
        print_miss_rate_graph(
            gpu_cache.get_misses(),
            cpu_cache.get_misses(),
            NUM_ACCESSES
        );

    } catch(const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}