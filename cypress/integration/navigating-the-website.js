
describe('Navigating the Website', function() {

  it('Visits the FindIt App', function() {
  	cy.visit('/')
  	cy.contains('Login').should('have.attr', 'href', '/login')
  	cy.contains('Register').should('have.attr', 'href', '/register')
  })

  it('Can log into the FindIt App', function() {
  	cy.visit('/login')
  	cy.get('input[type="text"]').type('brian')
  	cy.get('input[type="password"]').type('password')
  	cy.get('button[type="submit"]').click()
  })

  it('Can\'t signup again with the FindIt App', function() {
  	cy.visit('/register')
  	cy.get('input[name="username"]').type('brian')
  	cy.get('input[name="email"]').type('b@g.com')
  	cy.contains('Submit').click()
  	cy.location('pathname').should('eq', '/register')
  })

  it('Can visit profile page', function() {
  	cy.visit('/login')
  	cy.get('input[type="text"]').type('brian')
  	cy.get('input[type="password"]').type('password')
  	cy.get('button[type="submit"]').click()
  	cy.visit('/profile')
  	cy.contains('Score')
  	cy.contains('Ranking')
  	cy.contains('Username')
  })

  it('Can visit leaderboard page', function() {
  	cy.visit('/login')
  	cy.get('input[type="text"]').type('brian')
  	cy.get('input[type="password"]').type('password')
  	cy.get('button[type="submit"]').click()
  	cy.visit('/leaderboard')
  	cy.contains('Score')
  	cy.contains('Ranking')
  	cy.contains('Username')
  })
});
