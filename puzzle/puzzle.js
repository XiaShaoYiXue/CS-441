function createTileBoard(imageSrc, boardId) {
    const board = document.getElementById(boardId);
    const rows = 4;
    const cols = 3;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('draggable', true);

            const img = document.createElement('img');
            img.src = imageSrc;

            img.style.left = `${-c * 100}%`;
            img.style.top = `${-r * 100}%`;

            tile.appendChild(img);
            board.appendChild(tile);
        }
    }
}

function initializeFridaTiles(imageSrc, boardId, poolId) {
    const board = document.getElementById(boardId);
    const pool = document.getElementById(poolId);

    const observer = new ResizeObserver(() => {
        const boardWidth = board.offsetWidth;
        const boardHeight = board.offsetHeight;

        if (boardWidth === 0 || boardHeight === 0) return;

        const rows = 4;
        const cols = 3;

        const tileWidth = boardWidth / cols;
        const tileHeight = boardHeight / rows;

        const skipTiles = [
            [0, 0],
            [1, 2],
            [2, 0],
            [3, 1]
        ];
          
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const shouldSkip = skipTiles.some(([skipR, skipC]) => skipR === r && skipC === c);
              if (shouldSkip) continue;
          
              const tile = document.createElement('div');
              tile.classList.add('tile');
              tile.setAttribute('draggable', true);
              tile.style.width = `${tileWidth}px`;
              tile.style.height = `${tileHeight}px`;
              tile.style.position = 'absolute';
          
              const maxLeft = pool.clientWidth - tileWidth;
              const maxTop = pool.clientHeight - tileHeight;
          
              tile.style.left = `${Math.random() * maxLeft}px`;
              tile.style.top = `${Math.random() * maxTop}px`;
          
              const img = document.createElement('img');
              img.src = imageSrc;
              img.style.width = `${tileWidth * cols}px`;
              img.style.height = `${tileHeight * rows}px`;
              img.style.left = `-${c * tileWidth}px`;
              img.style.top = `-${r * tileHeight}px`;
          
              tile.appendChild(img);
              pool.appendChild(tile);
            }
          }          

        observer.disconnect(); // Only run once
    });

    observer.observe(board);
}


createTileBoard('Van Gogh.jpg', 'VanGogh', false);
initializeFridaTiles('Frida.jpg', 'Frida', 'tile-pool');
