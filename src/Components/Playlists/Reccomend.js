import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CgAdd } from "react-icons/cg";
import { CgRemove} from "react-icons/cg";



const getRecPl = async (token, href) => {
  try {
    console.log(href)
    console.log(token);
    const { data } = await axios.get(href + "/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data.items[0])
    const track = data.items[0].track.id
    const artist = data.items[0].track.artists[0].id
    const genre = data.items[0].track.artists
    const { data: data2 } = await axios.get("https://api.spotify.com/v1/recommendations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        seed_artists: artist,
        seed_genres: genre.map((artist) => artist.id).join(","), // assuming genre is an array
        seed_tracks: track,
      },
    });
    console.log(data2)
    return Promise.resolve(data2);
  } catch (error) {
    console.error(error.stack)
    return Promise.reject(error);
  }
};

const Reccomend = () => {
  const location = useLocation();
  const { token = '', playlist = [] } = location.state || {};
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);

  const fetchData = async () => {
    try {
      if (playlist.tracks.total > 0) {
        const recTracks = await getRecPl(token, playlist.href);
        setRecommendedTracks(recTracks.tracks);
      }
    } catch (error) {
      console.error(error.stack);
      console.error('Error fetching recommendations:', error);
    }
  };

  useEffect(() => {
    setSelectedTracks([]);
    fetchData();
  }, [token, playlist]);
  

const handleAddToSelected = (trackId) => {
  // Add the track to the selectedTracks array
  setSelectedTracks((prevSelectedTracks) => [...prevSelectedTracks, trackId]);
  setRecommendedTracks((prevRecommend) => prevRecommend.filter((id) => id !== trackId));

};

const handleRemoveSelected = (trackId) => {
  // Remove the track from the selectedTracks array
   setSelectedTracks((prevSelectedTracks) => prevSelectedTracks.filter((track) => track.id !== trackId));
  
  // Get the removed track from recommendedTracks
  const removedTrack = recommendedTracks.find((track) => track.id === trackId);
  console.log(trackId)
  console.log(selectedTracks[0].id)
  console.log(removedTrack)

  // Check if removedTrack is defined before adding it back to recommendedTracks
  if (removedTrack) {
    setRecommendedTracks((prevRecommend) => [...prevRecommend, removedTrack]);
  }
};


const refresh = () => {
  console.log(selectedTracks)
  setRecommendedTracks([]);
  fetchData();
};

return (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div>
      <h2>Recommended Tracks</h2>
      <button onClick={refresh}>Refresh</button>
  
      {recommendedTracks.map((track) => (
        <div key={track.id}>
          <label>
            {track.name} - {track.artists.map((artist) => artist.name).join(', ')}
          </label>
          
          <button onClick={() => handleAddToSelected(track)}>Add to Playlist
          <CgAdd />
          </button>
        </div>
      ))}
    </div>

    <div>
      <h3>Selected Tracks</h3>
      {selectedTracks.map((track) => (
        console.log(track),
        <div key={track.id}>
          {/* You can customize this part based on your requirements */}
          {
            <p>{track.name}</p>
          }
          <button onClick={() => handleRemoveSelected(track.id)}>
            Remove from Playlist
            <CgRemove />
          </button>
        </div>
      ))}
    </div>
  </div>
);



};


export default Reccomend;

