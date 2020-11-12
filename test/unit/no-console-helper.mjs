
beforeAll(() => {
    // Disable info in all tests
    spyOn(console, 'info').and.returnValue();
});
