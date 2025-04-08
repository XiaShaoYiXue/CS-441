const rows = 4;
const cols = 3;

function createDropzones(boardId) {
  const board = document.getElementById(boardId);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dropzone = document.createElement('div');
      dropzone.classList.add('tile-dropzone');
      dropzone.dataset.row = r;
      dropzone.dataset.col = c;
      board.appendChild(dropzone);
    }
  }
}

function initializeFridaTiles(imageSrc, boardId, poolId) {
  const board = document.getElementById(boardId);
  const pool = document.getElementById(poolId);

  const observer = new ResizeObserver(() => {
    const boardWidth = board.offsetWidth;
    const boardHeight = board.offsetHeight;
    if (!boardWidth || !boardHeight) return;

    const tileWidth = boardWidth / cols;
    const tileHeight = boardHeight / rows;

    const skipTiles = [
      [0, 0], [1, 2],
      [2, 0], [3, 1]
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (skipTiles.some(([sr, sc]) => sr === r && sc === c)) continue;

        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.setAttribute('draggable', true);
        tile.dataset.row = r;
        tile.dataset.col = c;

        tile.style.width = `${tileWidth}px`;
        tile.style.height = `${tileHeight}px`;
        tile.style.backgroundImage = `url('${imageSrc}')`;
        tile.style.backgroundSize = `${tileWidth * cols}px ${tileHeight * rows}px`;
        tile.style.backgroundPosition = `-${c * tileWidth}px -${r * tileHeight}px`;
        tile.style.position = 'absolute';

        const randX = Math.random() * (pool.clientWidth - tileWidth);
        const randY = Math.random() * (pool.clientHeight - tileHeight);
        tile.style.left = `${randX}px`;
        tile.style.top = `${randY}px`;
        tile.dataset.originX = randX;
        tile.dataset.originY = randY;

        pool.appendChild(tile);
      }
    }

    observer.disconnect();
  });

  observer.observe(board);
}

// Check if puzzle is fully completed
function checkPuzzleComplete() {
  const dropzones = document.querySelectorAll('.tile-dropzone');
  let correctCount = 0;

  dropzones.forEach(zone => {
    const tile = zone.querySelector('.tile');
    if (tile && parseInt(tile.dataset.row) === parseInt(zone.dataset.row) && parseInt(tile.dataset.col) === parseInt(zone.dataset.col)) {
      correctCount++;
    }
  });

  if (correctCount === 8) {
    document.getElementById('poem-reveal').classList.add('show');
  }
}

// Drag Logic
document.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('tile')) {
    const tile = e.target;
    e.dataTransfer.setData('text/plain', JSON.stringify({
      row: tile.dataset.row,
      col: tile.dataset.col,
      originX: tile.style.left,
      originY: tile.style.top
    }));
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    tile.classList.add('dragging');
  }
});

document.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('tile')) {
    e.target.classList.remove('dragging');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  createDropzones('Frida');

  document.querySelectorAll('.tile-dropzone').forEach(dropzone => {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('hovered');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('hovered');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('hovered');

      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const dropRow = parseInt(dropzone.dataset.row);
      const dropCol = parseInt(dropzone.dataset.col);
      const tile = document.querySelector('.tile.dragging');

      if (parseInt(data.row) === dropRow && parseInt(data.col) === dropCol) {
        tile.style.position = 'absolute';
        tile.style.left = '0';
        tile.style.top = '0';
        tile.style.width = '100%';
        tile.style.height = '100%';
        dropzone.appendChild(tile);

        checkPuzzleComplete(); // Trigger poem check here
      } else {
        // return to origin
        tile.style.left = data.originX;
        tile.style.top = data.originY;
      }
    });
  });

  initializeFridaTiles('Frida.jpg', 'Frida', 'tile-pool');
});
