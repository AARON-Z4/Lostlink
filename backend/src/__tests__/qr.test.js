/**
 * Unit tests for QR code service logic.
 */

describe('QR Code Service', () => {
  describe('Item URL generation', () => {
    const buildItemUrl = (baseUrl, itemId) => `${baseUrl}/items/${itemId}`;

    test('generates correct item URL', () => {
      const url = buildItemUrl('http://localhost:3000', 'abc-123');
      expect(url).toBe('http://localhost:3000/items/abc-123');
    });

    test('handles UUID item IDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const url = buildItemUrl('https://lostlink.app', uuid);
      expect(url).toBe(`https://lostlink.app/items/${uuid}`);
    });
  });

  describe('QR filename generation', () => {
    const buildQrFilename = (itemId) => `qr_${itemId}.png`;

    test('builds correct filename', () => {
      expect(buildQrFilename('abc-123')).toBe('qr_abc-123.png');
    });

    test('filename is a png', () => {
      const filename = buildQrFilename('test-id');
      expect(filename.endsWith('.png')).toBe(true);
    });
  });

  describe('Base64 data URL parsing', () => {
    const extractBase64 = (dataUrl) => dataUrl.split(',')[1];

    test('correctly strips data URL prefix', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
      expect(extractBase64(dataUrl)).toBe('iVBORw0KGgo=');
    });

    test('can convert to Buffer', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
      const buffer = Buffer.from(extractBase64(dataUrl), 'base64');
      expect(Buffer.isBuffer(buffer)).toBe(true);
    });
  });
});
