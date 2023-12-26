import React from 'react';
import { useNavigate} from 'react-router-dom';

const Playlists = ({ Playlists, token}) => {
  const navigate = useNavigate();
  const navigateToRecommendations = (selectedIndex, selectedPlaylist) => {
    console.log(selectedPlaylist)
    navigate(`/recommendations/${selectedIndex}`, {
      state: { token: token, playlist: selectedPlaylist },
    });
  };
    return (
       
      <div>
           <label htmlFor="playlistDropdown">Select Playlist:</label>
      <select
        id="playlistDropdown"
        onChange={(event) => {
          const selectedIndex = event.target.value;
          const selectedPlaylist = Playlists[selectedIndex];

          // Navigate to the recommendations page with the selected playlist
          navigateToRecommendations(selectedIndex, selectedPlaylist);
        }}
      >
        {Playlists.map((playlist, index) => (
          <option key={index} value={index}>
            {playlist.name}
          </option>
        ))}
      </select>
      </div>

    );
  };
  
  export default Playlists;