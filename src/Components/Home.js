import React from 'react';
const Home = ({ token}) => (
  
  <div>
  {token ? (
    <div>
      <p>Welcome! You are logged in.</p>
   
    </div>
  ) : (
    <div>
      <p>Please log in to continue.</p>

    </div>
  )}
</div>
  );

  export default Home;