import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts compatibility in JSDOM
// JSDOM doesn't support ResizeObserver, which Recharts uses for responsive containers
class ResizeObserverMock {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }

    observe(target: Element) {
        // Simulate a resize event with reasonable dimensions
        // This prevents Recharts from complaining about width/height being -1 or 0
        const entry = {
            target,
            contentRect: {
                width: 500,
                height: 300,
                top: 0,
                left: 0,
                bottom: 300,
                right: 500,
                x: 0,
                y: 0,
            },
            borderBoxSize: [{ inlineSize: 500, blockSize: 300 }],
            contentBoxSize: [{ inlineSize: 500, blockSize: 300 }],
            devicePixelContentBoxSize: [{ inlineSize: 500, blockSize: 300 }],
        } as ResizeObserverEntry;

        // Call the callback immediately with the mock entry
        setTimeout(() => {
            this.callback([entry], this as any);
        }, 0);
    }

    unobserve() {
        // Mock implementation - do nothing
    }

    disconnect() {
        // Mock implementation - do nothing
    }
}

global.ResizeObserver = ResizeObserverMock as any;

// Suppress Recharts warnings about chart dimensions in test environment
// These are expected in JSDOM and don't indicate actual problems
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('width') && message.includes('height') && message.includes('chart')) {
        return; // Suppress Recharts dimension warnings
    }
    originalWarn.apply(console, args);
};
