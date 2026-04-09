import { vi, expect, it } from 'vitest';

const { scannerRender, scannerClear } = vi.hoisted(() => ({
    scannerRender: vi.fn(),
    scannerClear: vi.fn().mockResolvedValue('cleared'),
}));

vi.mock('html5-qrcode', () => ({
    Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
        render: scannerRender,
        clear: scannerClear
    }))
}));

import { Html5QrcodeScanner } from 'html5-qrcode';

it('should work as expected', async () => {
    const s = new Html5QrcodeScanner('id', {}, false);
    expect(s.render).toBeDefined();
    expect(s.clear).toBeDefined();
    const res = await s.clear();
    expect(res).toBe('cleared');
});
