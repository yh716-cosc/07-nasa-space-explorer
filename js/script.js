// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// NASA APOD API base URL and demo API key
const API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = '9CjYysqFtwftql6RFKZJ23z8p46HNZdEL9lMRpks';

// Add a click event to the button
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Calculate the difference in days between start and end date
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end

  // Set the maximum allowed range (30 days)
  const MAX_DAYS = 9;
  if (diffDays > MAX_DAYS) {
    gallery.innerHTML = `<p>Please select a date range of ${MAX_DAYS} days or less.</p>`;
    return;
  }

  // Show loading message
  gallery.innerHTML = '<p style="font-size:1.2em; color:#666;">Loading space images...</p>';

  // Build the API URL with query parameters, including thumbs=true for video thumbnails
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  // Fetch data from NASA APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery (remove loading message)
      gallery.innerHTML = '';

      // Check if we got an array of images
      if (Array.isArray(data)) {
        // Loop through each item and add to the gallery
        data.forEach(item => {
          // Create a container for the gallery item
          const container = document.createElement('div');
          container.className = 'gallery-item';

          // If the item is an image
          if (item.media_type === 'image') {
            // Create an image element
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.title;
            img.className = 'apod-image';
            container.appendChild(img);
          } else if (item.media_type === 'video') {
            // If the item is a video, show a thumbnail if available, otherwise a video icon
            const thumb = item.thumbnail_url || item.url || '';
            const img = document.createElement('img');
            img.src = item.thumbnail_url || 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png'; // fallback icon
            img.alt = 'Video thumbnail';
            img.className = 'apod-image';
            container.appendChild(img);

            // Add a play icon overlay
            const playIcon = document.createElement('span');
            playIcon.textContent = '▶';
            playIcon.style.position = 'absolute';
            playIcon.style.left = '50%';
            playIcon.style.top = '50%';
            playIcon.style.transform = 'translate(-50%, -50%)';
            playIcon.style.fontSize = '3em';
            playIcon.style.color = 'white';
            playIcon.style.textShadow = '0 0 8px #000';
            playIcon.style.pointerEvents = 'none';
            playIcon.className = 'apod-play-icon';
            container.style.position = 'relative';
            container.appendChild(playIcon);
          }

          // Create a caption
          const caption = document.createElement('p');
          caption.textContent = item.title;
          container.appendChild(caption);

          // Add click event to open modal with details
          container.addEventListener('click', () => {
            openModal(item);
          });

          // Add to the gallery
          gallery.appendChild(container);
        });
      } else {
        // If not an array, show an error message
        gallery.innerHTML = '<p>No images found for this date range.</p>';
      }
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<p>Error: ${error.message}</p>`;
    });
});

// Modal functions
// Create modal HTML if it doesn't exist
let modal = document.getElementById('apod-modal');
if (!modal) {
  modal = document.createElement('div');
  modal.id = 'apod-modal';
  modal.className = 'apod-modal';
  modal.innerHTML = `
    <div id="apod-modal-content" class="apod-modal-content">
      <button id="apod-modal-close" class="apod-modal-close">&times;</button>
      <img id="apod-modal-img" class="apod-modal-img" src="" alt="" />
      <h2 id="apod-modal-title"></h2>
      <p id="apod-modal-date" class="apod-modal-date"></p>
      <p id="apod-modal-explanation" class="apod-modal-explanation"></p>
    </div>
  `;
  document.body.appendChild(modal);
}

// Function to open the modal with image or video details
function openModal(item) {
  const modalImg = document.getElementById('apod-modal-img');
  const modalTitle = document.getElementById('apod-modal-title');
  const modalDate = document.getElementById('apod-modal-date');
  const modalExplanation = document.getElementById('apod-modal-explanation');

  // If it's an image
  if (item.media_type === 'image') {
    modalImg.style.display = 'block';
    modalImg.src = item.hdurl || item.url;
    modalImg.alt = item.title;
    // Remove any video iframe if present
    const oldIframe = document.getElementById('apod-modal-iframe');
    if (oldIframe) oldIframe.remove();
  } else if (item.media_type === 'video') {
    // Hide the image
    modalImg.style.display = 'none';
    // Remove old iframe if present
    let oldIframe = document.getElementById('apod-modal-iframe');
    if (oldIframe) oldIframe.remove();
    // Create and insert a new iframe for the video
    const iframe = document.createElement('iframe');
    iframe.id = 'apod-modal-iframe';
    iframe.src = item.url;
    iframe.width = '100%';
    iframe.height = '350';
    iframe.style.border = 'none';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    // Insert iframe after the image
    modalImg.parentNode.insertBefore(iframe, modalImg.nextSibling);
  }
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.style.display = 'flex';
}

// Close modal when clicking the close button or outside the content
modal.addEventListener('click', function(event) {
  if (event.target === modal || event.target.id === 'apod-modal-close') {
    modal.style.display = 'none';
  }
});
