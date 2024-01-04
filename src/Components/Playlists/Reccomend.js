import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CgAdd } from "react-icons/cg";
import { CgRemove} from "react-icons/cg";



const getRecPl = async (token, data, dance, en, loud, temp) => {
  try {
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
        target_danceability: dance,
        target_energy: en,
        target_loudness: loud,
        target_tempo: temp,

      },
    });
    return Promise.resolve(data2);
  } catch (error) {
    console.error(error.stack)
    return Promise.reject(error);
  }
};

const getInfo = async (token, playlist) => {
  try{
  const { data: data } = await axios.get("https://api.spotify.com/v1/audio-features?", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        ids: playlist.items.map((track) => track.track.id).join(","),
      },
    });
    console.log(data)
    
    return Promise.resolve(data);
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
  const [loading, setLoading] = useState(true);
  const [dancability, setDancability] = useState();
  const [energy, setEnergy] = useState();
  const [loudness, setLoudness] = useState();
  const [tempo, setTempo] = useState();

  const fetchData = async () => {
    setLoading(true);
    try {
      if (playlist.tracks.total > 0) {
        const { data } = await axios.get(playlist.href + "/tracks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const info = await getInfo(token, data);
        let dance = 0;
        let en = 0;
        let loud = 0;
        let temp = 0;
        for(const track of info.audio_features){
          dance += track.danceability;
          en += track.energy;
          loud += track.loudness;
          temp += track.tempo;
        }
        
        setDancability((dance / info.audio_features.length).toFixed(2));
        setEnergy((en / info.audio_features.length).toFixed(2));
        setLoudness((loud / info.audio_features.length).toFixed(2));
        setTempo((temp / info.audio_features.length).toFixed(2));
        const recTracks = await getRecPl(token, data, dancability, energy, loudness, tempo);
        setRecommendedTracks(recTracks.tracks);
      }
    } catch (error) {
      console.error(error.stack);
      console.error('Error fetching recommendations:', error);
    }
    setLoading(false);
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

  // Check if removedTrack is defined before adding it back to recommendedTracks
  if (removedTrack) {
    setRecommendedTracks((prevRecommend) => [...prevRecommend, removedTrack]);
  }
};


const refresh = () => {
  setRecommendedTracks([]);
  fetchData();
};
const addSelected = async (selectedTracks) => {
  try{
  const { data: data } = await axios.post("https://api.spotify.com/v1/playlists/"+ playlist.name + "/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        uris: selectedTracks.map((track) => track.uri).join(","), // assuming genre is an array


      },
    });
    return Promise.resolve(data);
  }catch(error){
    console.error(error.stack)
    return Promise.reject(error);
  }
}
return (
  
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    {loading ? (
      <p>Loading...</p>
    ) : (
      <>
      <div>
      <h1 style={{justifyContent: 'center'}}>{playlist.name}</h1>
      <label>Dancability: {dancability}</label>
      <div/><label>Energy: {energy}</label>
      <div/><label>Loudness: {loudness}</label>
      <div/><label>Tempo: {tempo}</label>



      </div>

        <div>
          <h1></h1>
          <h2>Recommended Tracks</h2>
          <button onClick={refresh}>Refresh</button>
  
          {recommendedTracks.map((track) => (
            <div key={track.id}>
              <img src={track.album.images[0].url} alt={track.name} style={{ maxWidth: '40px', maxHeight: '40px' }} />
  
              <label>
                {track.name} - {track.artists.map((artist) => artist.name).join(', ')}
              </label>
              
              
              <button onClick={() => handleAddToSelected(track)}>
                <CgAdd />
              </button>
            </div>
          ))}
        </div>
  
        <div>
          <h1></h1>
          <h2>Selected Tracks</h2>
          {selectedTracks.map((track) => (
            <div key={track.id}>
              <img src={track.album.images[0].url} alt={track.name} style={{ maxWidth: '40px', maxHeight: '40px' }} />

              {/* You can customize this part based on your requirements */}
              <label>{track.name}</label>
              <button onClick={() => handleRemoveSelected(track.id)}>
                <CgRemove style={{ color: 'green' }} />
              </button>
            </div>
          ))}
          <div><button onClick={() => addSelected(selectedTracks)}>
                <label>add tracks</label>
              </button></div>
        </div>
      </>
    )}
  </div>
);
          }

export default Reccomend;

