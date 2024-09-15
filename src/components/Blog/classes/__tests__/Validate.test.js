import Validate from '../Validate';

describe('Validate', () => {
  describe('coordinate', () => {
    it('should throw an error for invalid input', async () => {
      expect(() => {
        Validate.coordinate('invalid input');
      }).toThrow('Invalid coordinate format');
    });

    it('should handle positive and negative coordinates', async () => {
        const result = Validate.coordinate('40.7128,  -74.0060');
        expect(result).toEqual({ latitude: 40.7128, longitude: -74.0060 });
      });

    it('should handle positive and negative coordinates', async () => {
      const result = Validate.coordinate('40.7128,-74.0060');
      expect(result).toEqual({ latitude: 40.7128, longitude: -74.0060 });
    });

    it('should handle coordinates with more decimal places', async () => {
      const result = Validate.coordinate('[51.5085134, -0.1257653]');
      expect(result).toEqual({ latitude: 51.5085134, longitude: -0.1257653 });
    });
  });
});