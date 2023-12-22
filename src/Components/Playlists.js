import React from 'react';

const Playlists = ({ Playlists }) => {
    console.log(Playlists)
    return (
      <div>
        {Playlists.map((playlist, index) => (
          <p key={index}>{playlist.name}</p>
        ))}
      </div>
    );
  };
  
  export default Playlists;