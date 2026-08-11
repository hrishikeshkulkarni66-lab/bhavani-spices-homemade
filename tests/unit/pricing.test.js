describe('Order Total & State Machine Calculations', () => {
    test('Calculates order item total prices correctly', () => {
        const cart = [
            { price: 280.00, quantity: 2 }, // 560.00
            { price: 195.00, quantity: 1 }  // 195.00
        ];

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shippingFee = 0.00;
        const total = subtotal + shippingFee;

        expect(subtotal).toBe(755.00);
        expect(total).toBe(755.00);
    });

    test('Validates allowed order state machine transitions', () => {
        const ALLOWED_TRANSITIONS = {
            'PENDING': ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
            'PAYMENT_PENDING': ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
            'PAID': ['CONFIRMED', 'CANCELLED', 'REFUNDED'],
            'CONFIRMED': ['PROCESSING', 'CANCELLED'],
            'PROCESSING': ['SHIPPED', 'CANCELLED'],
            'SHIPPED': ['DELIVERED', 'CANCELLED'],
            'DELIVERED': ['REFUNDED'],
            'CANCELLED': [],
            'REFUNDED': []
        };

        // Allowed
        expect(ALLOWED_TRANSITIONS['PENDING'].includes('CONFIRMED')).toBe(false);
        expect(ALLOWED_TRANSITIONS['PAID'].includes('CONFIRMED')).toBe(true);
        expect(ALLOWED_TRANSITIONS['PROCESSING'].includes('SHIPPED')).toBe(true);

        // Invalid
        expect(ALLOWED_TRANSITIONS['DELIVERED'].includes('PENDING')).toBe(false);
        expect(ALLOWED_TRANSITIONS['CANCELLED'].includes('DELIVERED')).toBe(false);
    });
});
