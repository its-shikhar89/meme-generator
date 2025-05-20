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

  function getMemeImage() {
    const randomNumber = Math.floor(Math.random() * allMemes.length);
    const url = allMemes[randomNumber].url;
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
    const canvas = await html2canvas(memeRef.current);
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'my-meme.png';
    link.click();
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
        <div className="meme-container">
          <img
            src={meme.randomImage}
            alt="Meme"
            className="meme-image"
            style={{ filter: filters[meme.filter] }}
          />
          {meme.texts.map(text => (
            <h2
              key={text.id}
              className="meme-text"
              style={{
                fontSize: `${text.fontSize}px`,
                fontFamily: text.fontFamily,
                left: `${text.x}%`,
                top: `${text.y}%`,
                transform: 'translate(-50%, -50%)'
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
