import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

function MemeGenerator() {
  const [meme, setMeme] = useState({
    texts: [{
      id: 1,
      content: '',
      x: 50,
      y: 10,
      fontSize: 32,
      fontFamily: 'Impact'
    }],
    randomImage: 'http://i.imgflip.com/1bij.jpg',
    filter: 'none'
  });
  const [allMemes, setAllMemes] = useState([]);
  const memeRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const filters = {
    none: '',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    blur: 'blur(1px)',
    brightness: 'brightness(120%)'
  };

  const fonts = ['Impact', 'Arial', 'Comic Sans MS', 'Helvetica', 'Times New Roman'];

  useEffect(() => {
    fetch('https://api.imgflip.com/get_memes')
      .then(res => res.json())
      .then(data => setAllMemes(data.data.memes));
  }, []);

  function getProxiedImageUrl(url) {
    return `https://corsproxy.io/?${encodeURIComponent(url)}`;
  }

  function getMemeImage() {
    const randomNumber = Math.floor(Math.random() * allMemes.length);
    const url = allMemes[randomNumber].url;
    setImageLoaded(false);
    setMeme(prevMeme => ({
      ...prevMeme,
      randomImage: url
    }));
  }

  function handleTextChange(id, field, value) {
    setMeme(prevMeme => ({
      ...prevMeme,
      texts: prevMeme.texts.map(text =>
        text.id === id ? { ...text, [field]: value } : text
      )
    }));
  }

  function addNewText() {
    setMeme(prevMeme => ({
      ...prevMeme,
      texts: [...prevMeme.texts, {
        id: Date.now(),
        content: '',
        x: 50,
        y: 50,
        fontSize: 32,
        fontFamily: 'Impact'
      }]
    }));
  }

  function removeText(id) {
    setMeme(prevMeme => ({
      ...prevMeme,
      texts: prevMeme.texts.filter(text => text.id !== id)
    }));
  }

  async function downloadMeme() {
    if (!imageLoaded) {
      alert('Please wait for the meme image to load before downloading.');
      return;
    }
    const element = memeRef.current;
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = 'meme.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating meme:', error);
    }
  }

  return (
    <main>
      <div className="form">
        {meme.texts.map(text => (
          <div key={text.id} className="text-control-group">
            <input
              type="text"
              placeholder="Enter text"
              value={text.content}
              onChange={(e) => handleTextChange(text.id, 'content', e.target.value)}
            />
            <div className="position-controls">
              <input
                type="range"
                min="0"
                max="100"
                value={text.x}
                onChange={(e) => handleTextChange(text.id, 'x', e.target.value)}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={text.y}
                onChange={(e) => handleTextChange(text.id, 'y', e.target.value)}
              />
              <select
                value={text.fontFamily}
                onChange={(e) => handleTextChange(text.id, 'fontFamily', e.target.value)}
              >
                {fonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Font size"
                value={text.fontSize}
                onChange={(e) => handleTextChange(text.id, 'fontSize', e.target.value)}
                min="20"
                max="80"
              />
              <button onClick={() => removeText(text.id)}>Remove Text</button>
            </div>
          </div>
        ))}

        <button onClick={addNewText}>Add New Text</button>

        <select
          name="filter"
          value={meme.filter}
          onChange={(e) => setMeme(prev => ({ ...prev, filter: e.target.value }))}
        >
          {Object.keys(filters).map(filter => (
            <option key={filter} value={filter}>{filter}</option>
          ))}
        </select>

        <button onClick={getMemeImage}>Get a new meme image 🖼</button>
        <button onClick={downloadMeme}>Download Meme 💾</button>
      </div>

      <div className="meme" ref={memeRef}>
        <div className="meme-container" style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={getProxiedImageUrl(meme.randomImage)}
            alt="Meme"
            className="meme-image"
            style={{
              filter: filters[meme.filter],
              maxWidth: '100%',
              display: 'block'
            }}
            crossOrigin="anonymous"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
          />
          {meme.texts.map(text => (
            <h2
              key={text.id}
              className="meme-text"
              style={{
                position: 'absolute',
                fontSize: `${text.fontSize}px`,
                fontFamily: text.fontFamily,
                left: `${text.x}%`,
                top: `${text.y}%`,
                transform: 'translate(-50%, -50%)',
                margin: 0,
                padding: '0 5px',
                textAlign: 'center',
                color: 'white',
                textShadow: `
                  2px 2px 0 #000,
                  -2px -2px 0 #000,
                  2px -2px 0 #000,
                  -2px 2px 0 #000,
                  0 2px 0 #000,
                  2px 0 0 #000,
                  0 -2px 0 #000,
                  -2px 0 0 #000
                `
              }}
            >
              {text.content}
            </h2>
          ))}
        </div>
      </div>
    </main>
  );
}

export default MemeGenerator;
