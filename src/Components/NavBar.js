import React from 'react';
import Container from 'react-bootstrap/Container';
import NavLink from 'react-bootstrap/esm/NavLink';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
      <Navbar bg="dark" variant="dark" fixed="top">
      <Container>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link as={Link} to = "/top-tracks">TopTracks</Nav.Link>
            <Nav.Link as={Link} to="/playlists">
              Playlists
            </Nav.Link>          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    )
  }

  export default NavBar;