import React,{useState} from "react";

const HomePage = () => {
  
  const [longUrl, setLongUrl] = useState('');

  const handleSubmit = (e) => {
    
    e.preventDefault();

    console.log('URL to be shortened:', longUrl);
  };

  return (
    <div>
      <h2>URL Shortener</h2>
      <p>Enter a long URL to make it short and easy to share!</p>

      {/* 3. The Form Element */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="longUrl-input">Your Long URL:</label>
          <input
            id="longUrl-input"
            type="url" // Using type="url" provides better semantics and potential browser validation.
            placeholder="https://example.com/very/long/url/to/shorten"
            
            // 4. Controlled Component Logic
            // The 'value' of the input is directly tied to our 'longUrl' state variable.
            value={longUrl}
            
            // The 'onChange' event fires every time the user types a character.
            // We use it to call our 'setLongUrl' function, updating the state
            // with the new value from the input (e.g.target.value).
            onChange={(e) => setLongUrl(e.target.value)}
            
            required // A simple browser-level validation to ensure the field is not empty.
          />
        </div>
        <button type="submit">Shorten</button>
      </form>
    </div>
  );
};

export default HomePage;