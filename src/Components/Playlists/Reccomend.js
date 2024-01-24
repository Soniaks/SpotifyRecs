import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CgAdd } from "react-icons/cg";
import { CgRemove} from "react-icons/cg";
import {GrRefresh} from "react-icons/gr";
import { IconContext } from "react-icons";



const getRecPl = async (token, data, dance, en, loud, temp, tracks, artists) => {
  try {
    console.log(tracks);
    console.log(dance);
    console.log(artists);
    let params = {
      limit: 50,
      seed_artists: data.items[0].track.artists[0].id,
      seed_genres: data.items[0].track.artists.map((artist) => artist.id).join(","),
      target_danceability: dance,
      target_energy: en,
      target_loudness: loud,
      target_tempo: temp,
    };

    // Include seed_tracks if tracks are provided
    if (tracks && tracks.length > 0) {
      params.seed_tracks = tracks.join(",");
      params.seed_artists = artists;
    } else {
      params.seed_tracks = data.items[0].track.id;
    }
    console.log(params);
    console.log(params.seed_tracks);
    const { data: data2 } = await axios.get("https://api.spotify.com/v1/recommendations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params,
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
    
    return Promise.resolve(data);
  } catch (error) {
    console.error(error.stack)
    return Promise.reject(error);
  }

 
};

const getPlaylist = async (token, playlist) => {
  try{
  const { data } = await axios.get(playlist.href + "/tracks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return Promise.resolve(data);
}catch (error) {
  console.error(error.stack)
  return Promise.reject(error);
}
};

const Reccomend = () => {
  const location = useLocation();
  const { token = '', playlist = [] } = location.state || {};
  const [playlistTracks, setPlaylistTracks] = useState([]); //tracks in playlist
  const [recommendedTracks, setRecommendedTracks] = useState([]); //tracks to reccomend
  const [selectedTracks, setSelectedTracks] = useState([]); //tracks to add
  const [loading, setLoading] = useState(true); 
  const [dancability, setDancability] = useState();
  const [energy, setEnergy] = useState();
  const [loudness, setLoudness] = useState();
  const [tempo, setTempo] = useState();
  const [tracksForRecs, setTracksForRecs] = useState([]); //songs to use in reccomendation
  const [artistForRecs, setArtistForRecs] = useState(""); //songs to use in reccomendation

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPlaylist(token, playlist);
      console.log(data.items);
      setPlaylistTracks(data.items);
      
        const info = await getInfo(token, data);
        let dance = 0;
        let en = 0;
        let loud = 0;
        let temp = 0;
        console.log(info.audio_features)
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
        const recTracks = await getRecPl(token, data, dancability, energy, loudness, tempo, tracksForRecs, artistForRecs);
        const uniqueRecTracks = recTracks.tracks.filter((recTrack) => {
          return !data.items.some((playlistTrack) => playlistTrack.track.id === recTrack.id);
        });
    
        setRecommendedTracks(uniqueRecTracks);
        setTracksForRecs([]);

      
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
  
  const updateValue = (parameter, setValue) => (event) => {
    setValue(event.target.value);
  };

const handleAddToSelected = (trackId) => {
  // Add the track to the selectedTracks array
  setSelectedTracks((prevSelectedTracks) => [...prevSelectedTracks, trackId]);
  setRecommendedTracks((prevRecommend) => prevRecommend.filter((id) => id !== trackId));

};

const handleChooseSong = (track) => {
  // Check if the song is already selected
  console.log(track);

  const trackId = track.track.id;
  const artistId = track.track.artists[0]?.id; // Using optional chaining to avoid errors if artists[0] is undefined

  console.log(trackId);
  console.log(artistId);

  if (tracksForRecs.includes(trackId)) {
    console.log(tracksForRecs);
    setTracksForRecs((prevSelected) => prevSelected.filter((id) => id !== trackId));
    
    if (artistId) {
      setArtistForRecs(artistId);
      console.log(artistForRecs);
    }
  } else {
    console.log(artistForRecs);

    // Check if the number of selected songs is less than 2
    if (tracksForRecs.length < 2 && artistId) {
      setTracksForRecs((prevSelected) => [...prevSelected, trackId]);
      setArtistForRecs(artistId);
    }

    console.log(tracksForRecs);
    console.log(artistForRecs);
  }
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
const { data: data } = await axios({
      method: 'post',
      url: "https://api.spotify.com/v1/playlists/"+ playlist.id + "/tracks",
      headers: { 'Authorization': 'Bearer ' + token },
      params: {
        uris: selectedTracks.map((track) => track.uri).join(","), // assuming genre is an array


      },
  });
  setSelectedTracks([]); 
    return Promise.resolve(data);
  }catch(error){
    console.error(error.stack)
    return Promise.reject(error);
  }
}
return (
  
  <div>
    {loading ? (
      <p>Loading...</p>
    ) : (
      <>
      <h1></h1>
      <IconContext.Provider
      value={{ color: 'green', size: '25px', style: { backgroundColor: '#282c34' } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
  <h1 style={{ justifyContent: 'center' }}>{playlist.name}        <button style={{ marginLeft: 'auto'}} onClick={refresh}><GrRefresh/></button>
</h1>
  <p>Set Dancability and Energy to be used in Reccomendation</p>
  

  <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '60%', marginTop: '20px' }}>
  <div/><label>Dancability: <span>{dancability}</span></label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={dancability}
        onChange={updateValue('dancability', setDancability)}
      />
      <div/><label>Energy: <span>{energy}</span></label>
      <input
      type="range"
      min="0"
        max="1"
        value={energy}
        step="0.01"
        onChange={updateValue('energy', setEnergy)}
      />
      <div/><label>Loudness: {loudness}</label>
     
      <div/><label>Tempo: {tempo}</label>
      
      <div/> 
      </div>
      <div style={{ display: 'flex', flexDirection: 'row'  }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2>Tracks</h2>
      <p>Select 1-2 tracks to be used in recommendations</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

      {playlistTracks.map((track) => (
            <div key={track.id}>
              <img src={track.track.album.images[0].url} alt={track.track.name} style={{ maxWidth: '40px', maxHeight: '40px' }}/>
  
              <label>
                {track.track.name} - {track.track.artists.map((artist) => artist.name).join(', ')}
              </label>
              <button onClick={() => handleChooseSong(track)}>
                {tracksForRecs.includes(track.track.id) ? 'Deselect' : 'Select'}
              </button>
              
              
            </div>
          ))}
          </div>
 </div>

        <div>
          <h1></h1>
          <h2>Recommended Tracks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

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
        </div>
  
        <div>
          <h1></h1>
          <h2>Selected Tracks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

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
          </div>
          <div><button onClick={() => addSelected(selectedTracks)}>
                <label>add tracks to playlist</label>
              </button></div>
        </div>
        </div>
        </div>
        </IconContext.Provider>
      </>
    )}
  </div>
);
          }

export default Reccomend;

