import { getGreeting } from '../support/app.po';

describe('webaudio-spectrum-analyser', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to webaudio-spectrum-analyser!');
  });
});
