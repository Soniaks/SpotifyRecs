import React from 'react';

const Playlists = ({ playlists }) => {
    console.log(playlists)
    return (
      <div>
        {playlists.map((playlist, index) => (
          <p key={index}>{playlist.name}</p>
        ))}
      </div>
    );
  };
  
  export default Playlists;