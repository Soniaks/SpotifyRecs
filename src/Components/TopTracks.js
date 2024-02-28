import React from 'react';

const TopTracks = ({ topTracks }) => {
    return (
      <table>
        <thead>
          <tr>
            <th>Track</th>
            <th>Artist</th>
            <th>Popularity</th>
          </tr>
        </thead>
        <tbody>
          {topTracks.map((track, index) => (
            <React.Fragment key={index}>
              <tr>
                <td >
                  <img src={track.album.images[0].url} alt={track.name} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  </td>
                  <td>{track.artists.map(artist => artist.name).join(', ')}</td>
                <td>{track.popularity}</td>
                
              </tr>
              <tr>
                <td>{track.name}</td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };

export default TopTracks;