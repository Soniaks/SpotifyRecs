import React from 'react';
const Home = ({ token, logout }) => (
    <div>
      {!token ? (
        <p>Please log in to Spotify.</p>
      ) : (
        <>
          <p>Welcome! You are logged in.</p>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  );

  export default Home;