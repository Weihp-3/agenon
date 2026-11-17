// Offline Mode Service Worker untuk POS Kasir
// Deteksi koneksi dan queue transaksi saat offline

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.queue = [];
        this.init();
    }

    init() {
        // Listen untuk connection changes
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Load queue dari localStorage
        this.loadQueue();
        
        // Tampilkan status
        this.updateStatus();
    }

    handleOnline() {
        this.isOnline = true;
        console.log('Online - syncing pending transactions...');
        this.showNotification('Kembali Online', 'Menyinkronkan transaksi tertunda...', 'info');
        this.updateStatus();
        this.syncQueue();
    }

    handleOffline() {
        this.isOnline = false;
        console.log('Offline - transaksi akan disimpan');
        this.showNotification('Offline', 'Transaksi akan disimpan dan disinkronkan saat online', 'warning');
        this.updateStatus();
    }

    /**
     * Queue transaction untuk offline
     */
    async queueTransaction(cartItems, paymentMethod, customerName = null) {
        const transaction = {
            id: Date.now(),
            items: cartItems,
            payment_method: paymentMethod,
            customer_name: customerName,
            total_price: cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0),
            queued_at: new Date().toISOString(),
        };

        this.queue.push(transaction);
        this.saveQueue();

        if (this.isOnline) {
            // Jika online, langsung sync
            await this.syncSingleTransaction(transaction);
        } else {
            // Jika offline, tampilkan notifikasi
            this.showNotification(
                'Transaksi Tersimpan',
                `Transaksi akan disinkronkan saat online. ${this.queue.length} transaksi tertunda.`,
                'warning'
            );
        }

        return transaction;
    }

    /**
     * Sync single transaction
     */
    async syncSingleTransaction(transaction) {
        try {
            const response = await fetch('/offline/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    items: transaction.items,
                    payment_method: transaction.payment_method,
                    customer_name: transaction.customer_name,
                }),
            });

            if (!response.ok) throw new Error('Sync failed');
            
            const data = await response.json();
            
            // Remove from queue
            this.queue = this.queue.filter(t => t.id !== transaction.id);
            this.saveQueue();

            this.showNotification('Sinkronisasi Berhasil', 'Transaksi berhasil disinkronkan', 'success');
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            return false;
        }
    }

    /**
     * Sync all pending transactions
     */
    async syncQueue() {
        if (this.queue.length === 0) {
            console.log('No pending transactions');
            return;
        }

        console.log(`Syncing ${this.queue.length} transactions...`);

        try {
            const response = await fetch('/offline/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            if (!response.ok) throw new Error('Sync failed');

            const data = await response.json();
            
            console.log(`Sync result: ${data.synced} berhasil, ${data.failed} gagal`);
            
            // Clear queue if all synced
            if (data.failed === 0) {
                this.queue = [];
                this.saveQueue();
                this.showNotification(
                    'Sinkronisasi Selesai',
                    `${data.synced} transaksi berhasil disinkronkan`,
                    'success'
                );
            } else {
                this.showNotification(
                    'Sinkronisasi Sebagian',
                    `${data.synced} berhasil, ${data.failed} gagal. Coba lagi nanti.`,
                    'warning'
                );
            }

            this.updateStatus();
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification(
                'Sinkronisasi Gagal',
                'Coba lagi saat koneksi lebih baik',
                'error'
            );
        }
    }

    /**
     * Save queue ke localStorage
     */
    saveQueue() {
        localStorage.setItem('offline_queue', JSON.stringify(this.queue));
    }

    /**
     * Load queue dari localStorage
     */
    loadQueue() {
        const saved = localStorage.getItem('offline_queue');
        this.queue = saved ? JSON.parse(saved) : [];
    }

    /**
     * Update status display
     */
    updateStatus() {
        const statusElement = document.getElementById('offline-status');
        if (!statusElement) return;

        if (this.isOnline) {
            statusElement.innerHTML = `
                <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Online</span>
                </div>
            `;
        } else {
            statusElement.innerHTML = `
                <div class="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <i class="fa-solid fa-wifi-slash"></i>
                    <span>Offline ${this.queue.length > 0 ? `(${this.queue.length} tertunda)` : ''}</span>
                </div>
            `;
        }
    }

    /**
     * Show notification
     */
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = {
            'success': 'bg-green-100 border-green-300 text-green-700',
            'error': 'bg-red-100 border-red-300 text-red-700',
            'warning': 'bg-amber-100 border-amber-300 text-amber-700',
            'info': 'bg-blue-100 border-blue-300 text-blue-700',
        }[type] || 'bg-blue-100';

        notification.className = `${bgColor} border rounded-lg p-4 mb-4 flex items-center gap-3 animate-slideIn`;
        notification.innerHTML = `
            <i class="fa-solid fa-${
                type === 'success' ? 'check-circle' :
                type === 'error' ? 'exclamation-circle' :
                type === 'warning' ? 'triangle-exclamation' :
                'circle-info'
            }"></i>
            <div>
                <p class="font-semibold">${title}</p>
                <p class="text-sm opacity-90">${message}</p>
            </div>
        `;

        const container = document.querySelector('[role="alert"]') || document.body;
        container.insertBefore(notification, container.firstChild);

        // Auto remove setelah 5 detik
        setTimeout(() => notification.remove(), 5000);
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            pendingCount: this.queue.length,
            pending: this.queue,
        };
    }
}

// Initialize
const offlineManager = new OfflineManager();

// Register Service Worker jika browser support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}
